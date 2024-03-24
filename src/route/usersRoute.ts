import express = require('express')
const userRouter = express.Router()
import { getAllUser, getProfile, } from '../controller/usersController'
import { updateProfile, updateImage, deleteProfile } from '../controller/profileController'
import { uploadProfile } from '../middlewares/fileUpload'

userRouter.get("/getusers", getAllUser)
userRouter.get("/getprofile", getProfile)
userRouter.get("/getusers/:id", getAllUser)
userRouter.post("/updateprofile", updateProfile)
userRouter.post("/updateprofileimage", uploadProfile.single('profileimage'), updateImage)
userRouter.delete("/deleteaccount", deleteProfile)

export default userRouter
