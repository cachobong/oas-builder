'use client';

import { useState } from 'react';
import { OpenAPIPath, OpenAPIOperation, OpenAPIParameter, OpenAPIResponse, SchemaObject } from '@/types/openapi';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { generateId, cn } from '@/lib/utils';

interface PathsEditorProps {
  paths: OpenAPIPath[];
  schemas: { id: string; name: string }[];
  onChange: (paths: OpenAPIPath[]) => void;
}

const HTTP_METHODS = [
  { value: 'get', label: 'GET' },
  { value: 'post', label: 'POST' },
  { value: 'put', label: 'PUT' },
  { value: 'patch', label: 'PATCH' },
  { value: 'delete', label: 'DELETE' },
];

const PARAMETER_LOCATIONS = [
  { value: 'query', label: 'Query' },
  { value: 'path', label: 'Path' },
  { value: 'header', label: 'Header' },
  { value: 'cookie', label: 'Cookie' },
];

const DATA_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'integer', label: 'Integer' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'array', label: 'Array' },
  { value: 'object', label: 'Object' },
];

const STATUS_CODES = [
  { value: '200', label: '200 - OK' },
  { value: '201', label: '201 - Created' },
  { value: '204', label: '204 - No Content' },
  { value: '400', label: '400 - Bad Request' },
  { value: '401', label: '401 - Unauthorized' },
  { value: '403', label: '403 - Forbidden' },
  { value: '404', label: '404 - Not Found' },
  { value: '500', label: '500 - Internal Server Error' },
];

const METHOD_COLORS: Record<string, string> = {
  get: 'bg-green-100 text-green-800 border-green-200',
  post: 'bg-blue-100 text-blue-800 border-blue-200',
  put: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  patch: 'bg-orange-100 text-orange-800 border-orange-200',
  delete: 'bg-red-100 text-red-800 border-red-200',
};

