# @talking/types

Shared TypeScript type definitions for the Talking monorepo.

## Usage

This package is consumed by other workspace packages using pnpm workspace protocol.

### In other packages

Add to `package.json`:

```json
{
  "dependencies": {
    "@talking/types": "workspace:*"
  }
}
```

### Import types

```typescript
import type { User, Asset, SignedUrlRequest, SignedUrlResponse } from '@talking/types';

// Use in your code
const user: User = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: new Date(),
  updatedAt: new Date()
};
```

## Available Types

- `User` - User entity
- `Asset` - Asset/file metadata entity
- `SignedUrlRequest` - Request payload for signed URL generation
- `SignedUrlResponse` - Response payload for signed URL
- `HealthResponse` - Health check response

## Development

This package exports TypeScript source directly (no build step required).
Types are resolved at compile time by consuming packages.
