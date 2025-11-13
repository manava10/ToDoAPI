require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const app = express();
app.use(cors());
app.use(express.json());
console.log("Mongo URI:", process.env.MONGODB_URI);

// Connect to database first, then start server
const startServer = async () => {
    try {
        await connectDB();
        app.use('/api/auth', authRoutes);
        const port = process.env.PORT || 4300;
        app.listen(port,()=>{
            console.log(`App is listening on the port ${port}`);
        })
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();