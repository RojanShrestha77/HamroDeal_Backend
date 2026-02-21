import { Request, Response } from "express";
import { AdminAnalyticsService } from "../../services/admin/analytics.service";

const adminAnalyticsService = new AdminAnalyticsService();

export class AdminAnalyticsController {
  async getOverview(req: Request, res: Response) {
    try {
      const stats = await adminAnalyticsService.getOverViewStats();
      return res.status(200).json({
        success: true,
        message: "Overview stats fetched successfully",
        data: stats,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getRevenue(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required",
        });
      }

      const data = await adminAnalyticsService.getRevenueOverTime(
        startDate as string,
        endDate as string
      );

      return res.status(200).json({
        success: true,
        message: "Revenue data fetched successfully",
        data,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getTopProducts(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      const data = await adminAnalyticsService.getTopProducts(limit);

      return res.status(200).json({
        success: true,
        message: "Top products fetched successfully",
        data,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getRecentOrders(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const data = await adminAnalyticsService.getRecentOrders(limit);

      return res.status(200).json({
        success: true,
        message: "Recent orders fetched successfully",
        data,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getLowStock(req: Request, res: Response) {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;

      const data = await adminAnalyticsService.getLowStockProducts(threshold);

      return res.status(200).json({
        success: true,
        message: "Low stock products fetched successfully",
        data,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getTopSellers(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      const data = await adminAnalyticsService.getTopSellers(limit);

      return res.status(200).json({
        success: true,
        message: "Top sellers fetched successfully",
        data,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
