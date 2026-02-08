using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;

namespace DevTool.WebApi.DTOs;

/// <summary>Represents the inventory status of a product.</summary>
/// <param name="Id">The unique identifier of the inventory record.</param>
/// <param name="ProductId">The identifier of the associated product. <example>1</example></param>
/// <param name="ProductName">The name of the associated product. <example>Smartphone X</example></param>
/// <param name="Quantity">The current quantity available in stock. <example>100</example></param>
/// <param name="Location">The physical location where the stock is stored. <example>Warehouse A</example></param>
/// <param name="LastUpdated">The date and time when this record was last updated.</param>
public record InventoryResponse(
    [property: SwaggerSchema(Description = "The unique identifier")] int Id, 
    [property: SwaggerSchema(Description = "Foreign key to Product")] int ProductId, 
    [property: SwaggerSchema(Description = "The name of the associated product")] string ProductName, 
    [property: Range(0, 1000000), SwaggerSchema(Description = "The current quantity available")] int Quantity, 
    [property: StringLength(200), SwaggerSchema(Description = "The physical location")] string Location, 
    DateTime LastUpdated);

/// <summary>Request to update the quantity or location of a product's inventory.</summary>
/// <param name="Quantity">The new quantity. <example>100</example></param>
/// <param name="Location">The new location. <example>Warehouse A, Aisle 4</example></param>
public record UpdateInventoryQuantityRequest(
    [property: Range(0, 1000000), SwaggerSchema(Description = "The new quantity")] int Quantity, 
    [property: StringLength(200), SwaggerSchema(Description = "The new location")] string? Location);
