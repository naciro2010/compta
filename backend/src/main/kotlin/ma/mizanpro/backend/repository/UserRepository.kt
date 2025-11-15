package ma.mizanpro.backend.repository

import ma.mizanpro.backend.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, String> {
    fun findByEmail(email: String): Optional<User>
    fun findByOauthProviderAndOauthProviderId(provider: String, providerId: String): Optional<User>
    fun existsByEmail(email: String): Boolean

    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.deletedAt IS NULL")
    fun findAllActive(): List<User>

    @Query("SELECT u FROM User u WHERE u.lockedUntil < :now AND u.isLocked = true")
    fun findExpiredLockedUsers(now: LocalDateTime): List<User>
}
