const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next)=>{

    try{

        const token = await req.header('Authorization').replace("Bearer ", "");
        const decoded =jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, "tokens.token": token});

        if(!user){
            throw new Error();
        }

        req.user = user;
        req.token = token;
        next();
    }
    catch(e){

        res.status(400).send("Error: Please Authenticate");
    }
}

module.exports = auth;