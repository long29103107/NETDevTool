using DevTool.WebApi.DTOs;

namespace DevTool.WebApi.Services;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryResponse>> GetAllAsync(CancellationToken ct = default);
    Task<CategoryResponse?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<CategoryResponse> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default);
    Task<CategoryResponse?> UpdateAsync(int id, UpdateCategoryRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
