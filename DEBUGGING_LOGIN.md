# Debugging Login Issues

## Common Reasons Login Fails

### 1. **User Doesn't Exist in Database**
**Symptom:** Returns `"Invalid email or password"`
**Cause:** User hasn't registered yet, or registered with a different email
**Solution:** 
- Register the user first
- Check the email is correct
- Verify the user exists in MongoDB

### 2. **Wrong Password**
**Symptom:** Returns `"Either email or Password wrong"`
**Cause:** Password doesn't match what's stored in database
**Solution:**
- Check if password is correct
- Make sure you're using the same password used during registration

### 3. **JWT_SECRET Missing**
**Symptom:** Returns `"Server configuration error"`
**Cause:** JWT_SECRET is not set in `.env` file
**Solution:**
- Add `JWT_SECRET=your-secret-key-here` to `.env` file
- Restart the server

### 4. **Database Not Connected**
**Symptom:** Returns `"Server Error please try again later"` or connection timeout
**Cause:** MongoDB is not running or connection string is wrong
**Solution:**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- Verify the connection string is correct

### 5. **Missing Environment Variables**
**Symptom:** Server crashes or returns errors
**Cause:** Required environment variables are missing
**Solution:**
- Check `.env` file has:
  - `MONGODB_URI=mongodb://localhost:27017/your-database-name`
  - `JWT_SECRET=your-secret-key-here`
  - `PORT=4300` (optional)

### 6. **Database Connection Timing**
**Symptom:** Requests fail immediately after server starts
**Cause:** Server starts before database is connected
**Solution:** 
- ✅ Fixed: Server now waits for database connection before starting

### 7. **Password Not Hashed Correctly**
**Symptom:** Password comparison always fails
**Cause:** Password wasn't hashed during registration, or hashing method changed
**Solution:**
- Make sure registration uses `bcrypt.hash()`
- Make sure login uses `bcrypt.compare()`
- If users were created before, they might need to re-register

---

## How to Debug

### Step 1: Check Server Logs
Look at the server console for error messages:
```bash
npm start
```

Common errors:
- `Failed to connect to MongoDb` - Database connection issue
- `Login error: ...` - Something failed in login function
- `JWT_SECRET is not defined` - Missing environment variable

### Step 2: Check Database Connection
Verify MongoDB is running and connected:
```bash
# Check if MongoDB is running
mongosh

# Or check in your server logs
# Should see: "Connected to MongoDb"
```

### Step 3: Check Environment Variables
Verify `.env` file exists and has required variables:
```bash
# Check if .env file exists
cat .env

# Should contain:
# MONGODB_URI=mongodb://localhost:27017/your-database-name
# JWT_SECRET=your-secret-key-here
```

### Step 4: Test Registration First
Make sure user exists in database:
```bash
# Register a user first
curl -X POST http://localhost:4300/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Step 5: Test Login
Try logging in with the same credentials:
```bash
curl -X POST http://localhost:4300/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Step 6: Check Database
Verify user exists in MongoDB:
```bash
# Connect to MongoDB
mongosh

# Use your database
use your-database-name

# Check users collection
db.users.find()

# Should show your registered user
```

---

## Common Error Messages

### "Invalid email or password"
- User doesn't exist in database
- Email is incorrect
- **Solution:** Register the user first or check email spelling

### "Either email or Password wrong"
- Password is incorrect
- Password wasn't hashed correctly during registration
- **Solution:** Use the correct password or re-register

### "Server configuration error"
- JWT_SECRET is missing
- **Solution:** Add JWT_SECRET to `.env` file

### "Server Error please try again later"
- Database connection failed
- Database query failed
- Something went wrong in the code
- **Solution:** Check server logs for detailed error message

### "missing required field"
- Email or password is missing in request
- **Solution:** Make sure request body includes both email and password

---

## Testing Checklist

- [ ] MongoDB is running
- [ ] `.env` file exists and has all required variables
- [ ] Server starts without errors
- [ ] Database connection is successful (see "Connected to MongoDb" in logs)
- [ ] User is registered in database
- [ ] Login request includes email and password
- [ ] Email matches the registered user's email
- [ ] Password matches the registered user's password
- [ ] JWT_SECRET is set in `.env` file

---

## Quick Test

1. **Start MongoDB:**
   ```bash
   mongod
   # Or use your MongoDB service
   ```

2. **Check .env file:**
   ```bash
   # Make sure .env has:
   MONGODB_URI=mongodb://localhost:27017/todo-app
   JWT_SECRET=my-secret-key-123
   ```

3. **Start server:**
   ```bash
   npm start
   # Should see: "Connected to MongoDb"
   # Should see: "App is listening on the port 4300"
   ```

4. **Register a user:**
   ```bash
   curl -X POST http://localhost:4300/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
   ```

5. **Login:**
   ```bash
   curl -X POST http://localhost:4300/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

6. **Check response:**
   - Should return: `{"Message":"User successfully logged in","Jwt token":"..."}`
   - If error, check the error message and follow the solutions above

---

## Still Having Issues?

If login is still failing after checking all the above:

1. **Check server console logs** - Look for error messages
2. **Check database** - Verify user exists and password is hashed
3. **Check request** - Make sure you're sending the correct data
4. **Check response** - Look at the error message you're getting
5. **Check code** - Make sure all files are saved correctly

The try-catch block will now log errors to the console, so check the server logs for detailed error messages!

