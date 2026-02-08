using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;

namespace DevTool.WebApi.DTOs;

/// <summary>Represents a product in the system.</summary>
/// <param name="Id">The unique identifier of the product.</param>
/// <param name="Name">The name of the product. <example>Smartphone X</example></param>
/// <param name="Description">A brief description of the product. <example>Latest flagship smartphone with 5G.</example></param>
/// <param name="Price">The unit price of the product. <example>999.99</example></param>
/// <param name="Stock">The current stock level. <example>50</example></param>
/// <param name="CategoryId">The identifier of the category this product belongs to. <example>1</example></param>
/// <param name="CreatedAt">When the product was created.</param>
/// <param name="UpdatedAt">When the product was last updated.</param>
public record ProductResponse(
    [property: SwaggerSchema(Description = "The unique identifier")] int Id, 
    [property: Required, StringLength(100), SwaggerSchema(Description = "The name of the product")] string Name, 
    [property: StringLength(500), SwaggerSchema(Description = "A brief description")] string? Description, 
    [property: Range(0.01, 10000), SwaggerSchema(Description = "The unit price")] decimal Price, 
    [property: Range(0, 1000000), SwaggerSchema(Description = "The current stock level")] int Stock, 
    [property: SwaggerSchema(Description = "Foreign key to Category", Format = "int32")] int CategoryId, 
    DateTime CreatedAt, 
    DateTime? UpdatedAt);

/// <summary>Request to create a new product.</summary>
/// <param name="Name">The name of the product. <example>Smartphone X</example></param>
/// <param name="Description">A brief description of the product. <example>Latest flagship smartphone with 5G.</example></param>
/// <param name="Price">The unit price. <example>999.99</example></param>
/// <param name="Stock">The stock level. <example>50</example></param>
/// <param name="CategoryId">The category ID. <example>1</example></param>
public record CreateProductRequest(
    [property: Required, StringLength(100), SwaggerSchema(Description = "The name of the product")] string Name, 
    [property: StringLength(500), SwaggerSchema(Description = "A brief description")] string? Description, 
    [property: Range(0.01, 10000), SwaggerSchema(Description = "The unit price")] decimal Price, 
    [property: Range(0, 1000000), SwaggerSchema(Description = "The stock level")] int Stock, 
    [property: SwaggerSchema(Description = "Foreign key to Category", Format = "int32")] int CategoryId);

/// <summary>Request to update an existing product.</summary>
/// <param name="Name">The name. <example>Smartphone X Pro</example></param>
/// <param name="Description">The description. <example>Updated description.</example></param>
/// <param name="Price">The price. <example>1099.99</example></param>
/// <param name="Stock">The stock. <example>45</example></param>
/// <param name="CategoryId">The category ID. <example>1</example></param>
public record UpdateProductRequest(
    [property: StringLength(10), SwaggerSchema(Description = "The name of the product")] string? Name, 
    [property: StringLength(500), SwaggerSchema(Description = "A brief description")] string? Description, 
    [property: Range(0.01, 10000), SwaggerSchema(Description = "The unit price")] decimal? Price, 
    [property: Range(0, 1000000), SwaggerSchema(Description = "The stock level")] int? Stock, 
    [property: SwaggerSchema(Description = "Foreign key to Category", Format = "int32")] int? CategoryId);
