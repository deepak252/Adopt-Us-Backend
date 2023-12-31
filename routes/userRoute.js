// Get, Update, Delete User

const express = require("express");
const { getAddressById } = require("../controllers/addressController");
const route = express.Router();
const userController = require("../controllers/userController");
const { auth } = require("../middlewares/auth");
//get information of  a partcular user
route.get('/user/getProfile', auth, userController.getUser);
//update user profile
route.post('/user/updateProfile', auth,userController.updateUser);

//delete profile
route.delete('/user/deleteUser',auth,userController.deleteUserById);

//get Address
route.get('/getAddress/:addressId', auth, getAddressById);
module.exports = route;