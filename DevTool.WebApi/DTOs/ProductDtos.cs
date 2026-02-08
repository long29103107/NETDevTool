/// <summary>Represents a product in the system.</summary>
/// <param name="Id">The unique identifier of the product.</param>
/// <param name="Name">The name of the product. <example>Smartphone X</example></param>
/// <param name="Description">A brief description of the product. <example>Latest flagship smartphone with 5G.</example></param>
/// <param name="Price">The unit price of the product. <example>999.99</example></param>
/// <param name="Stock">The current stock level. <example>50</example></param>
/// <param name="CategoryId">The identifier of the category this product belongs to. <example>1</example></param>
/// <param name="CreatedAt">When the product was created.</param>
/// <param name="UpdatedAt">When the product was last updated.</param>
public record ProductResponse(int Id, string Name, string? Description, decimal Price, int Stock, int CategoryId, DateTime CreatedAt, DateTime? UpdatedAt);

/// <summary>Request to create a new product.</summary>
/// <param name="Name">The name of the product. <example>Smartphone X</example></param>
/// <param name="Description">A brief description of the product. <example>Latest flagship smartphone with 5G.</example></param>
/// <param name="Price">The unit price. <example>999.99</example></param>
/// <param name="Stock">The stock level. <example>50</example></param>
/// <param name="CategoryId">The category ID. <example>1</example></param>
public record CreateProductRequest(string Name, string? Description, decimal Price, int Stock, int CategoryId);

/// <summary>Request to update an existing product.</summary>
/// <param name="Name">The name. <example>Smartphone X Pro</example></param>
/// <param name="Description">The description. <example>Updated description.</example></param>
/// <param name="Price">The price. <example>1099.99</example></param>
/// <param name="Stock">The stock. <example>45</example></param>
/// <param name="CategoryId">The category ID. <example>1</example></param>
public record UpdateProductRequest(string? Name, string? Description, decimal? Price, int? Stock, int? CategoryId);