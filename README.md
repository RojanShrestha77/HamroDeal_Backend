# ⚙️ HamroDeal Backend — REST API

The shared backend for both HamroDeal Flutter mobile app and HamroDeal Web (Next.js). Built with Node.js, Express, and MongoDB — handles authentication, product management, cart, and orders via a RESTful API.

> **Note:** This repo also contains a separate **Lost & Found API** built as a college project (see the schema section below).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| File Uploads | Multer |
| Security | Helmet, XSS-Clean, Rate Limiting |
| Caching | Redis |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (>=18.0.0)
- MongoDB running locally or a MongoDB Atlas URI
- Redis (optional, for caching)

### Installation

```bash
# Clone the repo
git clone https://github.com/RojanShrestha77/HamroDealApp_backend.git
cd HamroDealApp_backend

# Install dependencies
npm install

# Configure environment
# Create config/config.env with the following:
```

```env
NODE_ENV=development
PORT=3000
LOCAL_DATABASE_URI=mongodb://127.0.0.1:27017/hamrodeal
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
```

```bash
# Start the development server
npm run dev
```

Server runs at `http://localhost:3000`

---

## 📡 API Endpoints

**Base URL:** `http://localhost:3000/api/v1`

### Authentication

Protected routes require a JWT token in the request header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 👤 Auth / Students

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/students` | Register new user | No |
| POST | `/students/login` | Login & get token | No |
| GET | `/students` | Get all users | Yes |
| GET | `/students/:id` | Get user profile | No |
| PUT | `/students/:id` | Update profile | Yes |
| DELETE | `/students/:id` | Delete account | Yes |
| POST | `/students/upload` | Upload profile picture | No |

**Register:**
```json
POST /api/v1/students
{
  "name": "Rojan Shrestha",
  "username": "rojan77",
  "email": "rojan@example.com",
  "password": "password123",
  "phoneNumber": "+977-9800000000"
}
```

**Login:**
```json
POST /api/v1/students/login
{
  "email": "rojan@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 📦 Items / Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/items` | Create item | Yes |
| GET | `/items` | Get all items (paginated) | No |
| GET | `/items/:id` | Get single item | No |
| PUT | `/items/:id` | Update item | Yes |
| DELETE | `/items/:id` | Delete item | Yes |
| POST | `/items/upload-photo` | Upload photo | Yes |
| POST | `/items/upload-video` | Upload video | Yes |

**Get Items with Filters:**
```
GET /api/v1/items?page=1&limit=10&type=lost&status=available
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": [...]
}
```

---

### 🗂️ Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/categories` | Create category | Yes |
| GET | `/categories` | Get all categories | No |
| GET | `/categories/:id` | Get single category | No |
| PUT | `/categories/:id` | Update category | Yes |
| DELETE | `/categories/:id` | Delete category | Yes |

---

### 💬 Comments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/comments` | Add comment | Yes |
| GET | `/comments/item/:itemId` | Get comments for item | No |
| GET | `/comments/:id/replies` | Get replies | No |
| PUT | `/comments/:id` | Edit comment | Yes |
| DELETE | `/comments/:id` | Delete comment | Yes |
| POST | `/comments/:id/like` | Like / unlike | Yes |
| GET | `/comments/mentions/:studentId` | Get @mentions | No |

---

## 🌱 Seed Data

Populate the database with test data:

```bash
# Insert seed data
node seed-data.js -i

# Delete all seed data
node seed-data.js -d
```

**Test credentials (after seeding):**

| Email | Password |
|-------|----------|
| kiranrana@softwarica.edu.np | password123 |
| sarah.johnson@softwarica.edu.np | password123 |
| michael.chen@softwarica.edu.np | password123 |

---

## 🗄️ Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Student    │     │     Item     │     │   Category   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ _id          │◄────│ reportedBy   │     │ _id          │
│ name         │◄────│ claimedBy    │────►│ name         │
│ email        │     │ category     │     │ description  │
│ username     │     │ itemName     │     │ status       │
│ password     │     │ description  │     └──────────────┘
│ phoneNumber  │     │ type         │
│ profilePic   │     │ location     │
│ createdAt    │     │ media        │
└──────────────┘     │ isClaimed    │
        ▲            │ status       │
        │            └──────────────┘
        │                  ▲
┌───────┴──────┐           │
│   Comment    │           │
├──────────────┤           │
│ text         │───────────┘
│ commentedBy  │
│ parentComment│ (self-ref for replies)
│ likes[]      │
│ isEdited     │
└──────────────┘
```

---

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication with expiry
- Rate limiting (100 req/15min globally, 5 login attempts)
- XSS attack prevention
- NoSQL injection prevention
- CORS configuration
- Helmet security headers

---

## 📁 Project Structure

```
├── server.js           # Entry point
├── config/             # DB connection, environment config
├── models/             # Mongoose schemas (Student, Item, Category, Comment)
├── controllers/        # Route handler logic
├── routes/             # Express route definitions
├── middleware/         # Auth middleware, error handlers
├── public/             # Uploaded files (photos, videos)
├── seed-data.js        # Database seeding script
└── test-api.js         # API test script
```

---

## 🔗 Related Repos

| Repo | Description |
|------|-------------|
| [HamroDeal](https://github.com/RojanShrestha77/HamroDeal) | Flutter mobile app |
| [HamroDeal_Web](https://github.com/RojanShrestha77/HamroDeal_Web) | Next.js web app |

---

## 👨‍💻 Author

**Rojan Shrestha** — [github.com/RojanShrestha77](https://github.com/RojanShrestha77)
