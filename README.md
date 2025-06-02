# Welcome to your NODO AI Vaults project

## Project info

**URL**: https://NODO AI Vaults.dev/projects/5f9801db-6e7c-4942-b99e-6af02d9f3c32

## How can I edit this code?

There are several ways of editing your application.

**Use NODO AI Vaults**

Simply visit the [NODO AI Vaults Project](https://NODO AI Vaults.dev/projects/5f9801db-6e7c-4942-b99e-6af02d9f3c32) and start prompting.

Changes made via NODO AI Vaults will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in NODO AI Vaults.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [NODO AI Vaults](https://NODO AI Vaults.dev/projects/5f9801db-6e7c-4942-b99e-6af02d9f3c32) and click on Share -> Publish.

## Can I connect a custom domain to my NODO AI Vaults project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.NODO AI Vaults.dev/tips-tricks/custom-domain#step-by-step-guide)

# TailwindCSS Styling Guidelines

## Overview
This project uses TailwindCSS for styling components and layouts. Follow these guidelines to maintain consistent styling across the application.

## Key Principles
1. Use Tailwind's utility classes directly in HTML/JSX
2. Follow mobile-first responsive design
3. Maintain consistent spacing and sizing
4. Use the project's color palette

## Common Patterns

### Layout
- Use `container` for main content wrapper
- Use `flex` and `grid` for layouts
- Use `p-4`, `m-4` for consistent spacing
- Use `max-w-{size}` for content width constraints

### Typography
- Use `text-{size}` for font sizes (e.g., `text-sm`, `text-base`, `text-lg`)
- Use `font-{weight}` for font weights (e.g., `font-normal`, `font-medium`, `font-bold`)
- Use `text-{color}` for text colors

### Colors
- Use semantic color classes (e.g., `text-primary`, `bg-secondary`)
- Use opacity modifiers (e.g., `bg-black/50` for 50% opacity)
- Use hover/focus states (e.g., `hover:bg-blue-600`)

### Components
- Use `rounded-{size}` for border radius
- Use `shadow-{size}` for box shadows
- Use `border` and `border-{color}` for borders

## Best Practices
1. Group related utility classes together
2. Use responsive prefixes (sm:, md:, lg:, xl:) for breakpoints
3. Extract common patterns into components when reused
4. Use Tailwind's @apply directive sparingly and only in component-specific styles

## Example
```jsx
<div className="container mx-auto p-4">
  <div className="flex flex-col md:flex-row gap-4">
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800">Title</h2>
      <p className="text-gray-600 mt-2">Content</p>
    </div>
  </div>
</div>
```
