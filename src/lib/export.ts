import yaml from 'js-yaml';
import { OpenAPISpec, OpenAPIPath, OpenAPIOperation, OpenAPIResponse, SchemaObject } from '@/types/openapi';

interface OpenAPIOutput {
  openapi: string;
  info: OpenAPISpec['info'];
  servers: OpenAPISpec['servers'];
  paths: Record<string, Record<string, unknown>>;
  components?: {
    schemas?: Record<string, unknown>;
  };
  tags?: { name: string; description?: string }[];
}

function transformSchema(schema: SchemaObject): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: schema.type,
  };

  if (schema.format) result.format = schema.format;
  if (schema.description) result.description = schema.description;
  if (schema.example) result.example = schema.example;
  if (schema.enum && schema.enum.length > 0) result.enum = schema.enum;

  if (schema.type === 'array' && schema.items) {
    result.items = transformSchema(schema.items);
  }

  if (schema.type === 'object' && schema.properties) {
    result.properties = Object.entries(schema.properties).reduce(
      (acc, [key, value]) => {
        acc[key] = transformSchema(value);
        return acc;
      },
      {} as Record<string, unknown>
    );
    if (schema.required && schema.required.length > 0) {
      result.required = schema.required;
    }
  }

  return result;
}

function transformResponse(response: OpenAPIResponse): Record<string, unknown> {
  const result: Record<string, unknown> = {
    description: response.description || 'Response',
  };

  if (response.content) {
    result.content = Object.entries(response.content).reduce(
      (acc, [mediaType, value]) => {
        if ('$ref' in value.schema) {
          acc[mediaType] = { schema: { $ref: value.schema.$ref } };
        } else {
          acc[mediaType] = { schema: transformSchema(value.schema as SchemaObject) };
        }
        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  return result;
}

function transformOperation(operation: OpenAPIOperation): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (operation.summary) result.summary = operation.summary;
  if (operation.description) result.description = operation.description;
  if (operation.operationId) result.operationId = operation.operationId;
  if (operation.tags && operation.tags.length > 0) result.tags = operation.tags;

  if (operation.parameters && operation.parameters.length > 0) {
    result.parameters = operation.parameters.map((param) => ({
      name: param.name,
      in: param.in,
      description: param.description,
      required: param.required,
      schema: transformSchema(param.schema),
    }));
  }

  if (operation.requestBody) {
    const content: Record<string, unknown> = {};
    Object.entries(operation.requestBody.content).forEach(([mediaType, value]) => {
      if ('$ref' in value.schema) {
        content[mediaType] = { schema: { $ref: value.schema.$ref } };
      } else {
        content[mediaType] = { schema: transformSchema(value.schema as SchemaObject) };
      }
    });
    result.requestBody = {
      description: operation.requestBody.description,
      required: operation.requestBody.required,
      content,
    };
  }

  if (operation.responses && operation.responses.length > 0) {
    result.responses = operation.responses.reduce(
      (acc, response) => {
        acc[response.statusCode] = transformResponse(response);
        return acc;
      },
      {} as Record<string, unknown>
    );
  } else {
    result.responses = { '200': { description: 'Successful response' } };
  }

  return result;
}

function transformPaths(paths: OpenAPIPath[]): Record<string, Record<string, unknown>> {
  return paths.reduce(
    (acc, pathItem) => {
      const pathOperations: Record<string, unknown> = {};
      pathItem.operations.forEach((operation) => {
        pathOperations[operation.method] = transformOperation(operation);
      });
      acc[pathItem.path] = pathOperations;
      return acc;
    },
    {} as Record<string, Record<string, unknown>>
  );
}

export function generateOpenAPISpec(spec: OpenAPISpec): OpenAPIOutput {
  const output: OpenAPIOutput = {
    openapi: spec.openapi,
    info: {
      title: spec.info.title,
      version: spec.info.version,
    },
    servers: spec.servers.filter((s) => s.url),
    paths: transformPaths(spec.paths),
  };

  if (spec.info.description) output.info.description = spec.info.description;
  if (spec.info.termsOfService) output.info.termsOfService = spec.info.termsOfService;
  if (spec.info.contact) output.info.contact = spec.info.contact;
  if (spec.info.license) output.info.license = spec.info.license;

  if (spec.schemas && spec.schemas.length > 0) {
    output.components = {
      schemas: spec.schemas.reduce(
        (acc, schema) => {
          acc[schema.name] = transformSchema(schema.schema);
          return acc;
        },
        {} as Record<string, unknown>
      ),
    };
  }

  if (spec.tags && spec.tags.length > 0) {
    output.tags = spec.tags;
  }

  return output;
}

export function exportToJSON(spec: OpenAPISpec): string {
  const output = generateOpenAPISpec(spec);
  return JSON.stringify(output, null, 2);
}

export function exportToYAML(spec: OpenAPISpec): string {
  const output = generateOpenAPISpec(spec);
  return yaml.dump(output, { indent: 2, lineWidth: -1, noRefs: true });
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
