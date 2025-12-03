'use client';

import { useState } from 'react';
import { SchemaObject, OpenAPIRequestBody } from '@/types/openapi';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { SchemaPropertyEditor } from './SchemaPropertyEditor';

interface RequestBodyEditorProps {
  requestBody: OpenAPIRequestBody;
  schemas: { id: string; name: string }[];
  onChange: (requestBody: OpenAPIRequestBody) => void;
}

export function RequestBodyEditor({ requestBody, schemas, onChange }: RequestBodyEditorProps) {
  const [useSchemaRef, setUseSchemaRef] = useState(() => {
    const schema = requestBody.content['application/json']?.schema;
    return schema && '$ref' in schema;
  });

  const currentSchema = requestBody.content['application/json']?.schema as SchemaObject;

  const updateSchema = (schema: SchemaObject | { $ref: string }) => {
    onChange({
      ...requestBody,
      content: {
        'application/json': { schema },
      },
    });
  };

  const addRootProperty = () => {
    const currentProps = currentSchema?.properties || {};
    const newPropName = `property${Object.keys(currentProps).length + 1}`;
    updateSchema({
      ...currentSchema,
      type: 'object',
      properties: {
        ...currentProps,
        [newPropName]: { type: 'string' },
      },
    });
  };

  const updateProperty = (propName: string, propSchema: SchemaObject) => {
    updateSchema({
      ...currentSchema,
      properties: {
        ...currentSchema?.properties,
        [propName]: propSchema,
      },
    });
  };

  const renameProperty = (oldName: string, newName: string) => {
    if (!currentSchema?.properties || oldName === newName) return;
    const { [oldName]: prop, ...rest } = currentSchema.properties;
    const required = currentSchema.required || [];
    const newRequired = required.includes(oldName)
      ? [...required.filter((r) => r !== oldName), newName]
      : required;
    updateSchema({
      ...currentSchema,
      properties: { ...rest, [newName]: prop },
      required: newRequired.length > 0 ? newRequired : undefined,
    });
  };

  const removeProperty = (propName: string) => {
    if (!currentSchema?.properties) return;
    const { [propName]: _, ...rest } = currentSchema.properties;
    updateSchema({
      ...currentSchema,
      properties: Object.keys(rest).length > 0 ? rest : undefined,
      required: currentSchema.required?.filter((r) => r !== propName),
    });
  };

  const toggleRequired = (propName: string, required: boolean) => {
    const currentRequired = currentSchema?.required || [];
    const newRequired = required
      ? [...currentRequired, propName]
      : currentRequired.filter((r) => r !== propName);
    updateSchema({
      ...currentSchema,
      required: newRequired.length > 0 ? newRequired : undefined,
    });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium text-gray-900">Request Body</h5>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={requestBody.required}
            onChange={(e) => onChange({ ...requestBody, required: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Required
        </label>
      </div>

      <TextArea
        label="Description"
        value={requestBody.description || ''}
        onChange={(e) => onChange({ ...requestBody, description: e.target.value || undefined })}
        placeholder="Describe the request body..."
        rows={2}
      />

      {schemas.length > 0 && (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={!useSchemaRef}
              onChange={() => {
                setUseSchemaRef(false);
                updateSchema({ type: 'object', properties: {} });
              }}
              className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Define inline
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={useSchemaRef}
              onChange={() => {
                setUseSchemaRef(true);
                if (schemas.length > 0) {
                  updateSchema({ $ref: `#/components/schemas/${schemas[0].name}` });
                }
              }}
              className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Use schema reference
          </label>
        </div>
      )}

      {useSchemaRef && schemas.length > 0 ? (
        <Select
          label="Schema Reference"
          value={(requestBody.content['application/json']?.schema as { $ref?: string }).$ref || ''}
          onChange={(e) => updateSchema({ $ref: e.target.value })}
          options={schemas.map((s) => ({
            value: `#/components/schemas/${s.name}`,
            label: s.name,
          }))}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Properties</span>
            <Button size="sm" variant="secondary" onClick={addRootProperty}>
              Add Property
            </Button>
          </div>

          {currentSchema?.properties && Object.keys(currentSchema.properties).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(currentSchema.properties).map(([propName, propSchema]) => (
                <SchemaPropertyEditor
                  key={propName}
                  propertyName={propName}
                  schema={propSchema}
                  depth={0}
                  isRequired={currentSchema.required?.includes(propName) || false}
                  onUpdate={(updated) => updateProperty(propName, updated)}
                  onRename={(newName) => renameProperty(propName, newName)}
                  onRemove={() => removeProperty(propName)}
                  onRequiredChange={(required) => toggleRequired(propName, required)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No properties defined. Click "Add Property" to start building the request body.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
