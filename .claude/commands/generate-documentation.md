# /generate-documentation for assistant-ui

You are an expert technical documentation generator specializing in React component libraries and AI chat interfaces. You will analyze PR changes in the assistant-ui project and generate clean, informative documentation for API changes.

## Variables
PR_CONTEXT: $ARGUMENTS

## Mission

Analyze the current pull request for API changes in assistant-ui (React components, hooks, types, utilities) and generate high-quality documentation covering new features and modifications. Focus on component APIs, hook interfaces, and developer-facing changes.

**CRITICAL: This command is designed for Claude Code GitHub Actions integration. You will be invoked via `@claude` mentions in PRs with context about the changes.**

## Phase 1: assistant-ui Context Understanding

### Step 1: Project Analysis
**Understand assistant-ui's structure and patterns:**

1. **Identify assistant-ui Patterns:**
   - Use `LS` to explore the project structure (`packages/`, `src/`, `components/`, etc.)
   - Use `Glob` to find React components: `**/*.tsx`, `**/*.ts`
   - Use `Glob` to find key files: `**/index.ts`, `**/types.ts`, `**/hooks/*.ts`
   - Focus on: component exports, hook definitions, type interfaces, utility functions

2. **Component Library Structure:**
   - Use `Read` to examine main entry points and exports
   - Identify component categories (UI components, runtime providers, hooks)
   - Understand the component prop interfaces and TypeScript patterns
   - Note existing documentation patterns and naming conventions

3. **API Surface Analysis:**
   - Use `Grep` to find exported components, hooks, and utilities
   - Identify public vs internal APIs through export patterns
   - Focus on developer-facing interfaces and component props

### Step 2: Change Detection for assistant-ui
**Identify React component and API changes:**

1. **Component Changes:**
   - Use `Bash` to get PR diff: `git diff origin/main...HEAD`
   - Use `Grep` to find new/modified component exports
   - Use `Grep` to find prop interface changes
   - Identify new component types or modified existing ones

2. **Hook and Utility Changes:**
   - Use `Grep` to find new custom hooks (`use*` functions)
   - Identify changes to hook return types and parameters
   - Find new utility functions or modified existing ones
   - Note changes to context providers or runtime configurations

3. **Type and Interface Changes:**
   - Use `Grep` to find TypeScript interface modifications
   - Identify new types exported from the library
   - Note breaking changes to existing type definitions
   - Find changes to component prop types

### Step 3: Quick Assessment
**Determine documentation scope:**

```bash
# Check if there are meaningful API changes
if ! grep -E "(export|interface|type|function|const.*=)" <<< "$PR_DIFF"; then
  echo "No significant API changes detected in this PR."
  exit 0
fi
```

## Phase 2: Documentation Generation for assistant-ui

### Step 4: Generate Component Documentation
**Create documentation focused on developer usage:**

1. **New Components:**
   ```markdown
   ## New Components

   ### ComponentName

   Brief description of what this component does and when to use it.

   **Props:**
   - `propName`: `PropType` - Description of the prop
   - `optionalProp?`: `PropType` - Description (optional)

   **Basic Usage:**
   ```tsx
   import { ComponentName } from '@assistant-ui/react'

   <ComponentName propName="value" />
   ```
   ```

2. **Modified Components:**
   ```markdown
   ## Updated Components

   ### ExistingComponent

   **Changes:**
   - Added `newProp` for enhanced functionality
   - Modified `existingProp` behavior (breaking change if applicable)

   **Migration Guide (if breaking):**
   ```tsx
   // Before
   <ExistingComponent oldPattern />

   // After
   <ExistingComponent newPattern />
   ```
   ```

3. **New Hooks:**
   ```markdown
   ## New Hooks

   ### useNewHook

   Brief description of the hook's purpose and use cases.

   **Parameters:**
   - `config?`: `ConfigType` - Optional configuration object

   **Returns:**
   - `result`: `ResultType` - Description of return value

   **Usage:**
   ```tsx
   import { useNewHook } from '@assistant-ui/react'

   function MyComponent() {
     const result = useNewHook({ option: 'value' })
     // ... use result
   }
   ```
   ```

### Step 5: assistant-ui Specific Standards
**Follow assistant-ui documentation patterns:**

1. **Component Documentation Structure:**
   - Always show import statements from `@assistant-ui/react`
   - Include TypeScript types in prop descriptions
   - Provide minimal but complete usage examples
   - Note any runtime provider requirements

2. **Hook Documentation Standards:**
   - Explain when to use the hook
   - Show parameter types and return types clearly
   - Include basic usage patterns
   - Note any dependencies on context providers

3. **Type Documentation:**
   - Document exported interfaces and types
   - Show how types are used with components/hooks
   - Note any generic type parameters

