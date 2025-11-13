package ma.mizanpro.backend.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime

@Entity
@Table(name = "users", indexes = [
    Index(name = "idx_user_email", columnList = "email", unique = true),
    Index(name = "idx_user_active", columnList = "is_active"),
    Index(name = "idx_user_role", columnList = "role")
])
@EntityListeners(AuditingEntityListener::class)
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,

    @Column(nullable = false, unique = true, length = 255)
    var email: String,

    @Column(name = "first_name", nullable = false, length = 100)
    var firstName: String,

    @Column(name = "last_name", nullable = false, length = 100)
    var lastName: String,

    @Column(name = "password_hash", length = 255)
    var passwordHash: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    var role: UserRole = UserRole.USER,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "is_locked", nullable = false)
    var isLocked: Boolean = false,

    @Column(name = "is_email_verified", nullable = false)
    var isEmailVerified: Boolean = false,

    @Column(name = "language", length = 5)
    var language: String = "fr",

    @Column(name = "timezone", length = 50)
    var timezone: String = "Africa/Casablanca",

    @Column(name = "phone", length = 20)
    var phone: String? = null,

    @Column(name = "avatar_url", length = 500)
    var avatarUrl: String? = null,

    @Column(name = "must_change_password", nullable = false)
    var mustChangePassword: Boolean = false,

    @Column(name = "failed_login_attempts", nullable = false)
    var failedLoginAttempts: Int = 0,

    @Column(name = "last_login_at")
    var lastLoginAt: LocalDateTime? = null,

    @Column(name = "last_login_ip", length = 45)
    var lastLoginIp: String? = null,

    @Column(name = "last_failed_login_at")
    var lastFailedLoginAt: LocalDateTime? = null,

    @Column(name = "locked_until")
    var lockedUntil: LocalDateTime? = null,

    @Column(name = "password_changed_at")
    var passwordChangedAt: LocalDateTime? = null,

    // OAuth2 fields
    @Column(name = "oauth_provider", length = 50)
    var oauthProvider: String? = null,

    @Column(name = "oauth_provider_id", length = 255)
    var oauthProviderId: String? = null,

    // Establishment association
    @Column(name = "default_establishment_id")
    var defaultEstablishmentId: String? = null,

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "deleted_at")
    var deletedAt: LocalDateTime? = null
) {
    fun getFullName(): String = "$firstName $lastName"

    fun isAccountLocked(): Boolean {
        return isLocked || (lockedUntil?.isAfter(LocalDateTime.now()) == true)
    }

    fun resetFailedAttempts() {
        failedLoginAttempts = 0
        lastFailedLoginAt = null
        isLocked = false
        lockedUntil = null
    }

    fun incrementFailedAttempts() {
        failedLoginAttempts++
        lastFailedLoginAt = LocalDateTime.now()
        if (failedLoginAttempts >= 5) {
            isLocked = true
            lockedUntil = LocalDateTime.now().plusMinutes(30)
        }
    }
}

enum class UserRole {
    SUPER_ADMIN,
    ADMIN,
    ACCOUNTANT,
    USER
}
