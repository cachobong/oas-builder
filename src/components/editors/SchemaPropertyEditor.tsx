'use client';

import { useState } from 'react';
import { SchemaObject } from '@/types/openapi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

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

export interface SchemaPropertyEditorProps {
  propertyName: string;
  schema: SchemaObject;
  depth: number;
  isRequired: boolean;
  onUpdate: (schema: SchemaObject) => void;
  onRename: (newName: string) => void;
  onRemove: () => void;
  onRequiredChange: (required: boolean) => void;
}

export function SchemaPropertyEditor({
  propertyName,
  schema,
  depth,
  isRequired,
  onUpdate,
  onRename,
  onRemove,
  onRequiredChange,
}: SchemaPropertyEditorProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [localName, setLocalName] = useState(propertyName);

  // Sync local name when propertyName changes from outside
  if (propertyName !== localName && document.activeElement?.getAttribute('data-property-name') !== propertyName) {
    setLocalName(propertyName);
  }

  const handleNameBlur = () => {
    if (localName !== propertyName && localName.trim()) {
      onRename(localName.trim());
    } else if (!localName.trim()) {
      setLocalName(propertyName);
    }
  };

  const getFormatsForType = (type?: string) => {
    if (type === 'string') return STRING_FORMATS;
    if (type === 'number' || type === 'integer') return NUMBER_FORMATS;
    return [];
  };

  const addNestedProperty = () => {
    const currentProps = schema.properties || {};
    const newPropName = `property${Object.keys(currentProps).length + 1}`;
    onUpdate({
      ...schema,
      properties: {
        ...currentProps,
        [newPropName]: { type: 'string' },
      },
    });
  };

  const updateNestedProperty = (propName: string, propSchema: SchemaObject) => {
    onUpdate({
      ...schema,
      properties: {
        ...schema.properties,
        [propName]: propSchema,
      },
    });
  };

  const renameNestedProperty = (oldName: string, newName: string) => {
    if (!schema.properties || oldName === newName) return;
    const { [oldName]: prop, ...rest } = schema.properties;
    const required = schema.required || [];
    const newRequired = required.includes(oldName)
      ? [...required.filter((r) => r !== oldName), newName]
      : required;
    onUpdate({
      ...schema,
      properties: { ...rest, [newName]: prop },
      required: newRequired.length > 0 ? newRequired : undefined,
    });
  };

  const removeNestedProperty = (propName: string) => {
    if (!schema.properties) return;
    const { [propName]: _, ...rest } = schema.properties;
    onUpdate({
      ...schema,
      properties: Object.keys(rest).length > 0 ? rest : undefined,
      required: schema.required?.filter((r) => r !== propName),
    });
  };

  const toggleNestedRequired = (propName: string, required: boolean) => {
    const currentRequired = schema.required || [];
    const newRequired = required
      ? [...currentRequired, propName]
      : currentRequired.filter((r) => r !== propName);
    onUpdate({
      ...schema,
      required: newRequired.length > 0 ? newRequired : undefined,
    });
  };

  const indentClass = depth > 0 ? 'ml-4 border-l-2 border-indigo-100 pl-4' : '';

  return (
    <div className={cn('space-y-3', indentClass)}>
      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input
              label="Name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={handleNameBlur}
              data-property-name={propertyName}
              placeholder="propertyName"
            />
            <Select
              label="Type"
              value={schema.type || 'string'}
              onChange={(e) => {
                const newType = e.target.value as SchemaObject['type'];
                const updates: SchemaObject = { ...schema, type: newType };
                if (newType === 'object' && !schema.properties) {
                  updates.properties = {};
                }
                if (newType === 'array' && !schema.items) {
                  updates.items = { type: 'string' };
                }
                if (newType !== 'object') {
                  delete updates.properties;
                  delete updates.required;
                }
                if (newType !== 'array') {
                  delete updates.items;
                }
                onUpdate(updates);
              }}
              options={DATA_TYPES}
            />
            {getFormatsForType(schema.type).length > 0 && (
              <Select
                label="Format"
                value={schema.format || ''}
                onChange={(e) => onUpdate({ ...schema, format: e.target.value || undefined })}
                options={getFormatsForType(schema.type)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Description"
              value={schema.description || ''}
              onChange={(e) => onUpdate({ ...schema, description: e.target.value || undefined })}
              placeholder="Property description"
            />
            <Input
              label="Example"
              value={String(schema.example ?? '')}
              onChange={(e) => onUpdate({ ...schema, example: e.target.value || undefined })}
              placeholder="Example value"
            />
          </div>

          {schema.type === 'string' && (
            <Input
              label="Enum Values (comma-separated)"
              value={schema.enum?.join(', ') || ''}
              onChange={(e) =>
                onUpdate({
                  ...schema,
                  enum: e.target.value
                    ? e.target.value.split(',').map((v) => v.trim()).filter(Boolean)
                    : undefined,
                })
              }
              placeholder="value1, value2, value3"
            />
          )}

          {schema.type === 'array' && schema.items && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-3">
              <h6 className="text-sm font-medium text-gray-700">Array Items</h6>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Items Type"
                  value={schema.items.type || 'string'}
                  onChange={(e) => {
                    const itemType = e.target.value as SchemaObject['type'];
                    const newItems: SchemaObject = { type: itemType };
                    if (itemType === 'object') {
                      newItems.properties = {};
                    }
                    onUpdate({ ...schema, items: newItems });
                  }}
                  options={DATA_TYPES}
                />
              </div>
              {schema.items.type === 'object' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Item Properties</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const currentProps = schema.items?.properties || {};
                        const newPropName = `property${Object.keys(currentProps).length + 1}`;
                        onUpdate({
                          ...schema,
                          items: {
                            ...schema.items,
                            properties: {
                              ...currentProps,
                              [newPropName]: { type: 'string' },
                            },
                          },
                        });
                      }}
                    >
                      Add Property
                    </Button>
                  </div>
                  {schema.items.properties &&
                    Object.entries(schema.items.properties).map(([propName, propSchema]) => (
                      <SchemaPropertyEditor
                        key={propName}
                        propertyName={propName}
                        schema={propSchema}
                        depth={depth + 1}
                        isRequired={schema.items?.required?.includes(propName) || false}
                        onUpdate={(updated) => {
                          onUpdate({
                            ...schema,
                            items: {
                              ...schema.items,
                              properties: {
                                ...schema.items?.properties,
                                [propName]: updated,
                              },
                            },
                          });
                        }}
                        onRename={(newName) => {
                          if (!schema.items?.properties) return;
                          const { [propName]: prop, ...rest } = schema.items.properties;
                          onUpdate({
                            ...schema,
                            items: {
                              ...schema.items,
                              properties: { ...rest, [newName]: prop },
                            },
                          });
                        }}
                        onRemove={() => {
                          if (!schema.items?.properties) return;
                          const { [propName]: _, ...rest } = schema.items.properties;
                          onUpdate({
                            ...schema,
                            items: {
                              ...schema.items,
                              properties: Object.keys(rest).length > 0 ? rest : undefined,
                            },
                          });
                        }}
                        onRequiredChange={(required) => {
                          const currentRequired = schema.items?.required || [];
                          const newRequired = required
                            ? [...currentRequired, propName]
                            : currentRequired.filter((r) => r !== propName);
                          onUpdate({
                            ...schema,
                            items: {
                              ...schema.items,
                              required: newRequired.length > 0 ? newRequired : undefined,
                            },
                          });
                        }}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={onRemove} className="mt-6">
          Remove
        </Button>
      </div>

      {/* Nested Object Properties */}
      {schema.type === 'object' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <svg
                className={cn('w-4 h-4 transition-transform', expanded && 'rotate-90')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Nested Properties ({Object.keys(schema.properties || {}).length})
            </button>
            {expanded && (
              <Button size="sm" variant="secondary" onClick={addNestedProperty}>
                Add Property
              </Button>
            )}
          </div>

          {expanded && schema.properties && (
            <div className="space-y-3">
              {Object.entries(schema.properties).map(([propName, propSchema]) => (
                <SchemaPropertyEditor
                  key={propName}
                  propertyName={propName}
                  schema={propSchema}
                  depth={depth + 1}
                  isRequired={schema.required?.includes(propName) || false}
                  onUpdate={(updated) => updateNestedProperty(propName, updated)}
                  onRename={(newName) => renameNestedProperty(propName, newName)}
                  onRemove={() => removeNestedProperty(propName)}
                  onRequiredChange={(required) => toggleNestedRequired(propName, required)}
                />
              ))}
              {Object.keys(schema.properties).length === 0 && (
                <p className="text-sm text-gray-500 pl-4">No properties. Click "Add Property" to add one.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
