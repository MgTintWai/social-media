# Social Media App - Frontend

A modern, responsive Vue.js 3 social media application with beautiful UI, real-time interactions, and comprehensive media upload capabilities. Built with Vite, Bootstrap 5, and Pinia for optimal performance and developer experience.

## 🚀 Features

### User Experience
- 🎨 Beautiful gradient background design with modern UI
- � Fully responsive design for all device sizes
- ⚡ Lightning-fast performance with Vite
- 🎯 Smooth navigation with Vue Router 4
- 🎬 Advanced video player with custom controls

### Social Features
- �🔐 Complete authentication system (Login/Register/Logout)
- 🏠 Dynamic home feed with infinite scroll
- 👤 Comprehensive user profile management
- ✍️ Rich post creation and editing
- 💬 Social interactions (like, comment, share)
- 🔍 User search and discovery

### Media Capabilities
- 📸 Image upload with preview (JPG, PNG, GIF, WebP)
- � Video upload with preview (MP4, MOV, AVI, WMV, FLV, WebM)
- 📱 Drag & drop media upload
- 🖼️ Media gallery with lightbox view
- 🎛️ Advanced media controls and editing

### Technical Features
- 🏪 Robust state management with Pinia
- 🔄 Real-time data synchronization
- 🛡️ Form validation and error handling
- 📡 RESTful API integration
- 🎯 Component-based architecture

## 🛠️ Tech Stack

- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **Vite** - Next-generation frontend build tool
- **Vue Router 4** - Official routing library for Vue.js
- **Pinia** - Intuitive state management for Vue
- **Bootstrap 5** - Responsive CSS framework
- **JavaScript ES6+** - Modern JavaScript features

## 📋 Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **Backend API** running on `http://localhost:8000`

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Setup

Create a `.env` file if needed for API configuration:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Ensure Backend is Running

Make sure the Laravel backend is running on `http://localhost:8000`:

```bash
cd ../backend
./start-server.sh
```

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
│   └── vite.svg
├── src/
│   ├── components/           # Reusable Components
│   │   └── MediaUpload.vue   # Advanced file upload component
│   ├── views/                # Page Components
│   │   ├── LoginPage.vue     # User authentication login
│   │   ├── RegisterPage.vue  # New user registration
│   │   ├── HomePage.vue      # Main social feed
│   │   └── ProfilePage.vue   # User profile management
│   ├── stores/               # Pinia State Stores
│   │   ├── auth.js          # Authentication & user state
│   │   └── media.js         # Media upload & management
│   ├── router/               # Vue Router Configuration
│   │   └── index.js         # Route definitions & guards
│   ├── App.vue              # Root application component
│   ├── main.js              # Application entry point
│   └── style.css            # Global styles & themes
├── index.html               # HTML template
├── package.json            # Dependencies & scripts
└── vite.config.js          # Vite build configuration
```

## 🎨 Design System

### Color Scheme
- **Primary Gradient**: Linear gradient from blue to purple to pink
- **Background**: Multi-layered gradient with overlay effects
- **Text Colors**: Dark for readability, white for contrast
- **Accent Colors**: Bootstrap primary, success, and danger variants

### Typography
- **Headings**: Bold, clean fonts with proper hierarchy
- **Body Text**: Readable font sizes with good contrast
- **Interactive Elements**: Clear hover states and transitions

### Layout Components
- **Auth Pages**: Full-screen gradient background with centered cards
- **Main App**: Clean white backgrounds with subtle shadows
- **Cards**: Glass morphism effects with backdrop blur
- **Navigation**: Sticky header with smooth transitions

## 🔧 Key Components

### MediaUpload Component
- **Purpose**: Handle image and video uploads with preview
- **Features**: Drag & drop, file validation, progress indication
- **Supported Formats**: Images (JPG, PNG, GIF, WebP), Videos (MP4, MOV, AVI, etc.)
- **Max File Size**: 200MB for videos, 50MB for images

### Authentication System
- **Login**: Email/password authentication with validation
- **Register**: New user registration with confirmation
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Token Management**: Secure token storage and refresh

### Post Management
- **Create Posts**: Rich text with media attachments
- **Edit Posts**: In-place editing with media management
- **Delete Posts**: Confirmation dialogs and cleanup
- **Media Display**: Responsive images and video players

### User Profiles
- **Profile Display**: User information and post history
- **Profile Editing**: Update user details and avatar
- **Post Management**: View and manage user's posts

## 🌐 API Integration

### Authentication Endpoints
```javascript
// Login
POST /api/login
{
  "email": "user@example.com",
  "password": "password"
}

// Register
POST /api/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

### Posts Endpoints
```javascript
// Get all posts
GET /api/posts

// Create post with media
POST /api/posts
FormData: {
  content: "Post content",
  image: File,
  video: File
}

// Update post
PUT /api/posts/{id}
```

### Users Endpoints
```javascript
// Get user profile
GET /api/users/{id}

// Update profile
PUT /api/users/{id}
```

## 🚀 Production Build

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder with:
- Minified JavaScript and CSS
- Optimized assets
- Source maps for debugging

### Preview Production Build

```bash
npm run preview
```

### Deployment

1. **Static Hosting** (Netlify, Vercel, GitHub Pages):
   ```bash
   npm run build
   # Upload dist/ folder to your hosting service
   ```

2. **Web Server** (Apache, Nginx):
   ```bash
   npm run build
   # Copy dist/ contents to web server directory
   ```

3. **Environment Variables**:
   Set `VITE_API_BASE_URL` to your production API URL

## 🔍 Troubleshooting

### Common Issues

1. **API Connection Issues**:
   - Verify backend is running on `http://localhost:8000`
   - Check CORS settings in Laravel backend
   - Ensure API endpoints are accessible

2. **File Upload Issues**:
   - Check file size limits (200MB for videos)
   - Verify supported file formats
   - Ensure backend PHP settings allow large uploads

3. **Authentication Issues**:
   - Clear browser storage/cookies
   - Check token expiration
   - Verify API credentials

4. **Build Issues**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Update dependencies if needed

### Development Tips

- **Hot Reload**: Changes are automatically reflected in browser
- **Vue DevTools**: Install browser extension for debugging
- **Console Logging**: Check browser console for errors
- **Network Tab**: Monitor API requests and responses

## 🧪 Testing

While formal testing isn't set up yet, you can test features manually:

1. **Authentication Flow**:
   - Register new account
   - Login with credentials
   - Logout and verify redirect

2. **Post Management**:
   - Create posts with text only
   - Create posts with images
   - Create posts with videos
   - Edit existing posts
   - Delete posts

3. **Media Upload**:
   - Test different file formats
   - Test large file uploads
   - Verify preview functionality

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Guidelines

- Use Vue 3 Composition API
- Follow component naming conventions
- Write descriptive commit messages
- Test features across different browsers
- Ensure responsive design

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Features Used**: ES6+, CSS Grid, Flexbox, Fetch API

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the API integration guide
- Create an issue in the repository
- Check browser console for error messages

---

**Note**: This frontend is designed to work with the Laravel backend. Ensure both services are running for full functionality. The backend should be accessible at `http://localhost:8000` for proper API communication.
- **Modern UI:** Clean and contemporary interface
- **Bootstrap Icons:** Full icon set for UI elements
- **Interactive Posts:** Like, comment, and share functionality
- **Media Upload:** Drag & drop photo/video upload with preview
- **File Validation:** Size limits and type checking for uploads
- **Video Player:** Built-in HTML5 video player with controls

## Development

This project uses Vue 3's Composition API for better code organization and TypeScript-like development experience. The authentication system is built with Pinia for reactive state management.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request
