# Express.js Project Structure Guide

## Table of Contents
1. [Overview: MVC Pattern](#overview-mvc-pattern)
2. [Folder Structure Explained](#folder-structure-explained)
3. [How Components Connect](#how-components-connect)
4. [Request Flow](#request-flow)
5. [Best Practices](#best-practices)
6. [Adding New Features](#adding-new-features)

---

## Overview: MVC Pattern

Express.js applications typically follow the **MVC (Model-View-Controller)** pattern:

- **Model**: Defines the database schema and data structure (Mongoose models)
- **View**: What the client sees (in API projects, this is JSON responses)
- **Controller**: Contains the business logic that processes requests

**Why separate these?**
- **Organization**: Easy to find and modify code
- **Reusability**: Use the same model in different controllers
- **Maintainability**: Changes in one place don't break other parts
- **Testing**: Test each component independently

---

## Folder Structure Explained

### 📁 Project Root
```
TODO/
├── server.js              # Entry point - starts the app
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (never commit this!)
│
├── config/                # Configuration files
│   └── db.js             # Database connection
│
├── models/                # Database models (Mongoose schemas)
│   ├── users.js          # User model
│   └── notes.js          # Notes model
│
├── controllers/           # Business logic (request handlers)
│   └── auth.controller.js # Authentication logic
│
├── routes/                # Route definitions (URL paths)
│   └── auth.routes.js    # Auth routes
│
└── middleware/            # Custom middleware (optional)
    └── auth.middleware.js # JWT verification (we'll create this)
```

---

## What Each Component Does

### 1. `server.js` - The Entry Point

**Purpose**: Starts your Express application and connects everything together.

**What it does**:
- Creates the Express app
- Connects to the database
- Sets up middleware (CORS, JSON parser)
- Registers routes
- Starts the server

**Example from your code**:
```javascript
const express = require('express');
const app = express();
app.use(express.json());        // Parse JSON requests
app.use('/api/auth', authRoutes); // Connect routes
app.listen(4300);               // Start server
```

**Think of it as**: The main door to your house - everything enters through here.

---

### 2. `config/` - Configuration Files

**Purpose**: Contains setup and configuration code that's used across the app.

**Example: `config/db.js`**
```javascript
// Connects to MongoDB
// Used once when the app starts
// Exported as a function to be called in server.js
```

**When to use**: Database connections, external API keys, app-wide settings.

**Think of it as**: The utility room - things everyone needs but stored in one place.

---

### 3. `models/` - Database Models

**Purpose**: Defines the structure of your data in the database.

**What it contains**:
- Schema definition (what fields, what types)
- Validation rules
- The model itself (used to query the database)

**Example: `models/users.js`**
```javascript
const UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true}
}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);
```

**Key Points**:
- One file = One database collection/table
- Defines WHAT data looks like
- Does NOT contain business logic
- Used in controllers to save/find/update data

**Think of it as**: A blueprint - defines the structure, but doesn't build the house.

---

### 4. `controllers/` - Business Logic

**Purpose**: Contains the actual logic that processes requests and generates responses.

**What it does**:
- Receives the request (`req`)
- Validates input data
- Interacts with models (database)
- Processes business logic
- Sends the response (`res`)

**Example: `controllers/auth.controller.js`**
```javascript
exports.register = async (req, res) => {
    // 1. Get data from request
    const {name, email, password} = req.body;
    
    // 2. Validate input
    if(!name || !email || !password) {
        return res.status(400).json({message: "missing required field"});
    }
    
    // 3. Check if user exists (interact with model)
    const exist = await User.findOne({email: email});
    
    // 4. Business logic (hash password, create user)
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({name, email, password: hashedPassword});
    
    // 5. Send response
    return res.status(200).json({Message: "User successfully registered"});
}
```

**Key Points**:
- One file per feature/resource (auth, notes, users, etc.)
- Each function handles ONE specific action
- Uses models to interact with database
- Always sends a response back

**Think of it as**: The chef in a restaurant - takes orders (requests), prepares food (logic), serves it (responses).

---

### 5. `routes/` - URL Paths

**Purpose**: Maps URLs to controller functions.

**What it does**:
- Defines which URL triggers which controller function
- Groups related endpoints together
- Minimal logic - just routing

**Example: `routes/auth.routes.js`**
```javascript
const router = express.Router();
const {register, login} = require("../controllers/auth.controller");

router.post("/register", register);  // POST /api/auth/register → register function
router.post("/login", login);        // POST /api/auth/login → login function

module.exports = router;
```

**Key Points**:
- One file per resource/feature
- Maps HTTP methods (GET, POST, PUT, DELETE) to controller functions
- No business logic here - just routing
- Gets connected to server.js with a base path (e.g., `/api/auth`)

**Think of it as**: A receptionist - directs visitors (requests) to the right department (controller).

---

## How Components Connect

### The Connection Flow:

```
Client Request
    ↓
server.js (app.use('/api/auth', authRoutes))
    ↓
routes/auth.routes.js (router.post('/register', register))
    ↓
controllers/auth.controller.js (exports.register = ...)
    ↓
models/users.js (User.findOne(), User.create())
    ↓
Database (MongoDB)
    ↓
Response sent back through the chain
```

### Step-by-Step Example:

**1. Request arrives**: `POST http://localhost:4300/api/auth/register`

**2. server.js receives it**:
```javascript
app.use('/api/auth', authRoutes);  // Matches /api/auth/*
```

**3. Routes file routes it**:
```javascript
router.post("/register", register);  // Matches /register
// Full path: /api/auth + /register = /api/auth/register
```

**4. Controller processes it**:
```javascript
exports.register = async (req, res) => {
    // req.body contains {name, email, password}
    // Logic happens here
    // res.json() sends response
}
```

**5. Model interacts with database**:
```javascript
const user = await User.create({name, email, password});
// User model (from models/users.js) saves to database
```

**6. Response sent back**:
```javascript
res.status(200).json({Message: "User successfully registered"});
```

---

## Request Flow

### Complete Flow Diagram:

```
┌─────────────┐
│   Client    │  Sends: POST /api/auth/register
│  (Browser/  │  Body: {name, email, password}
│  Postman)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  server.js  │  1. Receives request
│             │  2. Parses JSON body
│             │  3. Routes to /api/auth
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   routes/   │  4. Matches POST /register
│auth.routes  │  5. Calls register function
└──────┬──────┘
       │
       ▼
┌─────────────┐
│controllers/ │  6. Validates input
│auth.controller│ 7. Checks if user exists
│             │  8. Hashes password
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  models/    │  9. User.create() saves to DB
│  users.js   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │  10. Data saved
│  (MongoDB)  │
└──────┬──────┘
       │
       ▼ (Response flows back)
┌─────────────┐
│  Client     │  Receives: {Message: "User successfully registered"}
└─────────────┘
```

---

## Best Practices

### 1. **Separation of Concerns**
- **Routes**: Only routing, no logic
- **Controllers**: Only business logic, no routing
- **Models**: Only data structure, no business logic

### 2. **Naming Conventions**
- **Files**: Use lowercase with dots (e.g., `auth.controller.js`)
- **Functions**: Use camelCase (e.g., `registerUser`)
- **Models**: Use PascalCase (e.g., `User`, `Note`)
- **Routes**: Use kebab-case in URLs (e.g., `/api/auth/register`)

### 3. **File Organization**
```
controllers/
  ├── auth.controller.js    # All auth logic
  ├── notes.controller.js   # All notes logic
  └── users.controller.js   # All user logic

routes/
  ├── auth.routes.js        # All auth routes
  ├── notes.routes.js       # All notes routes
  └── users.routes.js       # All user routes

models/
  ├── users.js              # User model
  └── notes.js              # Notes model
```

### 4. **Error Handling**
- Always use try-catch in async functions
- Return appropriate HTTP status codes
- Provide clear error messages

### 5. **Code Structure in Controllers**
```javascript
exports.functionName = async (req, res) => {
    try {
        // 1. Extract data from request
        const {field1, field2} = req.body;
        
        // 2. Validate input
        if(!field1 || !field2) {
            return res.status(400).json({message: "Missing fields"});
        }
        
        // 3. Business logic
        // ... your logic here ...
        
        // 4. Interact with database (using models)
        const result = await Model.create({field1, field2});
        
        // 5. Send response
        return res.status(200).json({message: "Success", data: result});
        
    } catch (error) {
        // 6. Handle errors
        return res.status(500).json({message: "Server error", error: error.message});
    }
}
```

---

## Adding New Features

### Example: Adding a "Notes" Feature

#### Step 1: Check if Model exists
- ✅ `models/notes.js` already exists

#### Step 2: Create Controller
**File: `controllers/notes.controller.js`**
```javascript
const Note = require('../models/notes');

exports.createNote = async (req, res) => {
    // Logic to create a note
}

exports.getNotes = async (req, res) => {
    // Logic to get all notes
}

exports.updateNote = async (req, res) => {
    // Logic to update a note
}

exports.deleteNote = async (req, res) => {
    // Logic to delete a note
}
```

#### Step 3: Create Routes
**File: `routes/notes.routes.js`**
```javascript
const express = require("express");
const router = express.Router();
const {createNote, getNotes, updateNote, deleteNote} = require("../controllers/notes.controller");

router.post("/", createNote);           // POST /api/notes
router.get("/", getNotes);              // GET /api/notes
router.put("/:id", updateNote);         // PUT /api/notes/:id
router.delete("/:id", deleteNote);      // DELETE /api/notes/:id

module.exports = router;
```

#### Step 4: Connect to Server
**File: `server.js`**
```javascript
const notesRoutes = require('./routes/notes.routes');
app.use('/api/notes', notesRoutes);
```

#### Step 5: Add Middleware (if needed)
If notes require authentication, create middleware:
**File: `middleware/auth.middleware.js`**
```javascript
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // Verify JWT token
    // If valid, call next()
    // If invalid, send error
}
```

Then use it in routes:
```javascript
const {verifyToken} = require('../middleware/auth.middleware');
router.post("/", verifyToken, createNote);  // Protected route
```

---

## Common Patterns

### Pattern 1: CRUD Operations
```javascript
// Controller
exports.create = async (req, res) => { /* Create */ }
exports.read = async (req, res) => { /* Read */ }
exports.update = async (req, res) => { /* Update */ }
exports.delete = async (req, res) => { /* Delete */ }

// Routes
router.post("/", create);
router.get("/", read);
router.put("/:id", update);
router.delete("/:id", delete);
```

### Pattern 2: Authentication Flow
```javascript
// 1. Register → Create user → Hash password → Save to DB
// 2. Login → Find user → Compare password → Generate token
// 3. Protected routes → Verify token → Allow access
```

### Pattern 3: Error Handling
```javascript
try {
    // Your code
} catch (error) {
    if (error.name === 'ValidationError') {
        return res.status(400).json({message: error.message});
    }
    return res.status(500).json({message: "Server error"});
}
```

---

## Quick Reference

### Import/Export Patterns

**Export from Controller:**
```javascript
// Method 1: Named exports
exports.functionName = async (req, res) => { }

// Method 2: Module exports
module.exports = {
    functionName: async (req, res) => { }
}
```

**Import in Routes:**
```javascript
const {functionName} = require('../controllers/controller');
```

**Export from Model:**
```javascript
module.exports = mongoose.model('ModelName', Schema);
```

**Import in Controller:**
```javascript
const Model = require('../models/model');
```

**Export from Routes:**
```javascript
module.exports = router;
```

**Import in Server:**
```javascript
const routes = require('./routes/routes');
app.use('/api/path', routes);
```

---

## Summary

### Remember This Flow:
1. **Request** → server.js
2. **Routing** → routes/
3. **Logic** → controllers/
4. **Data** → models/
5. **Database** → MongoDB
6. **Response** → Back to client

### Key Principles:
- **Routes** = Where to go
- **Controllers** = What to do
- **Models** = What data looks like
- **One responsibility** per file
- **Keep it simple** and organized

### When in Doubt:
1. Ask: "What is this file's job?"
2. Keep related code together
3. Don't mix routing with logic
4. Use models for all database operations
5. Handle errors properly

---

## Next Steps

1. ✅ You've set up auth (register, login)
2. Next: Create notes API (CRUD operations)
3. Then: Add authentication middleware
4. Finally: Add validation and error handling

Good luck with your project! 🚀

