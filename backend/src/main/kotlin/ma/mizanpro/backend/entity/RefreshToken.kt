package ma.mizanpro.backend.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime

@Entity
@Table(name = "refresh_tokens", indexes = [
    Index(name = "idx_refresh_token", columnList = "token", unique = true),
    Index(name = "idx_refresh_token_user", columnList = "user_id")
])
@EntityListeners(AuditingEntityListener::class)
data class RefreshToken(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: String? = null,

    @Column(nullable = false, unique = true, length = 500)
    val token: String,

    @Column(name = "user_id", nullable = false)
    val userId: String,

    @Column(name = "expires_at", nullable = false)
    val expiresAt: LocalDateTime,

    @Column(name = "revoked", nullable = false)
    var revoked: Boolean = false,

    @Column(name = "revoked_at")
    var revokedAt: LocalDateTime? = null,

    @Column(name = "ip_address", length = 45)
    val ipAddress: String? = null,

    @Column(name = "user_agent", length = 500)
    val userAgent: String? = null,

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    fun isExpired(): Boolean = LocalDateTime.now().isAfter(expiresAt)
    fun isValid(): Boolean = !revoked && !isExpired()
}
