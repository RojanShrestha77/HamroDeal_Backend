import z from "zod";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { ProductUserService } from "../services/product.service";
import { Request, Response } from "express";
import { IUser } from "../models/user.model";

const productUserService = new ProductUserService();
const asString = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export class ProductUserController {
  async createProduct(req: Request, res: Response) {
    try {
      const user = req.user as IUser;

      const payload = { ...req.body };
      const file = req.file as Express.Multer.File;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Product image is required",
        });
      }

      payload.images = `/uploads/${file.filename}`;

      const parsedData = CreateProductDto.safeParse(payload);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const newProduct = await productUserService.createProduct(user, parsedData.data);

      return res.status(200).json({
        success: true,
        message: "Product created successfully",
        data: newProduct,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMyProducts(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      const products = await productUserService.getMyProducts(user._id.toString());

      return res.json({
        success: true,
        message: "Product Successfully fetched",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const categoryId = asString((req.query as any).categoryId);
      const search = asString((req.query as any).q) || asString((req.query as any).search);
      const minPrice = asString((req.query as any).minPrice);
      const maxPrice = asString((req.query as any).maxPrice);
      const sort = asString((req.query as any).sort);
      const products = await productUserService.getAllProductsWithFilters({
        categoryId,
        search,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort,
      });
      return res.json({
        success: true,
        message: "All Products Successfully fetched",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getOneProduct(req: Request, res: Response) {
    try {
      const productId = asString(req.params.id as any);
      if (!productId) {
        return res.status(400).json({ success: false, message: "Product id is required" });
      }

      const product = await productUserService.getOneProduct(productId);
      return res.json({
        success: true,
        message: "Product successfully fetched",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const user = req.user as IUser;

      const id = asString(req.params.id as any);
      if (!id) {
        return res.status(400).json({ success: false, message: "Product id is required" });
      }

      const parsedData = UpdateProductDto.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const updatedProduct = await productUserService.updateProduct(id, parsedData.data, user);

      return res.json({
        success: true,
        message: "Product Updated Successfully",
        data: updatedProduct,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const user = req.user as IUser;

      const id = asString(req.params.id as any);
      if (!id) {
        return res.status(400).json({ success: false, message: "Product id is required" });
      }

      const deletedProduct = await productUserService.deleteProduct(id, user);

      return res.json({
        success: true,
        message: "Product Deleted Successfully",
        data: deletedProduct,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async searchProducts(req: Request, res: Response) {
    try {
      const query = asString((req.query as any).q) || "";
      const products = await productUserService.searchProducts(query);

      return res.json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getProductByCategory(req: Request, res: Response) {
    try {
      const categoryId = asString((req.query as any).categoryId);

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        });
      }

      const products = await productUserService.getProductsByCategory(categoryId);
      return res.json({
        success: true,
        message: "Products fetched successfully",
        count: products.length,
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
