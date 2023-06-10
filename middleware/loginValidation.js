const jwt = require('jsonwebtoken');
const user = require('../model/userSchema')
const loginValidation = async (req , res , next) =>{
   try{ 
    const token = req.body.jwtToken
    console.log("token => " , token)
   
    const verify = jwt.verify(token , process.env.SECRETKEY);
    console.log("verify=>",verify);
    if(verify){
    const validUser = await user.findOne({"authToken" : token});
    console.log("valid user =>",validUser);
    if(validUser){
    res.status(201);
    req.token = token;
    req.validUser = validUser;
    req.userId = validUser.id
    next();
    }
    else{
        throw new Error("Unauth Access !");
    }
    
    } 
}
catch(err){

    return res.status(400).json({message : "Unauth"})
   
}

}

module.exports = loginValidation;