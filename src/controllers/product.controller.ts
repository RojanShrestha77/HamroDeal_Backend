import z, { success } from "zod";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { ProductUserService } from "../services/product.service"
import { Request, Response } from "express"
import { IUser } from "../models/user.model";
import { STATUS_CODES } from "node:http";

const productUserService = new ProductUserService();

export class ProductUserController {
    async createProduct(req: Request, res: Response) {
        try {
            const user = req.user as IUser;

            console.log("📥 Request received");
            console.log("📦 req.body:", req.body);
            console.log("📁 req.file:", req.file);
            console.log("📁 req.files:", req.files);

            // ✅ Build payload just like user form
            const payload = { ...req.body };

            // ✅ Get uploaded file (single file, not array)
            const file = req.file as Express.Multer.File;

            if (!file) {
                console.log("❌ No file received");
                return res.status(400).json({
                    success: false,
                    message: "Product image is required"
                });
            }

            console.log("✅ File received:", file.filename);

            // ✅ Create image path
            payload.images = `/uploads/${file.filename}`;

            // ✅ NOW validate with the payload (not req.body directly)
            const parsedData = CreateProductDto.safeParse(payload);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            const newProduct = await productUserService.createProduct(user, parsedData.data);

            return res.status(200).json({
                success: true,
                message: "Product created successfully",
                data: newProduct
            });

        } catch (error: Error | any) {
            console.error("❌ Error in createProduct:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }


    async getMyProducts(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const products = await productUserService.getMyProducts(user._id.toString());

            return res.json({
                success: true, message: "Product Successfully fetched", data: products
            })
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || 'Internal server error'
            })
        }
    }

    //getallproducts = public (for buyers browsing)
    async getAllProducts(req: Request, res: Response) {
        try {
            const products = await productUserService.getAllProducts();
            return res.json({
                success: true, message: 'All Products Succesfully fetched', data: products
            })

        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || 'Internal Server Error'
            })

        }
    }

    async getOneProduct(req: Request, res: Response) {
        try {
            const productId = req.params.id;
            const product = await productUserService.getOneProduct(productId);
            return res.json({
                success: true, message: 'Product successfully fetched', data: product
            })

        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: true, message: error.message || 'Internal Server Error'

            })

        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
             console.log("📦 req.body:", req.body);
             console.log("📁 req.file:", req.file);
             console.log("📁 req.files:", req.files);
             console.log("🔍 All field names:", Object.keys(req.body));
            const user = req.user as IUser;
            const { id } = req.params;
            const parsedData = UpdateProductDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false, message: z.prettifyError(parsedData.error)
                }
                )
            }

            const updatedProduct = await productUserService.updateProduct(id, parsedData.data, user);

            return res.json({
                success: true, message: 'Product Updated Succesfully', data: updatedProduct
            });

        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: true, message: error.message || 'Internal Server Error'

            });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const { id } = req.params;

            const deletedProduct = await productUserService.deleteProduct(id, user);

            return res.json({
                success: true, message: 'Product Updated Deleted', data: deletedProduct
            });




        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || 'Internal Server Error'

            });
        }
    }
    async searchProducts(req: Request, res: Response) {
        try {
            const query = (req.query.q as string) || "";
            const products = await productUserService.searchProducts(query);

            return res.json({
                success: true, data: products
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || 'Internal Server Error'
            })

        }
    }

    async getProductByCategory(req: Request, res: Response) {
        try {
            const categoryId = req.query.categoryId as string;

            if (!categoryId) {
                return res.status(400).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            const products = await productUserService.getProductsByCategory(categoryId);
            return res.json({
                success: true,
                message: 'Products fetched successfullly',
                count: products.length,
                data: products
            });

        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Internal Server Error'
            });
        }
    }





}