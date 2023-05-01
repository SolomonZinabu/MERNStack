const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bycrypt = require('bcrypt');

// @desk Get all users
// @route Get /users
// @access Private

const getAllUsers = asyncHandler (async (req, res) => {
    const users = await User.findOne().select('-password').lean();
    if (!users) {
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
});

// @desk update a users
// @route patch /users
// @access Private

const updateUser = asyncHandler (async (req, res) => {
    
});


// @desk delete a users
// @route delete /users
// @access Private

const deleteUser = asyncHandler (async (req, res) => {
    
});

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}