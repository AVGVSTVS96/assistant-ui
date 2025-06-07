# API Changes - PR #4: Support export of loading state for ThreadList and ThreadMessages

This document describes the API changes introduced in PR #4 that add loading state support for ThreadList and ThreadMessages components.

## New Hooks

### `useThreadListIsLoading`

A new convenience hook to access the loading status of the thread list.

**Signature:**
```typescript
function useThreadListIsLoading(options?: { optional?: boolean }): boolean;
```

**Parameters:**
- `options.optional` - If true, returns `false` if assistant context is not found. Defaults to `false`.

**Returns:**
- `boolean` - `true` if the thread list is currently loading, `false` otherwise.

**Example:**
```tsx
import { useThreadListIsLoading, useAssistantRuntime } from "@assistant-ui/react";

function MyThreadListNavigator() {
  const isLoading = useThreadListIsLoading();
  const assistantRuntime = useAssistantRuntime();

  const handleRefreshThreads = () => {
    assistantRuntime.threads.triggerLoadThreads().catch(err => {
      console.error("Failed to load threads:", err);
    });
  };

  if (isLoading) {
    return <div>Loading threads...</div>;
  }

  return (
    <div>
      <button onClick={handleRefreshThreads}>Refresh Threads</button>
      {/* Your thread list UI */}
    </div>
  );
}
```

### `useThreadMessagesIsLoading`

A new convenience hook to access the message loading status of the current thread.

**Signature:**
```typescript
function useThreadMessagesIsLoading(options?: { optional?: boolean }): boolean;
```

**Parameters:**
- `options.optional` - If true, returns `false` if thread context is not found. Defaults to `false`.

**Returns:**
- `boolean` - `true` if messages are currently loading for the thread, `false` otherwise.

**Example:**
```tsx
import { useThreadMessagesIsLoading } from "@assistant-ui/react";

function MyThreadComponent() {
  const isLoading = useThreadMessagesIsLoading();

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  return <div>{/* Thread content */}</div>;
}
```

## Updated Components

### ThreadPrimitive.If

The `ThreadPrimitive.If` component now supports a new `isLoadingMessages` prop.

**New Props:**
- `isLoadingMessages?: boolean` - Renders children if the thread is currently loading messages (e.g., on initial load)
- `disabled?: boolean` - Renders children if the thread is disabled

**Example:**
```tsx
import { ThreadPrimitive } from "@assistant-ui/react";

// Show loading state while messages are loading
<ThreadPrimitive.If isLoadingMessages={true}>
  <div>Loading messages...</div>
</ThreadPrimitive.If>

// Show content when messages are loaded
<ThreadPrimitive.If isLoadingMessages={false}>
  {/* Render messages or other content */}
</ThreadPrimitive.If>

// Show disabled state
<ThreadPrimitive.If disabled={true}>
  <div>Thread is disabled</div>
</ThreadPrimitive.If>
```

### ThreadListPrimitive.If (New Component)

A new conditional rendering component for thread list loading states.

**Props:**
- `isLoading: boolean` - If `true`, children render when thread list is loading. If `false`, children render when thread list is NOT loading.

**Example:**
```tsx
import { ThreadListPrimitive } from "@assistant-ui/react";

<ThreadListPrimitive.If isLoading={true}>
  <div>Loading threads...</div>
</ThreadListPrimitive.If>

<ThreadListPrimitive.If isLoading={false}>
  <ThreadListPrimitive.Items components={{ ThreadListItem: MyThreadListItemComponent }} />
</ThreadListPrimitive.If>
```

## Updated Runtime Types

### ThreadListState

The `ThreadListState` type now includes:

**New Properties:**
- `isLoading: boolean` - Indicates if the thread list is currently being loaded

### ThreadState

The `ThreadState` type now includes:

**New Properties:**
- `isLoadingMessages: boolean` - Indicates if messages for the thread are currently being loaded

### ThreadListRuntime

The `ThreadListRuntime` now includes:

**New Methods:**
- `triggerLoadThreads(): Promise<void>` - Initiates loading of threads, setting `isLoading` to `true` during the operation

## Breaking Changes

None. All changes are additive and maintain backward compatibility.

## Migration Guide

No migration is required as all changes are additive. To use the new loading states:

1. Use `useThreadListIsLoading()` hook to access thread list loading state
2. Use `useThreadMessagesIsLoading()` hook to access thread message loading state  
3. Use `ThreadPrimitive.If` with `isLoadingMessages` prop for conditional rendering based on message loading
4. Use the new `ThreadListPrimitive.If` component for conditional rendering based on thread list loading
5. Access `isLoading` property from `ThreadListState` and `isLoadingMessages` from `ThreadState` when using runtime state directly