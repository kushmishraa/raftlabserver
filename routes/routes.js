const mongoose =  require('mongoose');
require('../db/conn')
const bcrypt = require('bcrypt');
const multer  = require('multer')
const express = require('express')
const router = express.Router();
const loginValidation = require('../middleware/loginValidation')
const User = require('../model/userSchema');
const jwt = require('jsonwebtoken')

const uploadToCloudinary = require('../middleware/upload');
const user = require('../model/userSchema');

try{
    var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage })

router.post('/register-user' , async (req , res)=>{
    const {fname , lname , email , number , password , username} = req.body
    try{
        const userExists = await User.findOne({email : email});
        const usernameExists = await User.findOne({username : username});
        if(userExists){
            return res.status(403).json({message : "User already Exits"});
        }

        if(usernameExists){
            return res.status(400).json({message : "Username already Exists"})
        }

        else
        {

        const newUser = new User({fname , lname , email , number , password , username});

        //password encryption

        const userRegistered = newUser.save();
        if(userRegistered){
            return res.status(201).json({message : "User registered Successfully"});
        }
        else{
            return res.status(500).json({message : "Unable to add user at this time"});
        }

        }
        
    }
    catch(err){
        console.log(err);
    }
});

router.get("/upload" , loginValidation , (req , res)=>{
    res.send(req.validUser);
})

router.get('/home' , loginValidation , (req,res)=>{
    res.send(req.validUser)
})

router.post('/login-validation' , async (req , res) =>{
    const {email , password} = req.body;
    
    const userExist = await User.findOne({email : email});
   
    if(userExist){
       const validUser= await bcrypt.compare(password , userExist.password);
       if(validUser){
        const token = await userExist.generateAuthToken();
     
        res.cookie('jwtToken' , token , {
            expires : new Date(Date.now() + 2592000000),
            httpOnly : true,
          })
       return res.status(201).json({message : "User verified successfully"});
       }
       else{
     
        return res.status(400).json({message : "Invalid Credential"})
       }
        
    }
    else{
       
        res.status(400).json({message : "Invalid Credentials"});
    }
})

router.post("/upload", upload.single('image') , async (req , res)=>{
    

    const userToken = req.cookies.jwtToken;
    const verifyToken = jwt.verify(userToken , process.env.SECRETKEY);
    const selectedUser = await User.findOne({"authToken" : userToken});

    if(req.file){
        const localFilePath = req.file.path;
        const result = await uploadToCloudinary(localFilePath,req.file);

        if(req.body.isProfilePic == "true"){
            const selectedUser = await User.findOne({email : req.body.email})
            selectedUser.profilePicture = result.url;
            const profilPicChanged = selectedUser.save()
            if(profilPicChanged){
                return res.status(201).json({message : "Profile pic updated"})
            }
            else{
                return res.status(400).json({message : 'Unable to updated profile pic'})
            }
        }
        
        
        if(verifyToken){
           
            if(selectedUser){
                selectedUser.userPost.postContainer.push({
                    image : result.url , 
                    caption : req.body.caption? req.body.caption:"",
                    tagged : req.body.tagged? req.body.tagged:[],
                    comments : req.body.comments ? req.body.comments : [],
                    like : req.body.like ? req.body.like : [],
                    date : req.body.date ? req.body.date : ""
                })
                selectedUser.save();
                res.status(201).json({message : "post created successfull"})
            }
         }

        else{
            return res.status(201).json({message : "unable to authenticate"})
        }

        }

    })
router.get("/findPeople" , async (req , res) =>{
    const allUser = await User.find({});
    res.status(201).json({users : allUser});
 
})
router.post('/followUser' , async (req , res)=>{
    const userName=req.body.username;
    const userExists = await User.findOne({username : userName});
    if(userExists){
        const jwtToken = req.cookies.jwtToken;
        const loggedInUser = await User.findOne({"authToken" : jwtToken});
        const alreadyFollowing = loggedInUser.following?.indexOf(userName)

        if(alreadyFollowing >=0){
            loggedInUser.following.splice(alreadyFollowing , 1);
            loggedInUser.save();
            return res.status(201).json({message : "User unfollowed Sucessfully"})
        }
        loggedInUser.following.push(userName);
        loggedInUser.save()
        return res.status(201).json({message : "followed successfully"});
    }

   return res.status(400).json({message : "Username doesn't found"});
})
router.post('/getFollowerPost', async (req , res)=>{
    const username  = req.body.username;
    
    const availUser = await User.findOne({"username" : username})
    if(availUser){
        return res.status(201).json({post : availUser.userPost.postContainer , profilePicture : availUser.profilePicture , username : availUser.username});
    }
})

router.post('/like',async (req , res)=>{
    const username = req.body.username;
    const likedBy = req.body.likedBy;
    const img = req.body.image;
    const validUser = await User.findOne({"username" : username});
    if(validUser){
      
        validUser.userPost.postContainer.map((posts)=>{
            posts.image == img ? posts.like.findIndex(x=> x.user == likedBy) == -1 ? posts.like.push({user:likedBy}) : posts.like.splice(posts.like.findIndex(x=> x.user == likedBy),1) : null;
          })
          validUser.save();
          return res.status(201).json({message : "Post Liked"})
    
    }
    return res.status(400).json({message : "Request failed"})
})

router.post('/fetch-comments' , async (req ,res)=>{
    const username = req.body.username;
   
    const img = req.body.image;
   
    const validUser = await User.findOne({"username" : username});
    if(validUser){
       
        validUser.userPost.postContainer.map((posts)=>{
            return  posts.image == img ? res.status(201).json({comments : posts.comments}):null
          })
        
    }else{
        return res.status(400).json({message : "User Not Found "})
    }
    
})
router.post('/add-comments', async(req , res)=>{
    const commentedby = req.body.parentUser
    const commentedOn = req.body.childUser
    const img = req.body.image
    const caption = req.body.caption

    if(caption.length == 0){
        return res.status(400).json({message : "Enter any comments"})
    }

    const validUser = await User.findOne({"username" : commentedOn});
    if(validUser){
        validUser.userPost.postContainer.map((posts)=>{
            return  posts.image == img ? posts.comments.push({from : commentedby , comment : caption}) :null
          })
          validUser.save()
         return res.status(201).json({message : "comment added"})
        }

        return res.status(400).json({message : "Unable to post comment"});
})
router.post('/addPost' , async(req , res)=>{
    const {username , bio} = req.body;
    
    const validUser = await User.findOne({"username" : username});
    if(validUser){
        validUser.bio = bio;
        validUser.save();
        return res.status(201).json({message : "bio updated"})
    }

    return res.status(400).json({message : "user not found"})

})
}

    catch(err){
        console.log(err);
    }


module.exports = router;