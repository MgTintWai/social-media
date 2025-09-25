# Social Media App - Backend API

A robust Laravel 12 REST API for a modern social media platform with support for posts, media uploads, user authentication, and social interactions.

## 🚀 Features

- **User Authentication**: Registration, login, logout with Laravel Sanctum
- **Posts Management**: Create, read, update, delete posts with rich content
- **Media Upload**: Support for images and videos up to 200MB
- **Social Interactions**: Like, comment, and reaction system
- **User Profiles**: Comprehensive user profile management
- **RESTful API**: Clean, well-documented API endpoints
- **Database**: MySQL with proper relationships and migrations

## 🛠️ Tech Stack

- **Framework**: Laravel 12
- **PHP Version**: ^8.2
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **File Storage**: Local filesystem with support for large uploads
- **Testing**: PHPUnit
- **Code Style**: Laravel Pint

## 📋 Prerequisites

- PHP >= 8.2
- Composer
- MySQL
- Node.js & npm (for asset compilation)

## ⚡ Quick Start

### 1. Clone & Install Dependencies

```bash
cd backend
composer install
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Database Setup

Configure your `.env` file with MySQL credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=social_media_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Create the database and run migrations:

```bash
# Create database
mysql -u your_username -p -e "CREATE DATABASE social_media_db"

# Run migrations
php artisan migrate

# Seed sample data (optional)
php artisan db:seed
```

### 4. Start the Server

For development with large file upload support:

```bash
# Make the script executable
chmod +x start-server.sh

# Start server with custom PHP settings
./start-server.sh
```

The server will start at `http://localhost:8000` with the following optimized settings:
- Upload max filesize: 200MB
- Post max size: 220MB
- Memory limit: 512MB
- Execution time: 600 seconds

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/register` | User registration | No |
| POST | `/api/login` | User login | No |
| POST | `/api/logout` | User logout | Yes |
| GET | `/api/user` | Get current user | Yes |

### Posts Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts` | Get all posts | Yes |
| POST | `/api/posts` | Create new post | Yes |
| GET | `/api/posts/{id}` | Get specific post | Yes |
| PUT | `/api/posts/{id}` | Update post | Yes |
| DELETE | `/api/posts/{id}` | Delete post | Yes |

### Users Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Yes |
| GET | `/api/users/{id}` | Get user profile | Yes |
| PUT | `/api/users/{id}` | Update user profile | Yes |

## 📁 Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/          # API Controllers
│   │   │   ├── AuthController.php
│   │   │   ├── PostController.php
│   │   │   └── UserController.php
│   │   └── Requests/             # Form Request Validation
│   │       ├── StorePostRequest.php
│   │       └── UpdatePostRequest.php
│   └── Models/                   # Eloquent Models
│       ├── User.php
│       ├── Post.php
│       ├── Comment.php
│       └── Reaction.php
├── database/
│   ├── migrations/               # Database Migrations
│   └── seeders/                  # Database Seeders
├── routes/
│   └── api.php                   # API Routes
├── config/                       # Configuration Files
├── storage/                      # File Storage
└── start-server.sh              # Custom Server Script
```

## 🔧 Configuration

### File Upload Settings

The application supports large file uploads with the following limits:

- **Images**: jpg, jpeg, png, gif, webp (max 50MB)
- **Videos**: mp4, mov, avi, wmv, flv, webm (max 200MB)

These settings are configured in:
- `start-server.sh` - PHP runtime settings
- `UpdatePostRequest.php` - Validation rules
- `StorePostRequest.php` - Validation rules

### Database Models

#### User Model
- Authentication and profile management
- Relationships: posts, comments, reactions

#### Post Model
- Content with optional media attachments
- Support for images and videos
- Relationships: user, comments, reactions

#### Comment Model
- User comments on posts
- Relationships: user, post

#### Reaction Model
- Like/reaction system for posts
- Relationships: user, post

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/AuthTest.php

# Run with coverage
php artisan test --coverage
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Configure production database and other settings
   ```

2. **Optimize Application**:
   ```bash
   composer install --no-dev --optimize-autoloader
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **File Permissions**:
   ```bash
   sudo chown -R www-data:www-data storage bootstrap/cache
   sudo chmod -R 775 storage bootstrap/cache
   ```

### Web Server Configuration

For production, configure your web server (Apache/Nginx) to handle large uploads:

**Nginx Example**:
```nginx
client_max_body_size 200M;
client_body_timeout 600s;
```

**Apache Example**:
```apache
LimitRequestBody 209715200  # 200MB
```

## 🔍 Troubleshooting

### Common Issues

1. **413 Payload Too Large Error**:
   - Use `start-server.sh` for development
   - Configure web server limits for production

2. **Database Connection Issues**:
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

3. **File Permission Issues**:
   - Set proper permissions on `storage/` and `bootstrap/cache/`
   - Ensure web server can write to these directories

4. **Memory Limit Issues**:
   - Increase `memory_limit` in PHP configuration
   - Use `start-server.sh` which sets 512MB limit

## 📝 API Usage Examples

### Authentication
```bash
# Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password","password_confirmation":"password"}'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password"}'
```

### Creating a Post with Media
```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Check out this amazing video!" \
  -F "video=@/path/to/video.mp4"
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the API documentation
- Create an issue in the repository

---

**Note**: This backend is designed to work seamlessly with the Vue.js frontend. Make sure both services are running for full functionality.

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
