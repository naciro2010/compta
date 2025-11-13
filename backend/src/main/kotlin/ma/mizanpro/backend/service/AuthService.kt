package ma.mizanpro.backend.service

import jakarta.servlet.http.HttpServletRequest
import ma.mizanpro.backend.dto.*
import ma.mizanpro.backend.entity.RefreshToken
import ma.mizanpro.backend.entity.User
import ma.mizanpro.backend.entity.UserRole
import ma.mizanpro.backend.repository.RefreshTokenRepository
import ma.mizanpro.backend.repository.UserRepository
import ma.mizanpro.backend.security.JwtTokenProvider
import mu.KotlinLogging
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.AuthenticationException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

private val logger = KotlinLogging.logger {}

@Service
@Transactional
class AuthService(
    private val userRepository: UserRepository,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val authenticationManager: AuthenticationManager
) {

    fun login(request: LoginRequest, httpRequest: HttpServletRequest): AuthResponse {
        try {
            // Find user by email
            val user = userRepository.findByEmail(request.email)
                .orElseThrow { BadCredentialsException("Email ou mot de passe incorrect") }

            // Check if account is active
            if (!user.isActive) {
                return AuthResponse(
                    success = false,
                    message = "Votre compte est désactivé. Contactez un administrateur."
                )
            }

            // Check if account is locked
            if (user.isAccountLocked()) {
                return AuthResponse(
                    success = false,
                    message = "Votre compte est verrouillé suite à plusieurs tentatives échouées. Contactez un administrateur."
                )
            }

            // Verify password
            if (!passwordEncoder.matches(request.password, user.passwordHash)) {
                user.incrementFailedAttempts()
                userRepository.save(user)

                val remainingAttempts = 5 - user.failedLoginAttempts
                return AuthResponse(
                    success = false,
                    message = if (user.isLocked) {
                        "Compte verrouillé suite à trop de tentatives échouées."
                    } else {
                        "Email ou mot de passe incorrect. $remainingAttempts tentative(s) restante(s)."
                    }
                )
            }

            // Authenticate
            authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(user.id, request.password)
            )

            // Reset failed attempts
            user.resetFailedAttempts()
            user.lastLoginAt = LocalDateTime.now()
            user.lastLoginIp = getClientIp(httpRequest)
            userRepository.save(user)

            // Generate tokens
            val accessToken = jwtTokenProvider.generateAccessToken(user.id!!)
            val refreshToken = createRefreshToken(user.id!!, httpRequest)

            logger.info { "User ${user.email} logged in successfully" }

            return AuthResponse(
                success = true,
                accessToken = accessToken,
                refreshToken = refreshToken.token,
                user = mapToUserDTO(user),
                requiresPasswordChange = user.mustChangePassword,
                requiresEmailVerification = !user.isEmailVerified
            )

        } catch (ex: AuthenticationException) {
            logger.error(ex) { "Authentication failed for email: ${request.email}" }
            return AuthResponse(
                success = false,
                message = "Email ou mot de passe incorrect"
            )
        }
    }

    fun register(request: RegisterRequest): AuthResponse {
        // Check if email already exists
        if (userRepository.existsByEmail(request.email)) {
            return AuthResponse(
                success = false,
                message = "Un compte avec cet email existe déjà"
            )
        }

        // Create new user
        val user = User(
            email = request.email,
            firstName = request.firstName,
            lastName = request.lastName,
            passwordHash = passwordEncoder.encode(request.password),
            role = UserRole.USER,
            isActive = true,
            isEmailVerified = false,
            language = request.language,
            timezone = request.timezone,
            mustChangePassword = false,
            passwordChangedAt = LocalDateTime.now()
        )

        val savedUser = userRepository.save(user)
        logger.info { "New user registered: ${savedUser.email}" }

        // Generate tokens
        val accessToken = jwtTokenProvider.generateAccessToken(savedUser.id!!)
        val refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.id!!)

        return AuthResponse(
            success = true,
            message = "Compte créé avec succès",
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = mapToUserDTO(savedUser),
            requiresEmailVerification = true
        )
    }

    fun refreshToken(request: RefreshTokenRequest, httpRequest: HttpServletRequest): AuthResponse {
        try {
            // Validate refresh token
            if (!jwtTokenProvider.validateToken(request.refreshToken)) {
                return AuthResponse(
                    success = false,
                    message = "Refresh token invalide ou expiré"
                )
            }

            // Get user from token
            val userId = jwtTokenProvider.getUserIdFromToken(request.refreshToken)
            val user = userRepository.findById(userId)
                .orElseThrow { BadCredentialsException("Utilisateur non trouvé") }

            // Check if refresh token exists and is valid
            val refreshToken = refreshTokenRepository.findByToken(request.refreshToken)
                .orElseThrow { BadCredentialsException("Refresh token non trouvé") }

            if (!refreshToken.isValid()) {
                return AuthResponse(
                    success = false,
                    message = "Refresh token invalide ou révoqué"
                )
            }

            // Generate new tokens
            val newAccessToken = jwtTokenProvider.generateAccessToken(user.id!!)
            val newRefreshToken = createRefreshToken(user.id!!, httpRequest)

            // Revoke old refresh token
            refreshToken.revoked = true
            refreshToken.revokedAt = LocalDateTime.now()
            refreshTokenRepository.save(refreshToken)

            return AuthResponse(
                success = true,
                accessToken = newAccessToken,
                refreshToken = newRefreshToken.token,
                user = mapToUserDTO(user)
            )

        } catch (ex: Exception) {
            logger.error(ex) { "Token refresh failed" }
            return AuthResponse(
                success = false,
                message = "Échec du rafraîchissement du token"
            )
        }
    }

    fun logout(userId: String): MessageResponse {
        // Revoke all refresh tokens for user
        refreshTokenRepository.revokeAllByUserId(userId, LocalDateTime.now())
        logger.info { "User $userId logged out" }

        return MessageResponse(
            success = true,
            message = "Déconnexion réussie"
        )
    }

    fun changePassword(userId: String, request: ChangePasswordRequest): MessageResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { BadCredentialsException("Utilisateur non trouvé") }

        // Verify old password
        if (!passwordEncoder.matches(request.oldPassword, user.passwordHash)) {
            return MessageResponse(
                success = false,
                message = "Ancien mot de passe incorrect"
            )
        }

        // Update password
        user.passwordHash = passwordEncoder.encode(request.newPassword)
        user.mustChangePassword = false
        user.passwordChangedAt = LocalDateTime.now()
        userRepository.save(user)

        // Revoke all refresh tokens
        refreshTokenRepository.revokeAllByUserId(userId, LocalDateTime.now())

        logger.info { "Password changed for user: ${user.email}" }

        return MessageResponse(
            success = true,
            message = "Mot de passe modifié avec succès"
        )
    }

    private fun createRefreshToken(userId: String, httpRequest: HttpServletRequest): RefreshToken {
        val token = jwtTokenProvider.generateRefreshToken(userId)
        val expiresAt = LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshExpirationTime() / 1000)

        val refreshToken = RefreshToken(
            token = token,
            userId = userId,
            expiresAt = expiresAt,
            ipAddress = getClientIp(httpRequest),
            userAgent = httpRequest.getHeader("User-Agent")
        )

        return refreshTokenRepository.save(refreshToken)
    }

    private fun getClientIp(request: HttpServletRequest): String {
        val xForwardedFor = request.getHeader("X-Forwarded-For")
        return if (xForwardedFor != null && xForwardedFor.isNotEmpty()) {
            xForwardedFor.split(",")[0].trim()
        } else {
            request.remoteAddr
        }
    }

    private fun mapToUserDTO(user: User): UserDTO {
        return UserDTO(
            id = user.id!!,
            email = user.email,
            firstName = user.firstName,
            lastName = user.lastName,
            fullName = user.getFullName(),
            role = user.role,
            isActive = user.isActive,
            isEmailVerified = user.isEmailVerified,
            language = user.language,
            timezone = user.timezone,
            phone = user.phone,
            avatarUrl = user.avatarUrl,
            defaultEstablishmentId = user.defaultEstablishmentId,
            createdAt = user.createdAt.format(DateTimeFormatter.ISO_DATE_TIME)
        )
    }
}
