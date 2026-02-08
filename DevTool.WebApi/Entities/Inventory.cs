using System.ComponentModel.DataAnnotations;

namespace DevTool.WebApi.Entities;

public class Inventory
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public int Quantity { get; set; }

    [MaxLength(100)]
    public string Location { get; set; } = string.Empty;

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
