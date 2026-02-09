using DevTool.WebApi.DTOs;
using DevTool.WebApi.Entities;
using DevTool.WebApi.Repositories;

namespace DevTool.WebApi.Services;

public class OrderService(IOrderRepository repository, IProductRepository productRepository) : IOrderService
{
    public async Task<IReadOnlyList<OrderResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var orders = await repository.GetAllAsync(ct);
        return orders.Select(ToResponse).ToList();
    }

    public async Task<OrderResponse?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var order = await repository.GetByIdAsync(id, ct);
        return order is null ? null : ToResponse(order);
    }

    public async Task<OrderResponse> CreateAsync(CreateOrderRequest request, CancellationToken ct = default)
    {
        var order = new Order
        {
            CustomerName = request.CustomerName,
            OrderDate = DateTime.UtcNow,
            Items = new List<OrderItem>()
        };

        decimal totalAmount = 0;

        foreach (var itemRequest in request.Items)
        {
            var product = await productRepository.GetByIdAsync(itemRequest.ProductId, ct);
            if (product is null) continue;

            var orderItem = new OrderItem
            {
                ProductId = itemRequest.ProductId,
                Quantity = itemRequest.Quantity,
                UnitPrice = product.Price
            };

            order.Items.Add(orderItem);
            totalAmount += product.Price * itemRequest.Quantity;
        }

        order.TotalAmount = totalAmount;
        order = await repository.AddAsync(order, ct);
        return ToResponse(order);
    }

    public async Task<IReadOnlyList<OrderItemResponse>?> GetItemsByOrderIdAsync(int orderId, CancellationToken ct = default)
    {
        var items = await repository.GetItemsByOrderIdAsync(orderId, ct);
        return items?.Select(ToItemResponse).ToList();
    }

    public async Task<OrderItemResponse?> GetItemByOrderIdAndItemIdAsync(int orderId, int itemId, CancellationToken ct = default)
    {
        var item = await repository.GetItemByOrderIdAndItemIdAsync(orderId, itemId, ct);
        return item is null ? null : ToItemResponse(item);
    }

    public async Task<(OrderItemResponse? Item, bool OrderFound, bool ProductFound)> AddItemToOrderAsync(int orderId, CreateOrderItemRequest request, CancellationToken ct = default)
    {
        var product = await productRepository.GetByIdAsync(request.ProductId, ct);
        if (product is null) return (null, true, false);

        var item = new OrderItem
        {
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            UnitPrice = product.Price
        };

        var added = await repository.AddItemAsync(orderId, item, ct);
        if (added is null) return (null, false, true);
        return (new OrderItemResponse(added.Id, added.ProductId, product.Name, added.Quantity, added.UnitPrice), true, true);
    }

    public Task DeleteAsync(int orderId, CancellationToken ct = default) =>
        repository.DeleteAsync(orderId, ct);

    public Task DeleteItemAsync(int orderId, int itemId, CancellationToken ct = default) =>
        repository.DeleteItemAsync(orderId, itemId, ct);

    private static OrderResponse ToResponse(Order o) =>
        new(o.Id, o.OrderDate, o.TotalAmount, o.CustomerName,
            o.Items.Select(ToItemResponse).ToList());

    private static OrderItemResponse ToItemResponse(OrderItem i) =>
        new(i.Id, i.ProductId, i.Product?.Name ?? "Unknown", i.Quantity, i.UnitPrice);
}
