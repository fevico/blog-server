import express from "express"
import "dotenv/config"
import "@/db/connect"
import cors from "cors"
import blogRouter from "./route/blog"


const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(cors({ origin: [process.env.APP_URL!], credentials: true }));

const allowedOrigins = [
    'https://blog-app-p44d.vercel.app',
    process.env.APP_URL?.replace(/\/$/, ''),
  ].filter(Boolean) as string[];
    
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else { 
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

app.get("/", (req, res) => { 
    res.send("Hello World") 
})

// routes
app.use("/blog", blogRouter)

app.listen(4000, () => {
    console.log("Server is running on port 4000")
})     
    