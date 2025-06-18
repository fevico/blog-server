import { model, Schema } from "mongoose";

export interface BlogDocs {
    title: string;
    content: string;
    author: string;
    slug: string;
    image: {url:string, id: string};
}
  
const blogSchema = new Schema<BlogDocs>({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: String},  
    slug: {type: String, required: true},
    image:{
        url: {type: String},
        id: {type: String
}    }
}, {timestamps: true})

const Blog = model("Blog", blogSchema);

export default Blog;