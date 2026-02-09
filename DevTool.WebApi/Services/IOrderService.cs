using DevTool.WebApi.DTOs;

namespace DevTool.WebApi.Services;

public interface IOrderService
{
    Task<IReadOnlyList<OrderResponse>> GetAllAsync(CancellationToken ct = default);
    Task<OrderResponse?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<OrderResponse> CreateAsync(CreateOrderRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<OrderItemResponse>?> GetItemsByOrderIdAsync(int orderId, CancellationToken ct = default);
    Task<OrderItemResponse?> GetItemByOrderIdAndItemIdAsync(int orderId, int itemId, CancellationToken ct = default);
    Task<(OrderItemResponse? Item, bool OrderFound, bool ProductFound)> AddItemToOrderAsync(int orderId, CreateOrderItemRequest request, CancellationToken ct = default);
    Task DeleteAsync(int orderId, CancellationToken ct = default);
    Task DeleteItemAsync(int orderId, int itemId, CancellationToken ct = default);
}
