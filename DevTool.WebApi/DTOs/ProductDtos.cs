namespace DevTool.WebApi.DTOs;

public record ProductResponse(int Id, string Name, string? Description, decimal Price, int Stock, DateTime CreatedAt, DateTime? UpdatedAt);

public record CreateProductRequest(string Name, string? Description, decimal Price, int Stock);

public record UpdateProductRequest(string? Name, string? Description, decimal? Price, int? Stock);
