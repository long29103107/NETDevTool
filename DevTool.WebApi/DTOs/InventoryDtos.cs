namespace DevTool.WebApi.DTOs;

public record InventoryResponse(int Id, int ProductId, string ProductName, int Quantity, string Location, DateTime LastUpdated);

public record UpdateInventoryQuantityRequest(int Quantity, string? Location);
