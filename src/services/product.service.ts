import { ProductRepository } from "../repositories/product.repositories";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { IUser } from "../models/user.model";
import { HttpError } from "../errors/http-error";
import mongoose, { Types } from "mongoose";

const productRepository = new ProductRepository();

const isValidObjectId = (id: string) => Types.ObjectId.isValid(id);

type UpdatePayload = Omit<UpdateProductDto, "categoryId"> & {
  categoryId?: Types.ObjectId;
};

export class ProductUserService {
  async createProduct(user: IUser, productData: CreateProductDto) {
    // Business rules (optional)
    // if (user.role !== "seller") throw new HttpError(403, "Only Sellers can create products");
    // if (!user.isApproved) throw new HttpError(403, "Your seller account is pending approval");

    if (!isValidObjectId(productData.categoryId)) {
      throw new HttpError(400, "Invalid categoryId");
    }

    const newProductData = {
      ...productData,
      sellerId: user._id, // ObjectId
      categoryId: new mongoose.Types.ObjectId(productData.categoryId), // string -> ObjectId
    };

    return await productRepository.createProduct(newProductData);
  }

  async getMyProducts(sellerId: string) {
    if (!sellerId || sellerId.trim() === "" || !isValidObjectId(sellerId)) {
      throw new HttpError(400, "Invalid Seller Id");
    }
    return await productRepository.getProductsBySellerId(sellerId);
  }

  async getAllProducts() {
    return await productRepository.getAllProducts();
  }

  async getAllProductsWithFilters(filters: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string; 
  }) {
    return await productRepository.getAllProductsWithFilters(filters);
  }

  async getOneProduct(productId: string) {
    if (!isValidObjectId(productId)) {
      throw new HttpError(400, "Invalid productId");
    }

    const product = await productRepository.getProductById(productId);
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  }

  async updateProduct(productId: string, updateData: UpdateProductDto, user: IUser) {
    if (!isValidObjectId(productId)) {
      throw new HttpError(400, "Invalid productId");
    }

    const product = await productRepository.getProductById(productId);

    if (!product) {
      throw new HttpError(404, "Product does not exist");
    }

    //  check ownership - handle both populated and non-populated sellerId
    const productSellerId = typeof product.sellerId === 'object' 
      ? product.sellerId._id.toString() 
      : (product.sellerId as any).toString();
    
    if (productSellerId !== user._id.toString()) {
      throw new HttpError(403, "You can only update your own products");
    }

    //  never allow sellerId updates (defense-in-depth)
    const { sellerId, ...safeUpdateData } = updateData as any;

    const updatePayload: UpdatePayload = { ...safeUpdateData };

    if (safeUpdateData.categoryId) {
      if (!isValidObjectId(safeUpdateData.categoryId)) {
        throw new HttpError(400, "Invalid categoryId");
      }
      updatePayload.categoryId = new mongoose.Types.ObjectId(safeUpdateData.categoryId);
    }

    const updatedProduct = await productRepository.updateProduct(productId, updatePayload);
    if (!updatedProduct) throw new HttpError(500, "Failed to update the product");
    return updatedProduct;
  }


  async deleteProduct(productId: string, user: IUser) {
    if (!isValidObjectId(productId)) {
      throw new HttpError(400, "Invalid productId");
    }

    const product = await productRepository.getProductById(productId);

    if (!product) {
      throw new HttpError(404, "Product does not exist");
    }

    const productSellerId = typeof product.sellerId === 'object'
      ? product.sellerId._id.toString()
      : (product.sellerId as any).toString();

    //   check ownership
    if (productSellerId !== user._id.toString()) {
      throw new HttpError(403, "You can only delete your own products");
    }

    const result = await productRepository.deleteProduct(productId);
    if (!result) throw new HttpError(500, "Failed to delete the product");
    return result;
  }

  async searchProducts(query: string) {
    return await productRepository.searchProducts(query);
  }

  async getProductsByCategory(categoryId: string) {
    if (!categoryId || categoryId.trim() === "" || !isValidObjectId(categoryId)) {
      throw new HttpError(400, "Invalid categoryId");
    }
    return await productRepository.getProductsByCategory(categoryId);
  }
}
