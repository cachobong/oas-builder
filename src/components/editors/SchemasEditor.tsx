'use client';

import { useState } from 'react';
import { OpenAPISchema, SchemaObject } from '@/types/openapi';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { generateId, cn } from '@/lib/utils';

interface SchemasEditorProps {
  schemas: OpenAPISchema[];
  onChange: (schemas: OpenAPISchema[]) => void;
}

const DATA_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'integer', label: 'Integer' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'array', label: 'Array' },
  { value: 'object', label: 'Object' },
];

const STRING_FORMATS = [
  { value: '', label: 'None' },
  { value: 'date', label: 'Date' },
  { value: 'date-time', label: 'Date-Time' },
  { value: 'email', label: 'Email' },
  { value: 'uri', label: 'URI' },
  { value: 'uuid', label: 'UUID' },
  { value: 'password', label: 'Password' },
];

const NUMBER_FORMATS = [
  { value: '', label: 'None' },
  { value: 'float', label: 'Float' },
  { value: 'double', label: 'Double' },
  { value: 'int32', label: 'Int32' },
  { value: 'int64', label: 'Int64' },
];

interface PropertyEditorProps {
  property: SchemaObject;
  propertyName: string;
  allSchemas: OpenAPISchema[];
  onUpdate: (name: string, property: SchemaObject) => void;
  onRemove: () => void;
  onRename: (newName: string) => void;
  isRequired: boolean;
  onRequiredChange: (required: boolean) => void;
}

function PropertyEditor({
  property,
  propertyName,
  allSchemas,
  onUpdate,
  onRemove,
  onRename,
  isRequired,
  onRequiredChange,
}: PropertyEditorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getFormatsForType = (type: string) => {
    if (type === 'string') return STRING_FORMATS;
    if (type === 'number' || type === 'integer') return NUMBER_FORMATS;
    return [];
  };

  return (
    <div className="p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Input
            label="Name"
            value={propertyName}
            onChange={(e) => onRename(e.target.value)}
            placeholder="propertyName"
          />
          <Select
            label="Type"
            value={property.type}
            onChange={(e) => onUpdate(propertyName, { ...property, type: e.target.value as SchemaObject['type'] })}
            options={DATA_TYPES}
          />
          {getFormatsForType(property.type).length > 0 && (
            <Select
              label="Format"
              value={property.format || ''}
              onChange={(e) => onUpdate(propertyName, { ...property, format: e.target.value || undefined })}
              options={getFormatsForType(property.type)}
            />
          )}
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => onRequiredChange(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Required
            </label>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide' : 'Details'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
          <Input
            label="Description"
            value={property.description || ''}
            onChange={(e) => onUpdate(propertyName, { ...property, description: e.target.value || undefined })}
            placeholder="Property description"
          />
          <Input
            label="Example"
            value={property.example || ''}
            onChange={(e) => onUpdate(propertyName, { ...property, example: e.target.value || undefined })}
            placeholder="Example value"
          />
          {property.type === 'string' && (
            <Input
              label="Enum Values (comma-separated)"
              value={property.enum?.join(', ') || ''}
              onChange={(e) =>
                onUpdate(propertyName, {
                  ...property,
                  enum: e.target.value
                    ? e.target.value
                        .split(',')
                        .map((v) => v.trim())
                        .filter(Boolean)
                    : undefined,
                })
              }
              placeholder="value1, value2, value3"
            />
          )}
          {property.type === 'array' && (
            <Select
              label="Array Items Type"
              value={property.items?.type || 'string'}
              onChange={(e) =>
                onUpdate(propertyName, { ...property, items: { type: e.target.value as SchemaObject['type'] } })
              }
              options={[
                ...DATA_TYPES,
                ...allSchemas.map((s) => ({ value: `$ref:${s.name}`, label: `Ref: ${s.name}` })),
              ]}
            />
          )}
        </div>
      )}
    </div>
  );
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
    if (!schema || !schema.schema.properties) return;

    const { [oldName]: property, ...rest } = schema.schema.properties;
    const required = schema.schema.required || [];
    const newRequired = required.includes(oldName) ? [...required.filter((r) => r !== oldName), newName] : required;

    updateSchema(schemaId, {
      schema: {
        ...schema.schema,
        properties: { ...rest, [newName]: property },
        required: newRequired,
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
        properties: rest,
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
      schema: { ...schema.schema, required: newRequired },
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
                        <PropertyEditor
                          key={propName}
                          propertyName={propName}
                          property={prop}
                          allSchemas={schemas}
                          onUpdate={(name, property) => updateProperty(schema.id, name, property)}
                          onRemove={() => removeProperty(schema.id, propName)}
                          onRename={(newName) => renameProperty(schema.id, propName, newName)}
                          isRequired={schema.schema.required?.includes(propName) || false}
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
