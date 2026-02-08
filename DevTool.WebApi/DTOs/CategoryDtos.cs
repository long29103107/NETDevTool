namespace DevTool.WebApi.DTOs;

public record CategoryResponse(int Id, string Name, string Code);

public record CreateCategoryRequest(string Name, string Code);

public record UpdateCategoryRequest(string? Name, string? Code);
