package ma.mizanpro.backend.security

import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import jakarta.annotation.PostConstruct
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.security.Key
import java.util.*

private val logger = KotlinLogging.logger {}

@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") private val jwtSecret: String,
    @Value("\${jwt.expiration}") private val jwtExpiration: Long,
    @Value("\${jwt.refresh-expiration}") private val refreshExpiration: Long
) {

    private lateinit var key: Key

    @PostConstruct
    fun init() {
        // Ensure the secret is at least 256 bits
        val secret = if (jwtSecret.length < 32) {
            logger.warn { "JWT secret too short, padding to 256 bits" }
            jwtSecret.padEnd(32, '0')
        } else {
            jwtSecret
        }
        key = Keys.hmacShaKeyFor(secret.toByteArray())
    }

    fun generateAccessToken(authentication: Authentication): String {
        return generateAccessToken(authentication.name)
    }

    fun generateAccessToken(userId: String): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtExpiration)

        return Jwts.builder()
            .setSubject(userId)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(key, SignatureAlgorithm.HS512)
            .compact()
    }

    fun generateRefreshToken(userId: String): String {
        val now = Date()
        val expiryDate = Date(now.time + refreshExpiration)

        return Jwts.builder()
            .setSubject(userId)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .claim("type", "refresh")
            .signWith(key, SignatureAlgorithm.HS512)
            .compact()
    }

    fun getUserIdFromToken(token: String): String {
        val claims = Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .body

        return claims.subject
    }

    fun validateToken(token: String): Boolean {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
            return true
        } catch (ex: SecurityException) {
            logger.error { "Invalid JWT signature" }
        } catch (ex: MalformedJwtException) {
            logger.error { "Invalid JWT token" }
        } catch (ex: ExpiredJwtException) {
            logger.error { "Expired JWT token" }
        } catch (ex: UnsupportedJwtException) {
            logger.error { "Unsupported JWT token" }
        } catch (ex: IllegalArgumentException) {
            logger.error { "JWT claims string is empty" }
        }
        return false
    }

    fun getExpirationTime(): Long = jwtExpiration
    fun getRefreshExpirationTime(): Long = refreshExpiration
}
