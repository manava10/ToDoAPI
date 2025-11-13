require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.route')

const app = express();
app.use(cors());
app.use(express.json());
console.log("Mongo URI:", process.env.MONGODB_URI);

// Validate required environment variables before starting
if(!process.env.JWT_SECRET || (typeof process.env.JWT_SECRET === 'string' && process.env.JWT_SECRET.trim() === '')){
    console.error('ERROR: JWT_SECRET is missing or empty in .env file');
    console.error('Please add JWT_SECRET=your-secret-key to your .env file');
    process.exit(1);
}

// Connect to database first, then start server
const startServer = async () => {
    try {
        await connectDB();
        app.use('/api/auth', authRoutes);
        app.use('/api/notes',notesRoutes);
        const port = process.env.PORT || 4300;
        app.listen(port,()=>{
            console.log(`App is listening on the port ${port}`);
            console.log(`JWT_SECRET is configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
        })
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();