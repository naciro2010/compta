package ma.mizanpro.backend.security

import ma.mizanpro.backend.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(userId: String): UserDetails {
        val user = userRepository.findById(userId)
            .orElseThrow { UsernameNotFoundException("User not found with id: $userId") }

        if (!user.isActive) {
            throw UsernameNotFoundException("User account is disabled")
        }

        if (user.isAccountLocked()) {
            throw UsernameNotFoundException("User account is locked")
        }

        val authorities = listOf(SimpleGrantedAuthority("ROLE_${user.role.name}"))

        return User.builder()
            .username(user.id!!)
            .password(user.passwordHash ?: "")
            .authorities(authorities)
            .accountExpired(false)
            .accountLocked(user.isAccountLocked())
            .credentialsExpired(false)
            .disabled(!user.isActive)
            .build()
    }

    fun loadUserByEmail(email: String): UserDetails {
        val user = userRepository.findByEmail(email)
            .orElseThrow { UsernameNotFoundException("User not found with email: $email") }

        if (!user.isActive) {
            throw UsernameNotFoundException("User account is disabled")
        }

        if (user.isAccountLocked()) {
            throw UsernameNotFoundException("User account is locked")
        }

        val authorities = listOf(SimpleGrantedAuthority("ROLE_${user.role.name}"))

        return User.builder()
            .username(user.id!!)
            .password(user.passwordHash ?: "")
            .authorities(authorities)
            .accountExpired(false)
            .accountLocked(user.isAccountLocked())
            .credentialsExpired(false)
            .disabled(!user.isActive)
            .build()
    }
}
