namespace DevTool.WebApi.DTOs;

public record OrderResponse(int Id, DateTime OrderDate, decimal TotalAmount, string CustomerName, IReadOnlyList<OrderItemResponse> Items);

public record OrderItemResponse(int Id, int ProductId, string ProductName, int Quantity, decimal UnitPrice);

public record CreateOrderRequest(
    string CustomerName,
    IReadOnlyList<CreateOrderItemRequest> Items
);

public record CreateOrderItemRequest(int ProductId, int Quantity);
