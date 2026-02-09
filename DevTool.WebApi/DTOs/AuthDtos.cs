using System.ComponentModel.DataAnnotations;

namespace DevTool.WebApi.DTOs;

public record RegisterRequest(
    [property: Required, EmailAddress, MaxLength(256)] string Email,
    [property: Required, MinLength(6), MaxLength(100)] string Password,
    [property: Required, MaxLength(100)] string Name);

public record LoginRequest(
    [property: Required, EmailAddress] string Email,
    [property: Required] string Password);

public record LoginResponse(string Token, string Email, string Name);

public record UserResponse(int Id, string Email, string Name, DateTime CreatedAt);
