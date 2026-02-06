namespace DevTool.WebApi.DTOs;
public enum ProductStatus
{
    Draft = 0,
    Active = 1,
    Inactive = 2,
    Discontinued = 3
}

public enum ProductType
{
    Physical = 1,
    Digital = 2,
    Service = 3
}

public record ProductResponse(int Id, string Name, string? Description, decimal Price, int Stock, DateTime CreatedAt, DateTime? UpdatedAt);

public record CreateProductRequest(
    string Name,                              // required

    string? Description,
    string? Sku,
    string? CategoryCode,

    decimal? Price,
    decimal? OriginalPrice,

    int? Stock,
    int? MinStock,

    bool? IsActive,
    bool? IsFeatured,

    double? Weight,
    double? Width,
    double? Height,
    double? Length,

    string? Unit,
    string? Brand,
    string? Manufacturer,

    DateTime? ExpiredAt,
    string? CreatedBy,
    string? Currency,

    // 🔥 Enum
    ProductStatus? Status,
    ProductType? Type,

    // 🔥 List
    List<string>? Tags,
    List<string>? ImageUrls,
    List<int>? RelatedProductIds,

    // 🔥 Dictionary
    Dictionary<string, string>? Attributes,     // color -> red, size -> L
    Dictionary<string, decimal>? ExtraPrices    // shipping -> 2.5, tax -> 1.2
);

public record UpdateProductRequest(string? Name, string? Description, decimal? Price, int? Stock);
