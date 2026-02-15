import { Request, Response } from "express";
import { AdminUserService } from "../../services/admin/user.service";
import { CreateUserDto, UpdateUserDto } from "../../dtos/user.dto";
import z from "zod";

const adminUserService = new AdminUserService();

interface QueryParams {
  page?: string;
  size?: string;
  search?: string;
}

// Converts string | string[] | undefined -> string | undefined
const asString = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export class AdminUserController {
  async createUser(req: Request, res: Response) {
    try {
      const payload = { ...req.body };
      const filename = req.file?.filename;

      if (filename) {
        payload.imageUrl = `/uploads/${filename}`;
      }

      const parsedData = CreateUserDto.safeParse(payload);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const newUser = await adminUserService.createUser(parsedData.data);
      return res.status(200).json({
        success: true,
        message: "Register Successful",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getOneUser(req: Request, res: Response) {
    try {
      const userId = asString(req.params.id);
      if (!userId) {
        return res.status(400).json({ success: false, message: "User id is required" });
      }

      const user = await adminUserService.getOneUser(userId);
      return res.status(200).json({
        success: true,
        message: "User Successfully fetched",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllUser(req: Request, res: Response) {
    try {
      const { page, size, search }: QueryParams = req.query;

      console.log('🔍 CONTROLLER - Received query params:', { page, size, search });

      const { users, pagination } = await adminUserService.getAllUsers(
        { page, size, search }
      );

      console.log('🔍 CONTROLLER - Sending response with pagination:', pagination);

      return res.status(200).json({
        success: true,
        message: "All Users Successfully fetched",
        data: users,
        pagination,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteOneUser(req: Request, res: Response) {
    try {
      const userId = asString(req.params.id);
      if (!userId) {
        return res.status(400).json({ success: false, message: "User id is required" });
      }

      const user = await adminUserService.deleteOneUser(userId);
      return res.status(200).json({
        success: true,
        message: "User has been deleted",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateOneUser(req: Request, res: Response) {
    try {
      const payload = { ...req.body };

      const userId = asString(req.params.id);
      if (!userId) {
        return res.status(400).json({ success: false, message: "User id is required" });
      }

      const filename = req.file?.filename;
      if (filename) {
        payload.imageUrl = `/uploads/${filename}`;
      }

      const parsedData = UpdateUserDto.safeParse(payload);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const updatedUser = await adminUserService.updateOneUser(userId, parsedData.data);
      return res.status(200).json({
        success: true,
        message: "User has been Updated",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async approvedSeller(req: Request, res: Response) {
    try {
      const userId = asString(req.params.id);
      if (!userId) {
        return res.status(400).json({ success: false, message: "User id is required" });
      }

      const updatedSeller = await adminUserService.approvedSeller(userId);
      return res.status(200).json({
        success: true,
        message: "Seller Approved",
        data: updatedSeller,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserDetailPage(req: Request, res: Response) {
    try {
      const userId = asString(req.params.id);
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User id is required"
        });
      }

      const userDetails = await adminUserService.getUserDetailPage(userId);

      return res.status(200).json({
        success: true,
        message: "User details successfully fetched",
        data: userDetails,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

}
