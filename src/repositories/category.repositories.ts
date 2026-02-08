import { ICategory, CategoryModel } from "../models/category_model"
import { ProductModel } from "../models/product.model"

export interface ICategoryRepository {
    createCategory(data: Partial<ICategory>):Promise<ICategory>
    getAllCategories(): Promise<ICategory[]>
    getCategoryById(categoryId: string): Promise<ICategory | null>
    updateCategory(categoryId: string, updateData: Partial<ICategory>):Promise<ICategory|null>
    deleteCategory(categoryId: string): Promise<boolean | null>

}

export class CategoryRepository implements ICategoryRepository {
    async getCategoryById(categoryId: string): Promise<ICategory | null> {
        const category = await CategoryModel.findById(categoryId);
        return category;
    }
    async createCategory(data: Partial<ICategory>): Promise<ICategory> {
        const category = new CategoryModel(data);
        await category.save();
        return category;
    }
    async getAllCategories(): Promise<ICategory[]> {
        const categorys = await CategoryModel.find();
        return categorys;
    }
    
    async updateCategory(categoryId: string, updateData: Partial<ICategory>): Promise<ICategory | null> {
        const category = await CategoryModel.findByIdAndUpdate(categoryId, updateData, {new : true});
        return category;
    }
    async deleteCategory(categoryId: string): Promise<boolean | null> {
        const category = await CategoryModel.findByIdAndDelete(categoryId);
        return category? true: false;
    }

}