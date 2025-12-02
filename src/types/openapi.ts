export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
    identifier?: string;
  };
  summary?: string;
}

export interface OpenAPIServer {
  url: string;
  description?: string;
}

export interface OpenAPIParameter {
  id: string;
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required: boolean;
  schema: SchemaObject;
}

export interface SchemaObject {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
  types?: ('string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null')[];
  format?: string;
  description?: string;
  example?: unknown;
  examples?: unknown[];
  items?: SchemaObject;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  enum?: string[];
  const?: unknown;
  $ref?: string;
  contentMediaType?: string;
  contentEncoding?: string;
}

export interface OpenAPIRequestBody {
  description?: string;
  required: boolean;
  content: {
    [mediaType: string]: {
      schema: SchemaObject | { $ref: string };
    };
  };
}

export interface OpenAPIResponse {
  id: string;
  statusCode: string;
  description: string;
  content?: {
    [mediaType: string]: {
      schema: SchemaObject | { $ref: string };
    };
  };
}

export interface OpenAPIOperation {
  id: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: OpenAPIResponse[];
}

export interface OpenAPIPath {
  id: string;
  path: string;
  operations: OpenAPIOperation[];
}

export interface OpenAPISchema {
  id: string;
  name: string;
  schema: SchemaObject;
}

export interface OpenAPISpec {
  openapi: string;
  info: OpenAPIInfo;
  servers: OpenAPIServer[];
  paths: OpenAPIPath[];
  schemas: OpenAPISchema[];
  tags?: { name: string; description?: string }[];
}

export const DEFAULT_SPEC: OpenAPISpec = {
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API description',
  },
  servers: [{ url: 'https://api.example.com', description: 'Production server' }],
  paths: [],
  schemas: [],
  tags: [],
};
