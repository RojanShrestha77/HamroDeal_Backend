import express, {Application, Request, Response} from 'express'
import { connectDB } from './database/mongodb';
import { PORT } from './configs';
import dotenv from 'dotenv';
import bodyParser from 'body-parser'
import authRoutes from './routes/auth.routes';
import categoryRoutes from "./routes/category.routes";
import adminUserRoutes from './routes/admin/user.route'
import productRoutes from './routes/product.routes';
import sellerRoutes from './routes/seller/seller.route';
import cartRoutes from './routes/cart/cart.routes';
import cors from 'cors';
import path from 'path';
import { HttpError } from './errors/http-error';
import wishlistRoutes from './routes/wishlist.routes';
import adminBlogRoutes from './routes/admin/blog.route';
import blogRoutes from './routes/blog.route'

dotenv.config();

console.log(process.env.PORT);

const app = express ();

// connectin the frontend  to the backend
// decide the list of the accepted domain
// domain of the frontend
let corsOptions  = {
    origin: ["http://localhost:3000", "http://localhost:3003"]
    // list of accepted domain

}

app.use('/uploads', express.static(path.join(__dirname,'../uploads')));
// origin: '*', //accept all
app.use(cors(corsOptions))
app.use(bodyParser.json())


app.get("/", (req: Request, res: Response) => {
    res.send("Server is ready");
})

app.use('/api/auth', authRoutes);

app.use('/api/admin/blogs', adminBlogRoutes)

app.use('/api/blogs/', blogRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use('/api/cart', cartRoutes);

app.use('/api/categories', categoryRoutes); 

app.use('/api/products', productRoutes);
// app.use('/api/products', publicProductRoutes);  //public product 


app.use('/api/admin/users', adminUserRoutes);
app.use('/api/seller', sellerRoutes);

// for consistent error handler and routes

app.use((req: Request, res: Response) => {
    return res.status(404).json({success: false, message: "Route not Found"});

});
app.use((err: Error, req: Request, res: Response, next: Function) => {
    if(err instanceof HttpError){
        return res.status(err.statusCode).json({success: false, message: err.message});
    }
    return res.status(500).json({success: false, message: err.message || "Internal Server Error"});
});

export default app;