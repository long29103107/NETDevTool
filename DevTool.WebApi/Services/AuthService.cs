using DevTool.WebApi.DTOs;
using DevTool.WebApi.Entities;
using DevTool.WebApi.Repositories;

namespace DevTool.WebApi.Services;

public class AuthService(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtService jwtService) : IAuthService
{
    public async Task<UserResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var existing = await userRepository.GetByEmailAsync(request.Email, ct);
        if (existing is not null)
            throw new InvalidOperationException($"Email '{request.Email}' is already registered.");

        var user = new User
        {
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = passwordHasher.Hash(request.Password),
            Name = request.Name.Trim(),
        };

        user = await userRepository.AddAsync(user, ct);
        return new UserResponse(user.Id, user.Email, user.Name, user.CreatedAt);
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await userRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), ct);
        if (user is null) return null;

        if (!passwordHasher.Verify(request.Password, user.PasswordHash))
            return null;

        var token = jwtService.GenerateToken(user);
        return new LoginResponse(token, user.Email, user.Name);
    }
}
