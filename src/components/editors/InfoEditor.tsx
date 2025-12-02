'use client';

import { OpenAPIInfo } from '@/types/openapi';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface InfoEditorProps {
  info: OpenAPIInfo;
  onChange: (info: OpenAPIInfo) => void;
}

export function InfoEditor({ info, onChange }: InfoEditorProps) {
  const updateInfo = (updates: Partial<OpenAPIInfo>) => {
    onChange({ ...info, ...updates });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="API Title"
              id="api-title"
              value={info.title}
              onChange={(e) => updateInfo({ title: e.target.value })}
              placeholder="My API"
            />
            <Input
              label="Version"
              id="api-version"
              value={info.version}
              onChange={(e) => updateInfo({ version: e.target.value })}
              placeholder="1.0.0"
            />
          </div>
          <TextArea
            label="Description"
            id="api-description"
            value={info.description || ''}
            onChange={(e) => updateInfo({ description: e.target.value })}
            placeholder="Describe your API..."
            rows={3}
          />
          <Input
            label="Terms of Service URL"
            id="terms-of-service"
            type="url"
            value={info.termsOfService || ''}
            onChange={(e) => updateInfo({ termsOfService: e.target.value })}
            placeholder="https://example.com/terms"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Contact Name"
              id="contact-name"
              value={info.contact?.name || ''}
              onChange={(e) =>
                updateInfo({
                  contact: { ...info.contact, name: e.target.value },
                })
              }
              placeholder="API Support"
            />
            <Input
              label="Contact Email"
              id="contact-email"
              type="email"
              value={info.contact?.email || ''}
              onChange={(e) =>
                updateInfo({
                  contact: { ...info.contact, email: e.target.value },
                })
              }
              placeholder="support@example.com"
            />
            <Input
              label="Contact URL"
              id="contact-url"
              type="url"
              value={info.contact?.url || ''}
              onChange={(e) =>
                updateInfo({
                  contact: { ...info.contact, url: e.target.value },
                })
              }
              placeholder="https://example.com/support"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>License</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="License Name"
              id="license-name"
              value={info.license?.name || ''}
              onChange={(e) =>
                updateInfo({
                  license: { ...info.license, name: e.target.value },
                })
              }
              placeholder="MIT"
            />
            <Input
              label="License URL"
              id="license-url"
              type="url"
              value={info.license?.url || ''}
              onChange={(e) =>
                updateInfo({
                  license: { name: info.license?.name || '', ...info.license, url: e.target.value },
                })
              }
              placeholder="https://opensource.org/licenses/MIT"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
