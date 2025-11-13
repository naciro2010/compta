package ma.mizanpro.backend.service

import ma.mizanpro.backend.entity.User
import ma.mizanpro.backend.entity.UserRole
import ma.mizanpro.backend.repository.UserRepository
import mu.KotlinLogging
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.LocalDateTime

private val logger = KotlinLogging.logger {}

@Service
class DataInitializationService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        initializeAdminUser()
    }

    private fun initializeAdminUser() {
        val adminEmail = "admin@mizanpro.ma"

        if (userRepository.findByEmail(adminEmail).isEmpty) {
            val adminUser = User(
                email = adminEmail,
                firstName = "Super",
                lastName = "Admin",
                passwordHash = passwordEncoder.encode("admin123"),
                role = UserRole.SUPER_ADMIN,
                isActive = true,
                isLocked = false,
                isEmailVerified = true,
                language = "fr",
                timezone = "Africa/Casablanca",
                mustChangePassword = false,
                passwordChangedAt = LocalDateTime.now()
            )

            userRepository.save(adminUser)
            logger.info { "✅ Admin user created: $adminEmail / admin123" }
        } else {
            logger.info { "Admin user already exists: $adminEmail" }
        }
    }
}
