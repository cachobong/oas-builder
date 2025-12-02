# OpenAPI Builder

A web application for generating OpenAPI 3.1 specifications through a graphical interface.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Storage**: localStorage (browser)
- **YAML Export**: js-yaml

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind imports and global styles
│   ├── layout.tsx       # Root layout with Inter font
│   └── page.tsx         # Main application page
├── components/
│   ├── editors/
│   │   ├── InfoEditor.tsx      # API info form (title, version, contact, license)
│   │   ├── ServersEditor.tsx   # Server URLs management
│   │   ├── TagsEditor.tsx      # Root-level tags management
│   │   ├── PathsEditor.tsx     # Endpoints and operations editor
│   │   └── SchemasEditor.tsx   # Reusable schema definitions
│   ├── ui/
│   │   ├── Button.tsx    # Button component with variants
│   │   ├── Card.tsx      # Card container components
│   │   ├── Input.tsx     # Text input with label
│   │   ├── Select.tsx    # Dropdown select
│   │   ├── Tabs.tsx      # Tab navigation
│   │   └── TextArea.tsx  # Multiline text input
│   └── Preview.tsx       # Live spec preview with export
├── hooks/
│   └── useOpenAPISpec.ts # State management hook with localStorage sync
├── lib/
│   ├── export.ts         # OpenAPI spec generation and export (JSON/YAML)
│   ├── storage.ts        # localStorage utilities
│   └── utils.ts          # Helper functions (generateId, cn)
└── types/
    └── openapi.ts        # TypeScript types for OpenAPI spec
```

## Commands

```bash
npm run dev    # Start development server
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Key Patterns

- **State Management**: Single `useOpenAPISpec` hook manages all spec data with automatic localStorage persistence
- **Component Structure**: UI primitives in `components/ui/`, feature editors in `components/editors/`
- **Export Flow**: `generateOpenAPISpec()` transforms internal data model to valid OpenAPI 3.1 format
- **Styling**: Tailwind utility classes with `cn()` helper for conditional classes
- **Tags Flow**: Tags are defined at root level (TagsEditor) and selected via checkboxes in PathsEditor operations
