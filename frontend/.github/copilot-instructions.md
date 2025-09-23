<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Social Media Application

This is a Vue.js 3 application built with Vite, Bootstrap 5, and Pinia for state management. The application features a beautiful gradient design for authentication pages.

## Tech Stack
- Vue.js 3 with Composition API
- Vite for build tooling
- Vue Router for navigation
- Pinia for state management
- Bootstrap 5 for styling
- Custom CSS with gradient backgrounds

## Project Structure
- `/src/views/` - Page components (LoginPage, RegisterPage)
- `/src/stores/` - Pinia stores for state management
- `/src/router/` - Vue Router configuration
- `/src/style.css` - Global styles and gradient backgrounds

## Design Guidelines
- Use Bootstrap 5 classes for responsive design
- Maintain the gradient background theme across all pages
- Use glass-morphism effects with backdrop-filter
- Follow the established color scheme and spacing
- Ensure mobile responsiveness

## Authentication
- Demo credentials: demo@example.com / demo123
- Uses Pinia store for authentication state
- Simulates API calls with promises

## Coding Standards
- Use Vue 3 Composition API
- Use reactive() for forms and computed() for derived state
- Follow Vue.js best practices for component structure
- Use semantic HTML and accessibility features
