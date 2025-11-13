const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

exports.register = async (req,res) =>{
    try{
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                "message":"missing required field"
            })
        }
        const exist = await User.findOne({email:email});
        if(exist){
            return res.status(400).json({
                "message":"User already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(req.body.password,12);
        const user = await User.create({
            name : name,
            email:email,
            password:hashedPassword
        })
         return res.status(200).json({
            "message":"User successfully registered"
            ,
            "UserId":user._id
        })
    }catch(err){
        console.error("Register error:", err);
        return res.status(500).json({
            "message" : "Server Error please try again later"
        })
    }
}
exports.login = async (req,res) =>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        if(!email || !password){
            return res.status(400).json({
                "message":"missing required field"
            })
        }
        const user  = await User.findOne({email:email});
        if(!user){
            return res.status(400).json({
                "message" : "Invalid email or password"
            })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                "message" : "Either email or Password wrong"
            })
        }
        // Check if JWT_SECRET exists and is not empty
        const jwtSecret = process.env.JWT_SECRET;
        if(!jwtSecret || (typeof jwtSecret === 'string' && jwtSecret.trim() === '')){
            console.error("JWT_SECRET is missing or empty in .env file");
            return res.status(500).json({
                "Message" : "Server configuration error: JWT_SECRET is missing. Please add JWT_SECRET to your .env file"
            })
        }
        const token = jwt.sign({id:user._id}, jwtSecret, {expiresIn:'1h'});
        return res.status(200).json({
            "message":"User successfully logged in",
            "Jwt token" : token
        })
    }catch(err){
        console.error("Login error:", err);
        return res.status(500).json({
            "message" : "Server Error please try again later"
        })
    }
}
