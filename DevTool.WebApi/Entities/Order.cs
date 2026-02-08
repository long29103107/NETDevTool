using System.ComponentModel.DataAnnotations;

namespace DevTool.WebApi.Entities;

public class Order
{
    public int Id { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public decimal TotalAmount { get; set; }

    [MaxLength(100)]
    public string CustomerName { get; set; } = string.Empty;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}
