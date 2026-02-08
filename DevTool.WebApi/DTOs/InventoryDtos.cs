namespace DevTool.WebApi.DTOs;

/// <summary>Represents the inventory status of a product.</summary>
/// <param name="Id">The unique identifier of the inventory record.</param>
/// <param name="ProductId">The identifier of the associated product. <example>1</example></param>
/// <param name="ProductName">The name of the associated product. <example>Smartphone X</example></param>
/// <param name="Quantity">The current quantity available in stock. <example>100</example></param>
/// <param name="Location">The physical location where the stock is stored. <example>Warehouse A</example></param>
/// <param name="LastUpdated">The date and time when this record was last updated.</param>
public record InventoryResponse(int Id, int ProductId, string ProductName, int Quantity, string Location, DateTime LastUpdated);

/// <summary>Request to update the quantity or location of a product's inventory.</summary>
/// <param name="Quantity">The new quantity. <example>100</example></param>
/// <param name="Location">The new location. <example>Warehouse A, Aisle 4</example></param>
public record UpdateInventoryQuantityRequest(int Quantity, string? Location);