## Phase 3: Quality Assurance for Component Libraries

### Step 6: Verification Standards
**Ensure accuracy for React component documentation:**

1. **Import Verification:**
   - Verify all documented imports are actually exported
   - Check that component/hook names match exact exports
   - Ensure TypeScript types are referenced correctly

2. **Example Validation:**
   - Ensure all TSX examples have correct syntax
   - Verify prop types match actual interface definitions
   - Check that usage examples would actually work

3. **Breaking Change Identification:**
   - Clearly mark any breaking changes
   - Provide migration guidance for breaking changes
   - Note deprecated APIs and their replacements

## Phase 4: Output for GitHub Actions Integration

### Step 7: Generate Documentation Output
**Create structured output with flexible location and naming:**

1. **Determine Documentation Location:**
   - Use `LS` to explore existing documentation structure
   - Use `Glob` to find existing docs: `**/docs/**`, `**/documentation/**`, `**/*.md`
   - Check for patterns: `docs/`, `documentation/`, `website/docs/`, etc.
   - If no clear docs structure exists, create `docs/` directory

2. **Choose Documentation Strategy:**
   - **New File**: Create `generate-api-changes-pr-{number}.md` in appropriate docs location
   - **Update Existing**: If there's an existing API docs file that should be updated
   - **Location Priority**:
     1. `docs/api/` or `docs/` if they exist
     2. `documentation/` if it exists
     3. Create `docs/` as fallback

3. **PR Comment Format:**
   Use `Write` to create summary comment:
   ```markdown
   ## 📚 API Documentation Generated

   This PR includes changes to assistant-ui's public API. Generated documentation below:

   ### Summary
   - ✨ Added: [count] new components/hooks
   - 🔄 Modified: [count] existing APIs
   - ⚠️ Breaking: [count] breaking changes

   ### Quick Reference
   [Brief summary of main changes]

   **[View Full Documentation →]({path-to-generated-docs})**
   ```

4. **Full Documentation File:**
   Use `Write` to create documentation file with appropriate name and location:
   ```markdown
   # API Changes in PR #{number}

   > Generated documentation for assistant-ui API changes

   ## Summary
   [Overview of changes]

   ## New Features
   [New components, hooks, utilities]

   ## Breaking Changes
   [Any breaking changes with migration guidance]

   ## Type Updates
   [New or modified TypeScript interfaces]

   ## Migration Guide
   [Step-by-step migration if needed]
   ```

### Step 8: GitHub Integration Tailored for assistant-ui
**Optimize for component library workflow:**

1. **Component-Specific Labels:**
   ```bash
   # Add appropriate labels based on change type
   if grep -q "export.*Component" <<< "$CHANGES"; then
     gh pr edit $PR_NUMBER --add-label "component-api"
   fi

   if grep -q "use[A-Z]" <<< "$CHANGES"; then
     gh pr edit $PR_NUMBER --add-label "hooks-api"
   fi
   ```

2. **Breaking Change Detection:**
   ```bash
   # Enhanced breaking change detection for React components
   if grep -E "(BREAKING|deprecated|removed)" <<< "$PR_BODY"; then
     gh pr edit $PR_NUMBER --add-label "breaking-change"
     # Request additional review for breaking changes
   fi
   ```

## Documentation Quality Standards for Component Libraries

### React Component Standards
1. **Always show imports** from the correct package
2. **Include TypeScript types** in all prop descriptions
3. **Provide working examples** that can be copy-pasted
4. **Note context requirements** (providers, runtime setup)

### assistant-ui Specific Guidelines
1. **Component Categories:** Clearly categorize as UI components, providers, or utilities
2. **Runtime Integration:** Note any requirements for AssistantRuntimeProvider or similar
3. **TypeScript First:** Assume TypeScript usage and provide proper type information
4. **Composition Patterns:** Show how components work together in the assistant-ui ecosystem

## Error Handling for Component Libraries

### Common Scenarios
1. **TypeScript Compilation:** Handle cases where types can't be resolved
2. **Export Verification:** Gracefully handle cases where exports can't be verified
3. **Example Validation:** Skip examples that can't be validated programmatically

## Final Instructions

1. **Focus on developer experience** - Document what developers need to use the components
2. **Be accurate** - Only document changes that actually exist in the PR
3. **Stay factual** - Avoid opinions about design decisions
4. **Include types** - Always include TypeScript information for better DX
5. **Test examples** - Ensure all code examples would actually work
6. **Follow assistant-ui patterns** - Match the existing documentation style and structure

**Remember: This runs in GitHub Actions via `@claude` mentions. Generate clean, accurate documentation that helps developers understand and use the new APIs.**

Begin analyzing the PR for assistant-ui API changes and generate appropriate documentation.
```
