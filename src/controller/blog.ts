 import cloudinary from '@/cloud';
import Blog, { BlogDocs } from '@/model/blog';
import {NextFunction, Request, RequestHandler, Response} from 'express';
import slugify from 'slugify';


interface UpdateBlogBody {
    title?: string;
    content?: string;
    author?: string;
  }

 export const addBlog = async (req: Request, res: Response) => {
    try {
        const {image} = req.files;
        const { title, content, author } = req.body;
        // const blog = await Blog.create({ title, content, author });
        const slug = slugify(title, { lower: true, strict: true });
        const blog = new Blog({ title, content, author, slug });
        if(image && !Array.isArray(image) && image.mimetype?.startsWith("image")){
            // if you are using cloudinary 
            const result = await cloudinary.uploader.upload(image.filepath, {
                folder: 'blogs',
                crop: 'scale'
            });
            blog.image = {
                url: result.secure_url,
                id: result.public_id
            };

        }
        await blog.save();
  
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Error adding blog' });
    }
 }

 export const getBlogs = async (req: Request, res: Response) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: 'Error getting blogs' });
    }
 }

 export const getBlogBySlug = async (req: Request<{ slug: string }>, res: Response, next: NextFunction): Promise<void> => {    try {
        const {slug} = req.params
        const blog = await Blog.findOne({slug});
        if (!blog) {
            res.status(404).json({ error: 'Blog not found' });
        }
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Error getting blog' });
        next(error)
    }
 }

//  export const updateBlog: RequestHandler = async (req, res) => {
//     try {
//         const {slug} = req.params;
//         const {image} = req.files;
//         const {title, content, author } = req.body;
//         const blog = await Blog.findOne({slug});
//         if(!blog) return res.status(404).json({ error: 'Blog not found' });

//         if(image && !Array.isArray(image) && image.mimetype?.startsWith("image")){
//             await cloudinary.uploader.destroy(blog.image.id);
//             // if you are using cloudinary 
//             const result = await cloudinary.uploader.upload(image.filepath, {
//                 folder: 'blogs',
//                 crop: 'scale'
//             });
//             console.log(result)
//             blog.image = {
//                 url: result.secure_url,
//                 id: result.public_id
//             };
//             await blog.save();
//         }
//         const slugData = slugify(title, { lower: true, strict: true });
//         const updateBlogDetail = await Blog.findOneAndUpdate({slug}, {title, content, author, slug: slugData}, {new: true});
//         res.status(200).json(updateBlogDetail);
//     } catch (error: any) {
//         console.log(error)
//         res.status(500).json({ error: 'Error updating blog' });
//     }
//  }

 export const updateBlog: RequestHandler<{ slug: string }, any, UpdateBlogBody> = async (req, res, next) => {
    try {
      const { slug } = req.params;
      const { title, content, author } = req.body;
      const {image} = req.files; // Single file from multer
  
      const blog = await Blog.findOne({ slug });
      if (!blog) {
        res.status(404).json({ success: false, error: 'Blog not found' });
        return;
      }
  
      // Prepare update data
      const updateData: Partial<BlogDocs> = {};
      if (title) {
        updateData.title = title;
        updateData.slug = slugify(title, { lower: true, strict: true });
      }
      if (content) updateData.content = content;
      if (author) updateData.author = author;
  
      // Handle image upload
      if(image && !Array.isArray(image) && image.mimetype?.startsWith("image")){
        // Delete old image if exists
        if (blog.image?.id) {
          await cloudinary.uploader.destroy(blog.image.id);
        }
        // Upload new image
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'blogs', crop: 'scale' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
        });
        updateData.image = {
          id: (result as any).public_id,
          url: (result as any).secure_url,
        };
      }
  
      // Update blog in one operation
      const updatedBlog = await Blog.findOneAndUpdate(
        { _id: blog._id }, // Use _id to avoid slug conflict
        { $set: updateData },
        { new: true }
      );
      if (!updatedBlog) {
        res.status(404).json({ success: false, error: 'Blog not found' });
        return;
      }
  
      res.status(200).json({ success: true, data: updatedBlog });
    } catch (error) {
      next(error);
    }
  };
  