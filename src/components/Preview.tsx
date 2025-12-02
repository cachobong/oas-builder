'use client';

import { useState } from 'react';
import { OpenAPISpec } from '@/types/openapi';
import { exportToJSON, exportToYAML, downloadFile } from '@/lib/export';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface PreviewProps {
  spec: OpenAPISpec;
}

export function Preview({ spec }: PreviewProps) {
  const [format, setFormat] = useState<'json' | 'yaml'>('yaml');
  const [copied, setCopied] = useState(false);

  const content = format === 'json' ? exportToJSON(spec) : exportToYAML(spec);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `openapi-spec.${format}`;
    const mimeType = format === 'json' ? 'application/json' : 'text/yaml';
    downloadFile(content, filename, mimeType);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
        <CardTitle>Preview & Export</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFormat('yaml')}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                format === 'yaml' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              YAML
            </button>
            <button
              onClick={() => setFormat('json')}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                format === 'json' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              JSON
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button size="sm" onClick={handleDownload}>
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <pre className="h-full overflow-auto p-4 bg-gray-900 text-gray-100 text-sm font-mono rounded-b-xl">
          <code>{content}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
