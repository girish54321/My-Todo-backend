import express = require('express')
const userRouter = express.Router()
import { getAllUser, getProfile } from '../controller/usersController'
import { updateProfile, updateImage } from '../controller/profileController'
import { uploadProfile } from '../middlewares/fileUpload'

userRouter.get("/getusers", getAllUser)
userRouter.get("/getprofile", getProfile)
userRouter.get("/getusers/:id", getAllUser)
userRouter.post("/updateprofile", updateProfile)
userRouter.post("/updateprofileimage", uploadProfile.single('profileimage'), updateImage)

export default userRouter
