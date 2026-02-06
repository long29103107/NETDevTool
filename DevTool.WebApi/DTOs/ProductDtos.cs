namespace DevTool.WebApi.DTOs;

public record ProductResponse(int Id, string Name, string? Description, decimal Price, int Stock, DateTime CreatedAt, DateTime? UpdatedAt);

public record CreateProductRequest(
    string Name,
    string? Description,
    string Sku,
    string CategoryCode,
    decimal Price,
    decimal OriginalPrice,
    int Stock,
    int MinStock,
    bool IsActive,
    bool IsFeatured,
    double Weight,
    double Width,
    double Height,
    double Length,
    string Unit,
    string Brand,
    string Manufacturer,
    DateTime? ExpiredAt,
    string CreatedBy,
    string Currency
);

public record UpdateProductRequest(string? Name, string? Description, decimal? Price, int? Stock);
