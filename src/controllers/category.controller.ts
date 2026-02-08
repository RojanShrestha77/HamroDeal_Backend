import z, { success } from "zod";
import { Request, Response } from "express";
import { CategoryUserService } from "../services/category.service";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";

const categoryUserService = new CategoryUserService();

export class CategoryUserController {
    async createCategory(req: Request, res: Response) {
        try {
            const parsedData = CreateCategoryDto.safeParse(req.body);
            if(!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            const newCategory = await categoryUserService.createCategory(parsedData.data);
            return res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: newCategory
            });

        }catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success:false,
                message: error.message || "Internal server Error"
            });
        }

    }

    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await categoryUserService.getAllCategories();
            return res.json( {
                success: true,
                message: 'categories fetched successfully',
                count : categories.length,
                data: categories

            });
        }catch (error: Error | any) {
            return res.status (error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async getCategoryById(req: Request, res: Response) {
        try {
const categoryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const category = await categoryUserService.getCategoryById(categoryId);
            return res.json( {
                success: true,
                message: 'Category fetched successfully',
                data: category
            });

        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Internal Server Error'

            });
        }

    }

    async updateCategory(req: Request, res: Response) {
        try {
           const idRaw = req.params.id;
           const id = Array.isArray(idRaw) ? idRaw[0] : idRaw;

            const parsedData = UpdateCategoryDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            const updatedCategory = await categoryUserService.updateCategory(id, parsedData.data);
            return res.json({
                success: true,
                message: "Catgeory updated successfully",
                data: updatedCategory
            });
            
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Internal Server Category'
            });
        }
        
    }

     async deleteCategory(req: Request, res: Response) {
        try {
            const idRaw = req.params.id;
             const id = Array.isArray(idRaw) ? idRaw[0] : idRaw;
            const result = await categoryUserService.deleteCategory(id);
            return res.json({
                success: true,
                message: "Category deleted successfully",
                data: result
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    
}