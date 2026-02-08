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

    private static OrderResponse ToResponse(Order o) =>
        new(o.Id, o.OrderDate, o.TotalAmount, o.CustomerName,
            o.Items.Select(i => new OrderItemResponse(i.Id, i.ProductId, i.Product?.Name ?? "Unknown", i.Quantity, i.UnitPrice)).ToList());
}
