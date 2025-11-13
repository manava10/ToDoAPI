# API Endpoints Reference

## Base URL
```
http://localhost:4300
```

## Authentication Endpoints

### 1. Register User
**URL:** `POST http://localhost:4300/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "Message": "User successfully registered",
  "UserId": "507f1f77bcf86cd799439011"
}
```

**Error Response (400):**
```json
{
  "message": "missing required field"
}
```

**Error Response (400) - User exists:**
```json
{
  "message": "User already exists"
}
```

---

### 2. Login User
**URL:** `POST http://localhost:4300/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "Message": "User successfully logged in",
  "Jwt token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```json
{
  "message": "missing required field"
}
```

**Error Response (400) - Invalid credentials:**
```json
{
  "Message": "Invalid email or password"
}
```

---

## Testing Methods

### Method 1: Using cURL

#### Register:
```bash
curl -X POST http://localhost:4300/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:4300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### Method 2: Using Postman

1. **Create a new request**
2. **Set method to POST**
3. **Enter URL:** `http://localhost:4300/api/auth/register` or `http://localhost:4300/api/auth/login`
4. **Go to Body tab**
5. **Select "raw" and "JSON"**
6. **Paste the JSON body** (from above)
7. **Click Send**

---

### Method 3: Using Thunder Client (VS Code Extension)

1. **Install Thunder Client** extension in VS Code
2. **Create a new request**
3. **Set method to POST**
4. **Enter URL:** `http://localhost:4300/api/auth/register` or `http://localhost:4300/api/auth/login`
5. **Set Content-Type header:** `application/json`
6. **Add JSON body** in the Body tab
7. **Click Send**

---

### Method 4: Using JavaScript (Fetch API)

#### Register:
```javascript
fetch('http://localhost:4300/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

#### Login:
```javascript
fetch('http://localhost:4300/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

---

## Quick Test Checklist

### Step 1: Start Server
```bash
npm start
```
Make sure you see: `App is listening on the port 4300`

### Step 2: Test Register
- ✅ Send POST request to `/api/auth/register`
- ✅ Check if user is created successfully
- ✅ Save the response for reference

### Step 3: Test Login
- ✅ Send POST request to `/api/auth/login`
- ✅ Check if token is returned
- ✅ Save the token for future protected routes

### Step 4: Test Error Cases
- ✅ Try registering with missing fields
- ✅ Try registering with existing email
- ✅ Try logging in with wrong password
- ✅ Try logging in with non-existent email

---

## Environment Variables Required

Make sure your `.env` file has:
```
MONGODB_URI=mongodb://localhost:27017/your-database-name
JWT_SECRET=your-secret-key-here
PORT=4300
```

---

## Status Codes

- **200**: Success
- **400**: Bad Request (missing fields, invalid data, user exists, wrong credentials)
- **500**: Internal Server Error

---

## Notes

- All requests must include `Content-Type: application/json` header
- Password is hashed before saving to database
- JWT token expires in 1 hour
- Token should be saved and used in Authorization header for protected routes (coming soon)

