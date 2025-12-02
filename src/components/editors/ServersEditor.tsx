'use client';

import { OpenAPIServer } from '@/types/openapi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface ServersEditorProps {
  servers: OpenAPIServer[];
  onChange: (servers: OpenAPIServer[]) => void;
}

export function ServersEditor({ servers, onChange }: ServersEditorProps) {
  const addServer = () => {
    onChange([...servers, { url: '', description: '' }]);
  };

  const updateServer = (index: number, updates: Partial<OpenAPIServer>) => {
    const updated = servers.map((server, i) => (i === index ? { ...server, ...updates } : server));
    onChange(updated);
  };

  const removeServer = (index: number) => {
    onChange(servers.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Servers</CardTitle>
        <Button onClick={addServer} size="sm">
          Add Server
        </Button>
      </CardHeader>
      <CardContent>
        {servers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No servers configured. Add a server to get started.</p>
        ) : (
          <div className="space-y-4">
            {servers.map((server, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 space-y-3">
                  <Input
                    label="Server URL"
                    value={server.url}
                    onChange={(e) => updateServer(index, { url: e.target.value })}
                    placeholder="https://api.example.com"
                  />
                  <Input
                    label="Description"
                    value={server.description || ''}
                    onChange={(e) => updateServer(index, { description: e.target.value })}
                    placeholder="Production server"
                  />
                </div>
                <Button variant="danger" size="sm" onClick={() => removeServer(index)} className="mt-6">
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
