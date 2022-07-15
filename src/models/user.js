const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/tasks');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {

            if (!validator.isEmail(value)) {

                throw new Error("Email is not valid");
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {

                throw new Error("Password must not contain password");
            }
        }
    },
    tokens: [
            {
                token: {
                    type: String,
                    required: true
                }
            }
    ]
    ,
    avatar: {
        type: Buffer
    }
    ,
    age: {
        type: Number,
        default: 18,
        validate(value) {
            if (value < 0) {
                throw new Error("Age must be Positive number")
            }
        }
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks',{
    ref:"Tasks",
    localField: "_id",
    foreignField: "owner"
});

userSchema.methods.toJSON = async function () {  

    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    
    return userObject;
}

//Auth using jwt

userSchema.methods.generateAuthToken = async function () {

    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}


// Fetch Email and Password

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email });

    if (!user) {

        throw new Error("Unable to Login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {

        throw new Error("Unable to Login");
    }
    return user;
}


//Hash the data to save

userSchema.pre('save', async function (next) {

    const user = this;

    if (user.isModified('password')) {

        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

//Delete Tasks when user is deleted

userSchema.pre('remove', async function (next) {  

    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User