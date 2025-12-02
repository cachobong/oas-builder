'use client';

import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Tag {
  name: string;
  description?: string;
}

interface TagsEditorProps {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
}

export function TagsEditor({ tags, onChange }: TagsEditorProps) {
  const addTag = () => {
    onChange([...tags, { name: '', description: '' }]);
  };

  const updateTag = (index: number, updates: Partial<Tag>) => {
    const updated = tags.map((tag, i) => (i === index ? { ...tag, ...updates } : tag));
    onChange(updated);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tags</CardTitle>
        <Button onClick={addTag} size="sm">
          Add Tag
        </Button>
      </CardHeader>
      <CardContent>
        {tags.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tags defined. Add tags to categorize and group your API endpoints.
          </p>
        ) : (
          <div className="space-y-4">
            {tags.map((tag, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 space-y-3">
                  <Input
                    label="Tag Name"
                    value={tag.name}
                    onChange={(e) => updateTag(index, { name: e.target.value })}
                    placeholder="users"
                  />
                  <TextArea
                    label="Description"
                    value={tag.description || ''}
                    onChange={(e) => updateTag(index, { description: e.target.value })}
                    placeholder="Operations related to users"
                    rows={2}
                  />
                </div>
                <Button variant="danger" size="sm" onClick={() => removeTag(index)} className="mt-6">
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
