const mongoose = require('mongoose');
const connectDb = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true, useUnifiedTopology:true});
        console.log("Connected to MongoDb");
    }catch (err){
        console.log("Failed to connect to MongoDb:", err.message);
        process.exit(1);
    }
}
module.exports = connectDb;