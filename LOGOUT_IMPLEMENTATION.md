# How to Implement Logout with JWT Tokens

## 🤔 Understanding the Challenge

**Important:** JWT tokens are **stateless** - the server doesn't track which tokens exist. Once a token is issued, it's valid until it expires (in your case, 1 hour).

**Problem:** You can't "delete" a token from the server because the server doesn't store them!

**Solution Options:**
1. **Client-side logout** (Simple) - Just delete token from client storage
2. **Token blacklist** (More secure) - Store invalidated tokens on server
3. **Refresh token pattern** (Most secure) - Short-lived access tokens + refresh tokens

---

## ✅ Approach 1: Client-Side Logout (Simplest)

### How It Works:
- Client just deletes the token from localStorage/sessionStorage
- Token is still technically valid until it expires
- Simple but less secure (token can still be used if stolen)

### Implementation:

**Client-side (frontend):**
```javascript
// Just delete the token
localStorage.removeItem('token');
// Redirect to login page
```

**Backend:**
- No backend implementation needed!
- Just create a logout endpoint that returns success
- The real logout happens on the client

---

## 🔒 Approach 2: Token Blacklist (Recommended)

### How It Works:
- Store invalidated tokens in database or memory
- Check blacklist in authentication middleware
- Reject requests with blacklisted tokens

### Implementation Hints:

#### Step 1: Create a Token Blacklist Model/Storage

**Option A: Use MongoDB (Database)**
- Create a model for blacklisted tokens
- Store token + expiry time
- Check in middleware before verifying token

**Option B: Use In-Memory (Simple but lost on restart)**
- Use a Set or Map in memory
- Store token strings
- Check in middleware

**Hint for Option A (Database):**
- Create `models/blacklistedTokens.js`
- Schema: `{ token: String, expiresAt: Date }`
- Create index on `token` field

#### Step 2: Create Logout Controller Function

**File:** `controllers/auth.controller.js`

**What it should do:**
1. Extract token from Authorization header (same way middleware does)
2. Decode token to get expiry time
3. Add token to blacklist
4. Return success message

**Hint:**
```javascript
exports.logout = async (req, res) => {
    try {
        // 1. Get token from header (like in middleware)
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        
        // 2. Decode token to get expiry (don't verify, just decode)
        // Use jwt.decode() not jwt.verify()
        
        // 3. Save to blacklist with expiry time
        // BlacklistedToken.create({ token, expiresAt })
        
        // 4. Return success
        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        // Error handling
    }
}
```

#### Step 3: Update Authentication Middleware

**File:** `middleware/auth.middleware.js`

**What to add:**
- Before verifying the token, check if it's in the blacklist
- If blacklisted, return 401 Unauthorized
- Then proceed with normal verification

**Hint:**
```javascript
module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            return res.status(401).json({ message: "Not authorized" });
        }
        
        const token = authHeader.split(' ')[1];
        
        // NEW: Check if token is blacklisted
        // const isBlacklisted = await BlacklistedToken.findOne({ token });
        // if(isBlacklisted) {
        //     return res.status(401).json({ message: "Token has been invalidated" });
        // }
        
        // Existing verification code...
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // ... rest of middleware
    } catch (err) {
        // Error handling
    }
}
```

#### Step 4: Add Logout Route

**File:** `routes/auth.routes.js`

**Hint:**
```javascript
const {register, login, logout} = require("../controllers/auth.controller");
router.post("/logout", logout);  // Add this line
```

**Note:** Logout route should be **protected** (requires authentication) because you need the token to blacklist it!

**So it should be:**
```javascript
const auth = require('../middleware/auth.middleware');
router.post("/logout", auth, logout);  // Protected route
```

#### Step 5: Clean Up Expired Tokens (Optional but Recommended)

**Problem:** Blacklist will grow over time with expired tokens.

**Solution:** 
- Create a function to delete tokens that have expired
- Run it periodically (cron job) or before checking blacklist

**Hint:**
```javascript
// In blacklist check, also clean up expired tokens
await BlacklistedToken.deleteMany({ expiresAt: { $lt: new Date() } });
```

---

## 📋 Step-by-Step Implementation Guide

### For Database-Based Blacklist:

1. **Create BlacklistedToken Model**
   - File: `models/blacklistedTokens.js`
   - Schema: `{ token: String, expiresAt: Date, createdAt: Date }`
   - Add index on `token` for faster lookups

