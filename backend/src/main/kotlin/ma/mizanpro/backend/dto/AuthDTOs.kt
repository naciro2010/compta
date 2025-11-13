package ma.mizanpro.backend.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import ma.mizanpro.backend.entity.UserRole

// Request DTOs
data class LoginRequest(
    @field:Email(message = "Email invalide")
    @field:NotBlank(message = "L'email est requis")
    val email: String,

    @field:NotBlank(message = "Le mot de passe est requis")
    val password: String,

    val rememberMe: Boolean = false
)

data class RegisterRequest(
    @field:Email(message = "Email invalide")
    @field:NotBlank(message = "L'email est requis")
    val email: String,

    @field:NotBlank(message = "Le prénom est requis")
    @field:Size(min = 2, max = 100, message = "Le prénom doit contenir entre 2 et 100 caractères")
    val firstName: String,

    @field:NotBlank(message = "Le nom est requis")
    @field:Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    val lastName: String,

    @field:NotBlank(message = "Le mot de passe est requis")
    @field:Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    val password: String,

    val language: String = "fr",
    val timezone: String = "Africa/Casablanca"
)

data class RefreshTokenRequest(
    @field:NotBlank(message = "Le refresh token est requis")
    val refreshToken: String
)

data class ChangePasswordRequest(
    @field:NotBlank(message = "L'ancien mot de passe est requis")
    val oldPassword: String,

    @field:NotBlank(message = "Le nouveau mot de passe est requis")
    @field:Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    val newPassword: String
)

data class ForgotPasswordRequest(
    @field:Email(message = "Email invalide")
    @field:NotBlank(message = "L'email est requis")
    val email: String
)

data class ResetPasswordRequest(
    @field:NotBlank(message = "Le token est requis")
    val token: String,

    @field:NotBlank(message = "Le nouveau mot de passe est requis")
    @field:Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    val newPassword: String
)

// Response DTOs
data class AuthResponse(
    val success: Boolean,
    val message: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val user: UserDTO? = null,
    val requiresPasswordChange: Boolean = false,
    val requiresEmailVerification: Boolean = false
)

data class UserDTO(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val fullName: String,
    val role: UserRole,
    val isActive: Boolean,
    val isEmailVerified: Boolean,
    val language: String,
    val timezone: String,
    val phone: String? = null,
    val avatarUrl: String? = null,
    val defaultEstablishmentId: String? = null,
    val createdAt: String
)

data class TokenResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long
)

data class MessageResponse(
    val success: Boolean,
    val message: String
)

// OAuth2 User Info
data class OAuth2UserInfo(
    val providerId: String,
    val provider: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val avatarUrl: String? = null
)
