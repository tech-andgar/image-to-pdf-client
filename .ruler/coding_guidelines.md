# JavaScript/React Coding Guidelines

## General Style

- Follow Biome configuration for code linting and adhere to its rules
- Use Biome for consistent code formatting
- Write functional components over class components in React
- Keep components small, focused, and reusable
- Use TypeScript for type safety where possible
- Maintain clean import/export statements

## Naming Conventions

- Use camelCase for variables, functions, and file names (except components)
- Use PascalCase for React components and component file names
- Use kebab-case for CSS class names
- Use UPPER_SNAKE_CASE for constants

## Best Practices

- Always validate file inputs on the client side before processing
- Implement proper error handling for async operations like PDF generation
- Optimize images before PDF creation to manage file sizes
- Ensure UI responsiveness across different screen sizes using CSS Flexbox/Grid
- Avoid blocking the main thread for heavy computations (consider Web Workers when needed)

## Security

- Validate and sanitize all user inputs, especially file types and sizes
- Avoid executing external code or scripts from user inputs
- Ensure secure handling of file downloads
