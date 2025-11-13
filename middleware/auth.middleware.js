const jwt = require('jsonwebtoken');
const User = require('../models/users');
module.exports = async (req, res, next)=>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({
                "message":"Not authorized or NOt logged in system till Now"
            })
        }
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token,process.env.JWT_SECRET);
        req.user = await User.findById(payload.id).select('-password');
        if(!req.user){
            return res.status(401).json({
                "message":"Unauthorized access token"
            })
        }
        next();
    }catch(err){
        return res.status(401).json({
            "message":"Unauthorized access token"
        })
    }
}