2. **Create Logout Function in Controller**
   - File: `controllers/auth.controller.js`
   - Export `exports.logout`
   - Extract token from header
   - Decode token to get expiry
   - Save to blacklist

3. **Update Auth Middleware**
   - File: `middleware/auth.middleware.js`
   - Import BlacklistedToken model
   - Check blacklist before verifying token
   - Clean up expired tokens periodically

4. **Add Logout Route**
   - File: `routes/auth.routes.js`
   - Add `router.post("/logout", auth, logout)`
   - Route should be protected (needs auth middleware)

5. **Test**
   - Login to get token
   - Call logout endpoint with token
   - Try to use same token - should fail

---

## 🔑 Key Functions You'll Need

### 1. Decode Token (without verification)
```javascript
const decoded = jwt.decode(token);
// Returns: { id: "...", iat: 1234567890, exp: 1234567890 }
```

### 2. Get Token Expiry
```javascript
const decoded = jwt.decode(token);
const expiresAt = new Date(decoded.exp * 1000);  // Convert Unix timestamp to Date
```

### 3. Check Blacklist
```javascript
const isBlacklisted = await BlacklistedToken.findOne({ token });
if (isBlacklisted) {
    // Token is invalid
}
```

### 4. Add to Blacklist
```javascript
await BlacklistedToken.create({
    token: token,
    expiresAt: expiresAt
});
```

---

## 📝 Example BlacklistedToken Model

**File:** `models/blacklistedTokens.js`

```javascript
const mongoose = require('mongoose');

const BlacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true  // For faster lookups
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }  // Auto-delete expired tokens
    }
}, { timestamps: true });

module.exports = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);
```

**Hint:** The `expireAfterSeconds: 0` creates a TTL (Time To Live) index that automatically deletes expired documents!

---

## 🎯 Implementation Checklist

- [ ] Create BlacklistedToken model
- [ ] Create logout function in auth controller
- [ ] Update auth middleware to check blacklist
- [ ] Add logout route (protected)
- [ ] Test logout functionality
- [ ] Test that blacklisted token is rejected
- [ ] Add cleanup for expired tokens (optional)

---

## 🧪 Testing

### Test 1: Logout
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:4300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | grep -o '"Jwt token" : "[^"]*' | cut -d'"' -f4)

# 2. Logout
curl -X POST http://localhost:4300/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Should return: {"message":"Logged out successfully"}
```

### Test 2: Verify Token is Blacklisted
```bash
# Try to use the same token again
curl -X GET http://localhost:4300/api/notes/getNotes \
  -H "Authorization: Bearer $TOKEN"

# Should return: {"message":"Token has been invalidated"} or 401
```

---

## 💡 Pro Tips

1. **Token Expiry:** Make sure to store the token's expiry time in the blacklist, not just the token. This allows auto-cleanup.

2. **Cleanup Strategy:** 
   - Use MongoDB TTL index (auto-deletes expired)
   - OR clean up before checking blacklist
   - OR run a cron job periodically

3. **Performance:** 
   - Add index on `token` field for fast lookups
   - Consider using Redis instead of MongoDB for better performance (advanced)

4. **Security:** 
   - Even with blacklist, tokens expire after 1 hour anyway
   - For better security, reduce token expiry time (e.g., 15 minutes)
   - Implement refresh tokens (advanced)

---

## 🚀 Quick Start (Simplest Version)

If you want the simplest implementation:

1. **Create logout function** that just returns success
2. **Client deletes token** from storage
3. **Token expires naturally** after 1 hour

This works, but less secure. The blacklist approach is better for production.

---

## 📚 Summary

**Simple Approach:**
- Client-side only
- No backend changes needed
- Less secure

**Secure Approach (Blacklist):**
1. Create BlacklistedToken model
2. Create logout controller function
3. Update auth middleware to check blacklist
4. Add logout route
5. Clean up expired tokens

Choose the approach that fits your security needs!

---

## 🎓 Key Concepts to Remember

- JWT tokens are stateless - server doesn't track them
- Logout with JWT requires blacklisting to invalidate tokens
- Always clean up expired tokens from blacklist
- Blacklist check should happen before token verification
- Logout route should be protected (needs auth middleware)

Good luck implementing logout! 🚀

