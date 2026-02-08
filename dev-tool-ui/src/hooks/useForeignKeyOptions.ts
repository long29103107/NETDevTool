import { useState, useEffect } from "react";
import type { OpenApiDoc, SchemaObject } from "../types/openapi";
import type { SelectOption } from "../components/Select";

/**
 * Custom hook to detect foreign key relationships in schema descriptions
 * and fetch the first 20 items from the corresponding list endpoint.
 */
export function useForeignKeyOptions(
  schema: SchemaObject | undefined,
  doc: OpenApiDoc | null
) {
  const [options, setOptions] = useState<SelectOption[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!schema?.description || !doc) {
      setOptions(null);
      return;
    }

    // Typical format: "Foreign key to Category"
    const match = schema.description.match(/Foreign key to ([a-zA-Z]+)/i);
    if (!match) {
      setOptions(null);
      return;
    }

    const entityName = match[1];
    if (!entityName) return;

    const fetchOptions = async () => {
      setLoading(true);
      try {
        // Try to find a list endpoint for this entity.
        // We look for a GET endpoint that has a tag matching the entity name (plural or singular)
        // or a path that looks like /api/entities.
        const entityPlural = entityName.endsWith('y') 
          ? entityName.slice(0, -1) + 'ies' 
          : entityName + 's';
          
        let targetPath: string | null = null;
        
        // Strategy 1: Look for path starting with /api/ + entity name
        for (const path of Object.keys(doc.paths)) {
          const lowerPath = path.toLowerCase();
          const pathItem = doc.paths[path];
          if (
            pathItem && 
            (lowerPath === `/api/${entityName.toLowerCase()}` || 
             lowerPath === `/api/${entityPlural.toLowerCase()}`) &&
            pathItem.get
          ) {
            targetPath = path;
            break;
          }
        }

        // Strategy 2: Look for tags
        if (!targetPath) {
          for (const [path, pathItem] of Object.entries(doc.paths)) {
            if (pathItem.get?.tags?.some(t => 
              t.toLowerCase() === entityName.toLowerCase() || 
              t.toLowerCase() === entityPlural.toLowerCase()
            )) {
              // Ensure it's a list endpoint (no path parameters usually)
              if (!path.includes("{")) {
                targetPath = path;
                break;
              }
            }
          }
        }

        if (!targetPath) {
          console.warn(`Could not find list endpoint for entity: ${entityName}`);
          setOptions(null);
          return;
        }

        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}${targetPath}`);
        if (!response.ok) throw new Error("Failed to fetch options");

        const data = await response.json();
        if (Array.isArray(data)) {
          // Map data to options. Try to find 'id', 'name', 'title', 'code'.
          const mapped = data.slice(0, 20).map((item: any) => ({
            value: item.id ?? item.Id ?? 0,
            label: item.name ?? item.Name ?? item.title ?? item.Title ?? item.code ?? item.Code ?? `Item ${item.id}`,
          }));
          
          setOptions([{ value: "", label: "Select..." }, ...mapped]);
        }
      } catch (err) {
        console.error("Error fetching foreign key options:", err);
        setOptions(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [schema?.description, doc]);

  return { options, loading };
}
