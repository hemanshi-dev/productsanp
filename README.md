# ProductSnap AI

Modern AI Studio website built with React, Tailwind CSS, and PHP backend.

## Features

- 🎨 Modern, responsive UI with smooth animations
- 🔐 User authentication (Email/Password & Google Sign-In)
- 🚀 React + Vite for fast development
- 💅 Tailwind CSS v4 for styling
- 🔧 PHP backend with MySQL database
- 📱 Fully responsive design

## Setup Instructions

### 1. Database Setup

1. Open phpMyAdmin or MySQL command line
2. Import the database schema:
   ```sql
   source api/database/schema.sql
   ```
   Or manually run the SQL file located at `api/database/schema.sql`

### 2. Environment Configuration

1. Copy `env.example` to `.env` in the root directory:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_NAME=shuchiai_studio
   DB_USER=root
   DB_PASS=your_password
   ```

3. For Google OAuth (optional):
   - Get Google Client ID from [Google Cloud Console](https://console.cloud.google.com/)
   - Add it to both `.env` (backend) and create `.env` file in root for frontend:
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_API_URL=http://localhost/shuchiaistudio/api
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The React app will run on `http://localhost:5173`

### 5. PHP Backend

The PHP backend is located in the `api/` directory and should be accessible via:
- `http://localhost/shuchiaistudio/api/auth/login.php`
- `http://localhost/shuchiaistudio/api/auth/register.php`
- `http://localhost/shuchiaistudio/api/auth/google.php`

Make sure XAMPP Apache and MySQL are running.

## Project Structure

```
shuchiaistudio/
├── api/                    # PHP Backend
│   ├── auth/              # Authentication endpoints
│   ├── config/            # Database & CORS configuration
│   └── database/          # Database schema
├── src/                    # React Frontend
│   ├── components/        # React components
│   ├── services/          # API service layer
│   └── types/             # TypeScript types
├── .env                   # Environment variables (create from env.example)
└── package.json          # Node dependencies
```

## API Endpoints

- `POST /api/auth/register.php` - User registration
- `POST /api/auth/login.php` - User login
- `POST /api/auth/google.php` - Google authentication
- `POST /api/auth/logout.php` - User logout
- `GET /api/auth/check.php` - Check authentication status

## Technologies Used

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion
- **Backend**: PHP 7.4+, MySQL
- **Authentication**: Session-based with Google OAuth support

## License

MIT

