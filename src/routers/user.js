const express = require('express');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const { sendWelcomeMail, sendCancellationMail } = require('../emails/account');

const router = new express.Router();


//Create User

router.post("/users", async (req, res) => {

    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeMail(user.email, user.name)
        const token = await user.generateAuthToken();
        res.status(201).send({user, token})
    }
    catch (e) {
        res.status(400).send(e)
    }
});

//Login User 

router.post('/users/login', async (req, res)=> {

    try{

        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    }
    catch(e){

        res.status(400).send(e);
    }
});

//Logout User

router.post('/users/logout',auth , async (req, res)=> {

    try{

        req.user.tokens = req.user.tokens.filter(token => {

            return token.token !== req.token;
        });
        await req.user.save();
        res.send('Logout Successfully!!')
;    }
    catch(e){

        res.status(500).send(e);
    }
});


//Logout All Devices

router.post('/users/logoutAll',auth , async (req, res)=> {

    try{

        req.user.tokens = [];
        await req.user.save();
        res.send('Logout from All Devices Successfully!!');
;    }
    catch(e){

        res.status(500).send(e);
    }
})

//Fetch the Profile Info

router.get('/users/me', auth, async (req, res) => {

    res.send(req.user);
});


//Upload Avatar image 

const upload= multer({
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb){

        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){

            return cb(new Error('Please upload an Image'));
        }
        cb(undefined, true);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=> {

    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer; 
    await req.user.save();   
    res.status(201).send('File upload succesfully!!');
},(error, req, res, next)=> {

    res.status(400).send({Error: error.message});
    next();
});


//Delete the Avatar Image

router.delete('/users/me/avatar', auth, async (req,res)=> {

    req.user.avatar = null;
    await req.user.save();
    res.send('File Removed Successfully!!')
});


///Get Avatar image

router.get('/users/:id/avatar', async (req, res)=> {

    try{

        const user = await User.findById(req.params.id);
        if(!user.avatar || !user){

            throw new Error('No User profile found!!');
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    }
    catch(e){

        res.status(404).send();
    }
});


//Update the User details

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdate = ['name', "email", 'password', 'age'];

    const isValidOperation = updates.every((update) => allowedUpdate.includes(update));

    if (!isValidOperation) {

        return res.status(400).send({ "Error ": "Invalid Operation" });
    }

    try {

        updates.forEach(update => {
            
            req.user[update]= req.body[update];
        });
        await req.user.save();

        res.send(req.user);
    }
    catch (e) {

        return res.status(400).send(e);
    }
})


//Delete the User details

router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove();
        sendCancellationMail(req.user.email, req.user.name);
        res.send(req.user);
    }
    catch (e) {
        res.status(500).send(e);
    }
})


module.exports = router;