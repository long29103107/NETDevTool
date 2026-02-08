using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;

namespace DevTool.WebApi.DTOs;

/// <summary>Represents a customer order.</summary>
/// <param name="Id">The unique identifier of the order.</param>
/// <param name="OrderDate">The date and time when the order was placed.</param>
/// <param name="TotalAmount">The total cost of all items in the order. <example>1044.99</example></param>
/// <param name="CustomerName">The name of the customer who placed the order. <example>John Doe</example></param>
/// <param name="Items">The list of items included in this order.</param>
public record OrderResponse(
    [property: SwaggerSchema(Description = "The unique identifier")] int Id, 
    DateTime OrderDate, 
    [property: SwaggerSchema(Description = "The total amount")] decimal TotalAmount, 
    [property: Required, StringLength(100), SwaggerSchema(Description = "The customer name")] string CustomerName, 
    IReadOnlyList<OrderItemResponse> Items);

/// <summary>Represents an item within an order.</summary>
/// <param name="Id">The unique identifier of the order item.</param>
/// <param name="ProductId">The identifier of the product ordered. <example>1</example></param>
/// <param name="ProductName">The name of the product at the time of order. <example>Smartphone X</example></param>
/// <param name="Quantity">The quantity of the product ordered. <example>2</example></param>
/// <param name="UnitPrice">The unit price of the product at the time of order. <example>999.99</example></param>
public record OrderItemResponse(
    [property: SwaggerSchema(Description = "The unique identifier")] int Id, 
    [property: SwaggerSchema(Description = "Foreign key to Product")] int ProductId, 
    [property: SwaggerSchema(Description = "The name of the product")] string ProductName, 
    [property: Range(1, 1000), SwaggerSchema(Description = "The quantity")] int Quantity, 
    [property: SwaggerSchema(Description = "The unit price")] decimal UnitPrice);

/// <summary>Request to create a new customer order.</summary>
/// <param name="CustomerName">The name. <example>John Doe</example></param>
/// <param name="Items">The items. <example>[{"productId": 1, "quantity": 2}]</example></param>
public record CreateOrderRequest(
    [property: Required, StringLength(100), SwaggerSchema(Description = "The customer name")] string CustomerName, 
    [property: Required, SwaggerSchema(Description = "The items")] IReadOnlyList<CreateOrderItemRequest> Items);

/// <summary>Request to add an item to a new order.</summary>
/// <param name="ProductId">The product ID. <example>1</example></param>
/// <param name="Quantity">The quantity. <example>2</example></param>
public record CreateOrderItemRequest(
    [property: SwaggerSchema(Description = "Foreign key to Product")] int ProductId, 
    [property: Range(1, 1000), SwaggerSchema(Description = "The quantity")] int Quantity);
