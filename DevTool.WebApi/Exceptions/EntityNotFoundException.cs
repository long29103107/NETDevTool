namespace DevTool.WebApi.Exceptions;

/// <summary>
/// Thrown when an entity is not found for update or delete operations.
/// </summary>
public class EntityNotFoundException : Exception
{
    public string EntityName { get; }
    public object? Key { get; }

    public EntityNotFoundException(string entityName, object? key = null, string? message = null)
        : base(message ?? $"Entity '{entityName}' with key '{key}' was not found.")
    {
        EntityName = entityName;
        Key = key;
    }
}
