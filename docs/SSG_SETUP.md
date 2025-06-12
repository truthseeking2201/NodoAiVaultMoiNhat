# Static Site Generation (SSG) Setup for Vault Data

This document explains how to include vault data at build time for better performance and SEO.

## Overview

We've implemented two approaches to achieve SSG-like behavior for vault data:

1. **Pre-build Script Approach** (Recommended)
2. **Vite Plugin Approach** (Alternative)

## 1. Pre-build Script Approach (Current Implementation)

### How it Works

1. **Build Time**: A script runs before the Vite build to fetch vault data and save it as a static JSON file
2. **Runtime**: The app first tries to load data from the static file, falling back to API calls if needed

### Files Created

- `scripts/prebuild-vault-data.js` - Fetches vault data at build time
- `src/utils/staticVaultData.ts` - Utility functions to load static data
- `src/hooks/useStaticDataInit.ts` - Hook for app initialization
- `public/vault-data.json` - Generated static data file (created during build)

### Usage

#### Building with Static Data

```bash
# Development build
npm run build:dev

# UAT build  
npm run build:uat

# Production build
npm run build
```

#### Using in Components

```typescript
import { useGetDepositVaults } from '@/hooks/useVault';
import { useStaticDataInit } from '@/hooks/useStaticDataInit';

function MyComponent() {
  // Initialize static data on app startup (optional)
  const { isInitialized, isLoading, error } = useStaticDataInit();
  
  // Use the existing hook - it now automatically uses static data first
  const { data: vaults, isLoading: vaultsLoading } = useGetDepositVaults();
  
  if (isLoading || vaultsLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {vaults?.map(vault => (
        <div key={vault.vault_id}>{vault.name}</div>
      ))}
    </div>
  );
}
```

#### Manual Data Loading

```typescript
import { loadVaultData, hasStaticVaultData, getCachedVaultData } from '@/utils/staticVaultData';

// Load data manually
const vaultData = await loadVaultData();

// Check if static data is available
if (hasStaticVaultData()) {
  const cachedData = getCachedVaultData();
}
```

## 2. Vite Plugin Approach (Alternative)

### Setup

Uncomment the plugin configuration in `vite.config.ts`:

```typescript
import { viteSsgPlugin } from "./src/plugins/vite-ssg-plugin";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    viteSsgPlugin({
      dataEndpoints: [
        {
          name: 'vault-data',
          url: `${process.env.VITE_NODO_APP_URL}/data-management/vaults`,
          outputPath: 'vault-data.json'
        }
      ]
    })
  ],
  // ... rest of config
}));
```

### Extending the Plugin

Add more endpoints to pre-fetch additional data:

```typescript
viteSsgPlugin({
  dataEndpoints: [
    {
      name: 'vault-data',
      url: `${process.env.VITE_NODO_APP_URL}/data-management/vaults`,
      outputPath: 'vault-data.json'
    },
    {
      name: 'vault-config',
      url: `${process.env.VITE_NODO_APP_URL}/data-management/vault-config`,
      outputPath: 'vault-config.json'
    }
  ]
})
```

## Environment Variables

Ensure your environment files contain the required variables:

```env
VITE_NODO_APP_URL=https://your-api-endpoint.com
```

## Benefits

### Performance
- ⚡ **Faster Initial Load**: Data is available immediately from static files
- 🔄 **Fallback Mechanism**: Graceful degradation to API calls if static data fails
- 📦 **Cached Data**: Once loaded, data is cached in memory

### SEO & Reliability
- 🔍 **SEO Friendly**: Data is available at build time for crawlers
- 🛡️ **Resilient**: Works even if API is temporarily unavailable
- 📊 **Consistent**: Same data across all users until next deployment

### Development Experience
- 🔧 **No Code Changes**: Existing hooks work without modification
- 📝 **Clear Logging**: Console logs show whether static or API data is used
- 🧪 **Easy Testing**: Can test with and without static data

## Monitoring

The app will log data loading status:

```
✅ Loaded vault data from static file
⚠️ Static vault data not found, falling back to API
❌ Failed to load vault data from API
```

## Troubleshooting

### Static Data Not Generated

1. Check environment variables are set correctly
2. Verify API endpoint is accessible during build
3. Check build logs for errors in the prebuild script

### API Fallback Not Working

1. Ensure `getDepositVaults` function is working correctly
2. Check network connectivity
3. Verify API endpoint configuration

### Performance Issues

1. Monitor bundle size - static data increases bundle size
2. Consider data compression for large datasets
3. Implement data pagination if needed

## Next Steps

To extend this approach to other data:

1. **Add new endpoints** to the prebuild script
2. **Create utility functions** similar to `staticVaultData.ts`
3. **Update hooks** to use the new static data utilities
4. **Test thoroughly** with both static and API data sources 