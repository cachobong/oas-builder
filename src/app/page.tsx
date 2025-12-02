'use client';

import { useState } from 'react';
import { useOpenAPISpec } from '@/hooks/useOpenAPISpec';
import { InfoEditor } from '@/components/editors/InfoEditor';
import { ServersEditor } from '@/components/editors/ServersEditor';
import { PathsEditor } from '@/components/editors/PathsEditor';
import { SchemasEditor } from '@/components/editors/SchemasEditor';
import { Preview } from '@/components/Preview';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type Tab = 'info' | 'servers' | 'paths' | 'schemas';

const tabs: { id: Tab; label: string; description: string }[] = [
  { id: 'info', label: 'API Info', description: 'Basic information about your API' },
  { id: 'servers', label: 'Servers', description: 'Server URLs and environments' },
  { id: 'paths', label: 'Endpoints', description: 'API endpoints and operations' },
  { id: 'schemas', label: 'Schemas', description: 'Reusable data models' },
];

export default function Home() {
  const { spec, updateSpec, resetSpec, isLoaded } = useOpenAPISpec();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [showPreview, setShowPreview] = useState(true);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">OpenAPI Builder</h1>
                <p className="text-xs text-gray-500">OpenAPI 3.0 Specification</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to reset? This will clear all your work.')) {
                    resetSpec();
                  }
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={cn('grid gap-6', showPreview ? 'lg:grid-cols-2' : 'grid-cols-1')}>
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
              <nav className="flex gap-1" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Description */}
            <div className="text-sm text-gray-600">
              {tabs.find((t) => t.id === activeTab)?.description}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'info' && (
                <InfoEditor info={spec.info} onChange={(info) => updateSpec({ info })} />
              )}

              {activeTab === 'servers' && (
                <ServersEditor servers={spec.servers} onChange={(servers) => updateSpec({ servers })} />
              )}

              {activeTab === 'paths' && (
                <PathsEditor
                  paths={spec.paths}
                  schemas={spec.schemas}
                  onChange={(paths) => updateSpec({ paths })}
                />
              )}

              {activeTab === 'schemas' && (
                <SchemasEditor schemas={spec.schemas} onChange={(schemas) => updateSpec({ schemas })} />
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
              <Preview spec={spec} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            OpenAPI Builder - Generate OpenAPI 3.0 specifications with ease
          </p>
        </div>
      </footer>
    </div>
  );
}
