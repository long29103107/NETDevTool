using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DevTool.WebApi.Entities;
using Microsoft.IdentityModel.Tokens;

namespace DevTool.WebApi.Services;

public class JwtService(IConfiguration configuration) : IJwtService
{
    public string GenerateToken(User user)
    {
        var key = configuration["Jwt:Key"] ?? "DevTool-Simulate-Secret-Key-Min32Chars!!";
        var issuer = configuration["Jwt:Issuer"] ?? "DevTool.WebApi";
        var audience = configuration["Jwt:Audience"] ?? "DevTool.Client";

        var keyBytes = Encoding.UTF8.GetBytes(key);
        if (keyBytes.Length < 32) Array.Resize(ref keyBytes, 32);

        var creds = new SigningCredentials(
            new SymmetricSecurityKey(keyBytes),
            SecurityAlgorithms.HmacSha256Signature);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
        };

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
