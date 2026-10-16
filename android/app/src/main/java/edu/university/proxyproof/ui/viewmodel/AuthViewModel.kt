package edu.university.proxyproof.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.university.proxyproof.data.model.User
import edu.university.proxyproof.data.model.UserRole
import edu.university.proxyproof.data.repository.AuthRepository
import edu.university.proxyproof.data.repository.AuthResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val currentUser: User? = null,
    val isDemoMode: Boolean = false
)

class AuthViewModel(private val repository: AuthRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.currentUser.collect { user ->
                _uiState.value = _uiState.value.copy(
                    currentUser = user,
                    isDemoMode = repository.isDemoMode.value
                )
            }
        }
    }

    fun signIn(email: String, pass: String, role: UserRole, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            when (val result = repository.signInWithEmail(email, pass, role)) {
                is AuthResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        currentUser = result.user,
                        isDemoMode = repository.isDemoMode.value
                    )
                    onSuccess()
                }
                is AuthResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = result.message
                    )
                }
            }
        }
    }

    fun registerStudent(name: String, email: String, pass: String, studentId: String, dept: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            when (val result = repository.registerStudent(name, email, pass, studentId, dept)) {
                is AuthResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        currentUser = result.user,
                        isDemoMode = repository.isDemoMode.value
                    )
                    onSuccess()
                }
                is AuthResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = result.message
                    )
                }
            }
        }
    }

    fun useDemoPersona(role: UserRole, onSuccess: () -> Unit) {
        repository.useDemoPersona(role)
        onSuccess()
    }

    fun signOut(onSignedOut: () -> Unit) {
        repository.signOut()
        _uiState.value = AuthUiState()
        onSignedOut()
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}
