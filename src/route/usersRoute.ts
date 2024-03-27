import express = require('express')
const userRouter = express.Router()
import { getAllUser, getProfile, } from '../controller/usersController'
import { updateProfile, deleteProfile } from '../controller/profileController'
import { uploadProfile } from '../middlewares/fileUpload'

userRouter.get("/getusers", getAllUser)
userRouter.get("/getprofile", getProfile)
userRouter.get("/getusers/:id", getAllUser)
userRouter.post("/updateprofile", uploadProfile.single('profileimage'), updateProfile)
userRouter.delete("/deleteaccount", deleteProfile)

export default userRouter
