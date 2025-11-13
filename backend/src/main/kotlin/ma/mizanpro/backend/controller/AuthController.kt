package ma.mizanpro.backend.controller

import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import ma.mizanpro.backend.dto.*
import ma.mizanpro.backend.service.AuthService
import mu.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<AuthResponse> {
        logger.info { "Login attempt for email: ${request.email}" }
        val response = authService.login(request, httpRequest)
        return if (response.success) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.status(401).body(response)
        }
    }

    @PostMapping("/register")
    fun register(
        @Valid @RequestBody request: RegisterRequest
    ): ResponseEntity<AuthResponse> {
        logger.info { "Registration attempt for email: ${request.email}" }
        val response = authService.register(request)
        return if (response.success) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.badRequest().body(response)
        }
    }

    @PostMapping("/refresh")
    fun refreshToken(
        @Valid @RequestBody request: RefreshTokenRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<AuthResponse> {
        val response = authService.refreshToken(request, httpRequest)
        return if (response.success) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.status(401).body(response)
        }
    }

    @PostMapping("/logout")
    fun logout(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<MessageResponse> {
        val response = authService.logout(userDetails.username)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/change-password")
    fun changePassword(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @RequestBody request: ChangePasswordRequest
    ): ResponseEntity<MessageResponse> {
        val response = authService.changePassword(userDetails.username, request)
        return if (response.success) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.badRequest().body(response)
        }
    }

    @GetMapping("/me")
    fun getCurrentUser(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(
            mapOf(
                "id" to userDetails.username,
                "authorities" to userDetails.authorities.map { it.authority }
            )
        )
    }
}
