import { Router } from 'express'
const todoRout = Router()
import { uploadTodo } from '../middlewares/fileUpload'
import { createTdo, updateTodo, getUserTodo } from '../controller/todoController'

todoRout.post("/addtodo", uploadTodo.single('todoimage'), createTdo)
todoRout.post("/updatetodo", uploadTodo.single('todoimage'), updateTodo)
todoRout.get("/gettodo", getUserTodo)

export default todoRout
