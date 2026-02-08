using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;

namespace DevTool.WebApi.DTOs;

/// <summary>Represents a product category.</summary>
/// <param name="Id">The unique identifier of the category.</param>
/// <param name="Name">The name of the category. <example>Electronics</example></param>
/// <param name="Code">A unique code identifying the category. <example>ELEC</example></param>
public record CategoryResponse(
    [property: SwaggerSchema(Description = "The unique identifier")] int Id, 
    [property: Required, StringLength(50), SwaggerSchema(Description = "The name of the category")] string Name, 
    [property: Required, StringLength(10), SwaggerSchema(Description = "A unique code identifying the category")] string Code);

/// <summary>Request to create a new category.</summary>
/// <param name="Name">The name. <example>Electronics</example></param>
/// <param name="Code">The code. <example>ELEC</example></param>
public record CreateCategoryRequest(
    [property: Required, StringLength(50), SwaggerSchema(Description = "The name of the category")] string Name, 
    [property: Required, StringLength(10), SwaggerSchema(Description = "A unique code identifying the category")] string Code);

/// <summary>Request to update an existing category.</summary>
/// <param name="Name">The name. <example>Consumer Electronics</example></param>
/// <param name="Code">The code. <example>CELEC</example></param>
public record UpdateCategoryRequest(
    [property: StringLength(50), SwaggerSchema(Description = "The name of the category")] string? Name, 
    [property: StringLength(10), SwaggerSchema(Description = "A unique code identifying the category")] string? Code);
