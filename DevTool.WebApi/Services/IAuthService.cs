using DevTool.WebApi.DTOs;

namespace DevTool.WebApi.Services;

public interface IAuthService
{
    Task<UserResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default);
}
