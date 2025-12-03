'use client';

import { useState } from 'react';
import { OpenAPISchema, SchemaObject } from '@/types/openapi';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SchemaPropertyEditor } from './SchemaPropertyEditor';
import { generateId, cn } from '@/lib/utils';

interface SchemasEditorProps {
  schemas: OpenAPISchema[];
  onChange: (schemas: OpenAPISchema[]) => void;
}

export function SchemasEditor({ schemas, onChange }: SchemasEditorProps) {
  const [expandedSchema, setExpandedSchema] = useState<string | null>(null);

  const addSchema = () => {
    const newSchema: OpenAPISchema = {
      id: generateId(),
      name: 'NewSchema',
      schema: {
        type: 'object',
        properties: {},
        required: [],
      },
    };
    onChange([...schemas, newSchema]);
    setExpandedSchema(newSchema.id);
  };

  const updateSchema = (schemaId: string, updates: Partial<OpenAPISchema>) => {
    onChange(schemas.map((s) => (s.id === schemaId ? { ...s, ...updates } : s)));
  };

  const removeSchema = (schemaId: string) => {
    onChange(schemas.filter((s) => s.id !== schemaId));
    if (expandedSchema === schemaId) setExpandedSchema(null);
  };

  const addProperty = (schemaId: string) => {
    const schema = schemas.find((s) => s.id === schemaId);
    if (!schema) return;

    const newPropertyName = `property${Object.keys(schema.schema.properties || {}).length + 1}`;
    updateSchema(schemaId, {
      schema: {
        ...schema.schema,
        properties: {
          ...schema.schema.properties,
          [newPropertyName]: { type: 'string' },
        },
      },
    });
  };

  const updateProperty = (schemaId: string, propertyName: string, property: SchemaObject) => {
    const schema = schemas.find((s) => s.id === schemaId);
    if (!schema) return;

    updateSchema(schemaId, {
      schema: {
        ...schema.schema,
        properties: {
          ...schema.schema.properties,
          [propertyName]: property,
        },
      },
    });
  };

  const renameProperty = (schemaId: string, oldName: string, newName: string) => {
    const schema = schemas.find((s) => s.id === schemaId);
    if (!schema || !schema.schema.properties || oldName === newName) return;

    const { [oldName]: property, ...rest } = schema.schema.properties;
    const required = schema.schema.required || [];
    const newRequired = required.includes(oldName) ? [...required.filter((r) => r !== oldName), newName] : required;

    updateSchema(schemaId, {
      schema: {
        ...schema.schema,
        properties: { ...rest, [newName]: property },
        required: newRequired.length > 0 ? newRequired : undefined,
      },
    });
  };

  const removeProperty = (schemaId: string, propertyName: string) => {
    const schema = schemas.find((s) => s.id === schemaId);
    if (!schema || !schema.schema.properties) return;

    const { [propertyName]: _, ...rest } = schema.schema.properties;
    updateSchema(schemaId, {
      schema: {
        ...schema.schema,
        properties: Object.keys(rest).length > 0 ? rest : undefined,
        required: schema.schema.required?.filter((r) => r !== propertyName),
      },
    });
  };

  const toggleRequired = (schemaId: string, propertyName: string, isRequired: boolean) => {
    const schema = schemas.find((s) => s.id === schemaId);
    if (!schema) return;

    const required = schema.schema.required || [];
    const newRequired = isRequired ? [...required, propertyName] : required.filter((r) => r !== propertyName);

    updateSchema(schemaId, {
      schema: { ...schema.schema, required: newRequired.length > 0 ? newRequired : undefined },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Schemas (Components)</CardTitle>
        <Button onClick={addSchema} size="sm">
          Add Schema
        </Button>
      </CardHeader>
      <CardContent>
        {schemas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No schemas defined. Add a schema to define reusable data models.
          </p>
        ) : (
          <div className="space-y-4">
            {schemas.map((schema) => (
              <div key={schema.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => setExpandedSchema(expandedSchema === schema.id ? null : schema.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">object</span>
                    <span className="font-medium text-gray-900">{schema.name}</span>
                    <span className="text-sm text-gray-500">
                      {Object.keys(schema.schema.properties || {}).length} properties
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSchema(schema.id);
                      }}
                    >
                      Delete
                    </Button>
                    <svg
                      className={cn('w-5 h-5 transition-transform', expandedSchema === schema.id && 'rotate-180')}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedSchema === schema.id && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    <Input
                      label="Schema Name"
                      value={schema.name}
                      onChange={(e) => updateSchema(schema.id, { name: e.target.value })}
                      placeholder="User"
                    />

                    <TextArea
                      label="Description"
                      value={schema.schema.description || ''}
                      onChange={(e) =>
                        updateSchema(schema.id, {
                          schema: { ...schema.schema, description: e.target.value || undefined },
                        })
                      }
                      placeholder="Describe this schema..."
                      rows={2}
                    />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Properties</h4>
                        <Button onClick={() => addProperty(schema.id)} size="sm" variant="secondary">
                          Add Property
                        </Button>
                      </div>

                      {Object.entries(schema.schema.properties || {}).map(([propName, prop]) => (
                        <SchemaPropertyEditor
                          key={propName}
                          propertyName={propName}
                          schema={prop}
                          depth={0}
                          isRequired={schema.schema.required?.includes(propName) || false}
                          onUpdate={(updated) => updateProperty(schema.id, propName, updated)}
                          onRename={(newName) => renameProperty(schema.id, propName, newName)}
                          onRemove={() => removeProperty(schema.id, propName)}
                          onRequiredChange={(required) => toggleRequired(schema.id, propName, required)}
                        />
                      ))}

                      {Object.keys(schema.schema.properties || {}).length === 0 && (
                        <p className="text-gray-500 text-center py-4">No properties. Add a property to define the schema structure.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
