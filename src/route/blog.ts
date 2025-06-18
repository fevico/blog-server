import { addBlog, getBlogBySlug, getBlogs, updateBlog } from "@/controller/blog";
import { fileParser } from "@/middleware/file";
import { Router } from "express";

const blogRouter = Router()
   
blogRouter.post("/create", fileParser, addBlog)
blogRouter.get("/list", getBlogs) 
blogRouter.get("/:slug", getBlogBySlug)
blogRouter.patch("/:slug", fileParser, updateBlog)
export default blogRouter 