export function PathsEditor({ paths, schemas, onChange }: PathsEditorProps) {
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [expandedOperation, setExpandedOperation] = useState<string | null>(null);

  const addPath = () => {
    const newPath: OpenAPIPath = {
      id: generateId(),
      path: '/new-endpoint',
      operations: [],
    };
    onChange([...paths, newPath]);
    setExpandedPath(newPath.id);
  };

  const updatePath = (pathId: string, updates: Partial<OpenAPIPath>) => {
    onChange(paths.map((p) => (p.id === pathId ? { ...p, ...updates } : p)));
  };

  const removePath = (pathId: string) => {
    onChange(paths.filter((p) => p.id !== pathId));
    if (expandedPath === pathId) setExpandedPath(null);
  };

  const addOperation = (pathId: string) => {
    const path = paths.find((p) => p.id === pathId);
    if (!path) return;

    const usedMethods = path.operations.map((o) => o.method);
    const availableMethod = HTTP_METHODS.find((m) => !usedMethods.includes(m.value as OpenAPIOperation['method']));
    if (!availableMethod) return;

    const newOperation: OpenAPIOperation = {
      id: generateId(),
      method: availableMethod.value as OpenAPIOperation['method'],
      summary: '',
      description: '',
      operationId: '',
      tags: [],
      parameters: [],
      responses: [{ id: generateId(), statusCode: '200', description: 'Successful response' }],
    };

    updatePath(pathId, { operations: [...path.operations, newOperation] });
    setExpandedOperation(newOperation.id);
  };

  const updateOperation = (pathId: string, operationId: string, updates: Partial<OpenAPIOperation>) => {
    const path = paths.find((p) => p.id === pathId);
    if (!path) return;

    updatePath(pathId, {
      operations: path.operations.map((o) => (o.id === operationId ? { ...o, ...updates } : o)),
    });
  };

  const removeOperation = (pathId: string, operationId: string) => {
    const path = paths.find((p) => p.id === pathId);
    if (!path) return;

    updatePath(pathId, { operations: path.operations.filter((o) => o.id !== operationId) });
    if (expandedOperation === operationId) setExpandedOperation(null);
  };

  const addParameter = (pathId: string, operationId: string) => {
    const path = paths.find((p) => p.id === pathId);
    const operation = path?.operations.find((o) => o.id === operationId);
    if (!operation) return;

    const newParam: OpenAPIParameter = {
      id: generateId(),
      name: '',
      in: 'query',
      required: false,
      schema: { type: 'string' },
    };

    updateOperation(pathId, operationId, { parameters: [...(operation.parameters || []), newParam] });
  };

  const updateParameter = (
    pathId: string,
    operationId: string,
    paramId: string,
    updates: Partial<OpenAPIParameter>
  ) => {
    const path = paths.find((p) => p.id === pathId);
    const operation = path?.operations.find((o) => o.id === operationId);
    if (!operation?.parameters) return;

    updateOperation(pathId, operationId, {
      parameters: operation.parameters.map((p) => (p.id === paramId ? { ...p, ...updates } : p)),
    });
  };

  const removeParameter = (pathId: string, operationId: string, paramId: string) => {
    const path = paths.find((p) => p.id === pathId);
    const operation = path?.operations.find((o) => o.id === operationId);
    if (!operation?.parameters) return;

    updateOperation(pathId, operationId, { parameters: operation.parameters.filter((p) => p.id !== paramId) });
  };

  const addResponse = (pathId: string, operationId: string) => {
    const path = paths.find((p) => p.id === pathId);
    const operation = path?.operations.find((o) => o.id === operationId);
    if (!operation) return;

    const newResponse: OpenAPIResponse = {
      id: generateId(),
      statusCode: '200',
      description: '',
    };

    updateOperation(pathId, operationId, { responses: [...operation.responses, newResponse] });
  };

  const updateResponse = (pathId: string, operationId: string, responseId: string, updates: Partial<OpenAPIResponse>) => {
    const path = paths.find((p) => p.id === pathId);
    const operation = path?.operations.find((o) => o.id === operationId);
    if (!operation) return;

    updateOperation(pathId, operationId, {
      responses: operation.responses.map((r) => (r.id === responseId ? { ...r, ...updates } : r)),
    });
  };

  const removeResponse = (pathId: string, operationId: string, responseId: string) => {
    const path = paths.find((p) => p.id === pathId);
    const operation = path?.operations.find((o) => o.id === operationId);
    if (!operation) return;

    updateOperation(pathId, operationId, { responses: operation.responses.filter((r) => r.id !== responseId) });
  };

  const toggleRequestBody = (pathId: string, operationId: string, enabled: boolean) => {
    const path = paths.find((p) => p.id === pathId);
    const operation = path?.operations.find((o) => o.id === operationId);
    if (!operation) return;

    if (enabled) {
      updateOperation(pathId, operationId, {
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      });
    } else {
      updateOperation(pathId, operationId, { requestBody: undefined });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Endpoints</CardTitle>
        <Button onClick={addPath} size="sm">
          Add Endpoint
        </Button>
      </CardHeader>
      <CardContent>
        {paths.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No endpoints defined. Add an endpoint to get started.</p>
        ) : (
          <div className="space-y-4">
            {paths.map((path) => (
              <div key={path.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium text-gray-900">{path.path}</span>
                    <div className="flex gap-1">
                      {path.operations.map((op) => (
                        <span
                          key={op.id}
                          className={cn('px-2 py-0.5 text-xs font-medium rounded border', METHOD_COLORS[op.method])}
                        >
                          {op.method.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePath(path.id);
                      }}
                    >
                      Delete
                    </Button>
                    <svg
                      className={cn('w-5 h-5 transition-transform', expandedPath === path.id && 'rotate-180')}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedPath === path.id && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    <Input
                      label="Path"
                      value={path.path}
                      onChange={(e) => updatePath(path.id, { path: e.target.value })}
                      placeholder="/users/{id}"
                    />

                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Operations</h4>
                      <Button onClick={() => addOperation(path.id)} size="sm" variant="secondary">
                        Add Operation
                      </Button>
                    </div>

                    {path.operations.map((operation) => (
                      <div key={operation.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                          className="flex items-center justify-between p-3 bg-white cursor-pointer hover:bg-gray-50"
                          onClick={() => setExpandedOperation(expandedOperation === operation.id ? null : operation.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'px-3 py-1 text-xs font-bold rounded border',
                                METHOD_COLORS[operation.method]
                              )}
                            >
                              {operation.method.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-600">{operation.summary || 'No summary'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeOperation(path.id, operation.id);
                              }}
                            >
                              Remove
                            </Button>
                            <svg
                              className={cn(
                                'w-4 h-4 transition-transform',
                                expandedOperation === operation.id && 'rotate-180'
                              )}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {expandedOperation === operation.id && (
                          <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Select
                                label="Method"
                                value={operation.method}
                                onChange={(e) =>
                                  updateOperation(path.id, operation.id, {
                                    method: e.target.value as OpenAPIOperation['method'],
                                  })
                                }
                                options={HTTP_METHODS}
                              />
                              <Input
                                label="Operation ID"
                                value={operation.operationId || ''}
                                onChange={(e) => updateOperation(path.id, operation.id, { operationId: e.target.value })}
                                placeholder="getUsers"
                              />
                            </div>

                            <Input
                              label="Summary"
                              value={operation.summary || ''}
                              onChange={(e) => updateOperation(path.id, operation.id, { summary: e.target.value })}
                              placeholder="Short description"
                            />

                            <TextArea
                              label="Description"
                              value={operation.description || ''}
                              onChange={(e) => updateOperation(path.id, operation.id, { description: e.target.value })}
                              placeholder="Detailed description of this operation..."
                              rows={2}
                            />

                            <Input
                              label="Tags (comma-separated)"
                              value={operation.tags?.join(', ') || ''}
                              onChange={(e) =>
                                updateOperation(path.id, operation.id, {
                                  tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                                })
                              }
                              placeholder="users, auth"
                            />

                            {/* Parameters */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium text-gray-700">Parameters</h5>
                                <Button onClick={() => addParameter(path.id, operation.id)} size="sm" variant="secondary">
                                  Add Parameter
                                </Button>
                              </div>

                              {operation.parameters?.map((param) => (
                                <div key={param.id} className="flex gap-3 items-start p-3 bg-white rounded-lg border">
                                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <Input
                                      label="Name"
                                      value={param.name}
                                      onChange={(e) =>
                                        updateParameter(path.id, operation.id, param.id, { name: e.target.value })
                                      }
                                      placeholder="id"
                                    />
                                    <Select
                                      label="Location"
                                      value={param.in}
                                      onChange={(e) =>
                                        updateParameter(path.id, operation.id, param.id, {
                                          in: e.target.value as OpenAPIParameter['in'],
                                        })
                                      }
                                      options={PARAMETER_LOCATIONS}
                                    />
                                    <Select
                                      label="Type"
                                      value={param.schema.type}
                                      onChange={(e) =>
                                        updateParameter(path.id, operation.id, param.id, {
                                          schema: { ...param.schema, type: e.target.value as SchemaObject['type'] },
                                        })
                                      }
                                      options={DATA_TYPES}
                                    />
                                    <div className="flex items-end gap-2">
                                      <label className="flex items-center gap-2 text-sm">
                                        <input
                                          type="checkbox"
                                          checked={param.required}
                                          onChange={(e) =>
                                            updateParameter(path.id, operation.id, param.id, { required: e.target.checked })
                                          }
                                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Required
                                      </label>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeParameter(path.id, operation.id, param.id)}
                                    className="mt-6"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>

                            {/* Request Body Toggle */}
                            {['post', 'put', 'patch'].includes(operation.method) && (
                              <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={!!operation.requestBody}
                                    onChange={(e) => toggleRequestBody(path.id, operation.id, e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  Has Request Body
                                </label>

                                {operation.requestBody && schemas.length > 0 && (
                                  <Select
                                    label="Schema Reference"
                                    value={
                                      (operation.requestBody.content['application/json']?.schema as { $ref?: string }).$ref ||
                                      ''
                                    }
                                    onChange={(e) =>
                                      updateOperation(path.id, operation.id, {
                                        requestBody: {
                                          ...operation.requestBody!,
                                          content: {
                                            'application/json': {
                                              schema: e.target.value
                                                ? { $ref: e.target.value }
                                                : { type: 'object' },
                                            },
                                          },
                                        },
                                      })
                                    }
                                    options={[
                                      { value: '', label: 'Inline Object' },
                                      ...schemas.map((s) => ({
                                        value: `#/components/schemas/${s.name}`,
                                        label: s.name,
                                      })),
                                    ]}
                                  />
                                )}
                              </div>
                            )}

                            {/* Responses */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium text-gray-700">Responses</h5>
                                <Button onClick={() => addResponse(path.id, operation.id)} size="sm" variant="secondary">
                                  Add Response
                                </Button>
                              </div>

                              {operation.responses.map((response) => (
                                <div key={response.id} className="flex gap-3 items-start p-3 bg-white rounded-lg border">
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Select
                                      label="Status Code"
                                      value={response.statusCode}
                                      onChange={(e) =>
                                        updateResponse(path.id, operation.id, response.id, { statusCode: e.target.value })
                                      }
                                      options={STATUS_CODES}
                                    />
                                    <div className="md:col-span-2">
                                      <Input
                                        label="Description"
                                        value={response.description}
                                        onChange={(e) =>
                                          updateResponse(path.id, operation.id, response.id, { description: e.target.value })
                                        }
                                        placeholder="Successful response"
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeResponse(path.id, operation.id, response.id)}
                                    className="mt-6"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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
