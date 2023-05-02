const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bycrypt = require('bcrypt');

// @desk Get all users
// @route Get /users
// @access Private

const getAllUsers = asyncHandler (async (req, res) => {
    const users = await User.findOne().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({message: "No users found"});
    }
    res.json(users)
});


// @desk create a users
// @route post /users
// @access Private

const createNewUser = asyncHandler (async (req, res) => {
    const {username, password, roles} = req.body;
    
    //confirm data
    if(!username || !password || Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: 'All fields are required'})
    }

    //check for duplicate

    const duplicate = await User.findOne({ username }).lean().exec();

    if(duplicate) {
        return res.status(409).json({message: 'Duplicate username'})
    }

    //Hash the password
    const hashedPwd = await bycrypt.hash(password, 10); //salt rounds

    const userObject = {username, "password": hashedPwd, roles};

    // Create and store new user

    const user = await User.create(userObject);

    if(user) { // created sucessfully
        res.status(201).json({message: `New user ${username} created `});
    } else {
        res.status(400).json({message: "Invalid user data recieved"})
    }
});

// @desk update a users
// @route patch /users
// @access Private

const updateUser = asyncHandler (async (req, res) => {
    const {id, username, roles, active, password } = req.body;

    //confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active != 'boolean') {
       return res.status(400).json({message: "All fields are required"});
    }
    const user = await User.findById(id).exec();

    if(!user) {
        return res.status(400).json({message: "User not found"});
    }

    // Check for duplicate

    const duplicate = await User.findOne({username}).lean().exec();

    //Allow updated to the original user
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({message: "Duplicate username"});
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if(password) {
        //Hash pwd
        user.password = await bycrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.json({message: `${updatedUser.username} updated`})
});


// @desk delete a users
// @route delete /users
// @access Private

const deleteUser = asyncHandler (async (req, res) => {
    const { id } = req.body;

    if(!id) {
        return res.status(400).json({message: "User ID Required"});
    }
    const note = await Note.findOne({user: id}).lean().exec();
    if(!note) {
        return res.status(400).json({message: "User has assigned notes"});
    }
    const user = await User.findById(id).exec();
    
    if(!user) {
        return res.status(400).json({message: "User not found"});
    }

    const result = await user.deleteOne();
    const reply = `Username ${result.username} with ID ${result._id} deleted`;
    res.json(reply);
});

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}