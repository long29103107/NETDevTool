namespace DevTool.WebApi.DTOs;


public record ProductResponse(int Id, string Name, string? Description, decimal Price, int Stock, int CategoryId, DateTime CreatedAt, DateTime? UpdatedAt);

public record CreateProductRequest(
    string Name,
    string? Description,
    decimal Price,
    int Stock,
    int CategoryId
);

public record UpdateProductRequest(string? Name, string? Description, decimal? Price, int? Stock, int? CategoryId);