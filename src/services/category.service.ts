import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";
import { HttpError } from "../errors/http-error";
import { CategoryRepository } from "../repositories/category.repositories";

const categoryRepository = new CategoryRepository();

export class CategoryUserService{
    async createCategory(categoryData: CreateCategoryDto) {
        const categories = await categoryRepository.getAllCategories();
        const existingCategory = categories.find(
            category => category.name.toLowerCase() === categoryData.name.toLowerCase() 
        );
        
        if(existingCategory){
            throw new HttpError(400, "Category already exists");
        }

        const newcategory = await categoryRepository.createCategory(categoryData);
        return newcategory;

    }

    async getAllCategories() {
        const categories = await categoryRepository.getAllCategories();
        return categories;
    }

    async getCategoryById(categoryId: string) {
        if(!categoryId || categoryId.trim() === "") {
            throw new HttpError(400, "Invalid category Id");
        }

        const category = await categoryRepository.getCategoryById(categoryId);
        if(!category){
            throw new HttpError(404, "Category not found");
        }
        return category;
    }

    async updateCategory(categoryId: string, updateData: UpdateCategoryDto) {
        const category = await categoryRepository.getCategoryById(categoryId);

        if(!category){
            throw new HttpError(404, "category does not exists");
        }

        if(updateData.name && updateData.name !== category.name) {
            const categories = await categoryRepository.getAllCategories();
            const existingCategory = categories.find(
                category => category.name.toLowerCase() === updateData.name!.toLowerCase() && 
                category._id.toString() !== categoryId
            );

            if(existingCategory) {
                throw new HttpError(400, "Category with this name already exists");
            }
        }

        const updatedCategory = await categoryRepository.updateCategory(categoryId, updateData);
        if(!updatedCategory) {
            throw new HttpError(500, "Failed to update the category")
        }
        return updatedCategory
    }

    async deleteCategory(categoryId: string) {
        const category = await categoryRepository.getCategoryById(categoryId);

        if(!category) {
            throw new HttpError(404, "Category does not exist");
        }

        const result = await categoryRepository.deleteCategory(categoryId);
        if(result){
            throw new HttpError(500, "Failed to delete category");
        }
        return { message: 'Category deleted successfully'}
    }
}