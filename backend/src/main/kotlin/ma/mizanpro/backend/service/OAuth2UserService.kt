package ma.mizanpro.backend.service

import ma.mizanpro.backend.entity.User
import ma.mizanpro.backend.entity.UserRole
import ma.mizanpro.backend.repository.UserRepository
import mu.KotlinLogging
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service
import java.time.LocalDateTime

private val logger = KotlinLogging.logger {}

@Service
class OAuth2UserService(
    private val userRepository: UserRepository
) : DefaultOAuth2UserService() {

    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
        val oauth2User = super.loadUser(userRequest)

        // Process OAuth2 user
        processOAuth2User(userRequest, oauth2User)

        return oauth2User
    }

    private fun processOAuth2User(userRequest: OAuth2UserRequest, oauth2User: OAuth2User): User {
        val registrationId = userRequest.clientRegistration.registrationId
        val attributes = oauth2User.attributes

        val email = attributes["email"] as? String
            ?: throw IllegalArgumentException("Email not found from OAuth2 provider")

        val providerId = attributes["sub"] as? String ?: attributes["id"] as? String
            ?: throw IllegalArgumentException("Provider ID not found")

        // Check if user exists
        val existingUser = userRepository.findByOauthProviderAndOauthProviderId(registrationId, providerId)

        return if (existingUser.isPresent) {
            // Update existing user
            val user = existingUser.get()
            user.lastLoginAt = LocalDateTime.now()
            userRepository.save(user)
            logger.info { "Existing OAuth2 user logged in: $email" }
            user
        } else {
            // Check if email already exists
            val emailUser = userRepository.findByEmail(email)
            if (emailUser.isPresent) {
                // Link OAuth2 account to existing email account
                val user = emailUser.get()
                user.oauthProvider = registrationId
                user.oauthProviderId = providerId
                user.isEmailVerified = true
                user.lastLoginAt = LocalDateTime.now()
                userRepository.save(user)
                logger.info { "Linked OAuth2 account to existing user: $email" }
                user
            } else {
                // Create new user
                val firstName = attributes["given_name"] as? String ?: ""
                val lastName = attributes["family_name"] as? String ?: ""
                val name = attributes["name"] as? String ?: email
                val avatarUrl = attributes["picture"] as? String

                val newUser = User(
                    email = email,
                    firstName = firstName.ifEmpty { name.split(" ").firstOrNull() ?: "User" },
                    lastName = lastName.ifEmpty { name.split(" ").lastOrNull() ?: "" },
                    oauthProvider = registrationId,
                    oauthProviderId = providerId,
                    role = UserRole.USER,
                    isActive = true,
                    isEmailVerified = true,
                    avatarUrl = avatarUrl,
                    language = "fr",
                    timezone = "Africa/Casablanca"
                )

                userRepository.save(newUser)
                logger.info { "New OAuth2 user created: $email" }
                newUser
            }
        }
    }
}
