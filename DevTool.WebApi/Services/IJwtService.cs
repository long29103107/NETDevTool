using DevTool.WebApi.Entities;

namespace DevTool.WebApi.Services;

public interface IJwtService
{
    string GenerateToken(User user);
}
