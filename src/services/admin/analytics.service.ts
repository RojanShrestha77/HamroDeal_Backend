import { HttpError } from "../../errors/http-error";
import { OrderModel } from "../../models/order.model";
import { ProductModel } from "../../models/product.model";
import { UserModel } from "../../models/user.model";

export class AdminAnalyticsService {
    async getOverViewStats() {
        const [totalRevenue, orderStats, userStats, productStats] = await Promise.all([
            this.getTotalRevenue(),
            this.getOrderStats(),
            this.getUserStats(),
            this.getProductStats(),
        ]);

        return {
            revenue: totalRevenue,
            orders: orderStats,
            users: userStats,
            products: productStats,
        };
    }

    // get totasl revenue
    private async getTotalRevenue() {
        const result = await OrderModel.aggregate([
            {
                $match: {
                    status: {$in: ['delivered', 'processing', 'shipped']}
                }
            },
            {
                $group: {
                    _id: null,
                    total: {$sum: "$total"},

                },
            }
            
        ]);
        const allTimeRevenue = result[0]?.total || 0;

        // thjios moenth revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthResult = await OrderModel.aggregate([
            {
                $match: {
                    status: {$in:["delivered", "processing", "shipped"]},
                    createdAt: {$gte: startOfMonth},
                }
            },
            {
                $group: {
                    _id: null,
                    total: {$sum: "$total"},
                }
            }
        ]);
        const thisMonthRevenue = monthResult[0]?.total || 0;

        return {
            allTime: allTimeRevenue,
            thisMonth: thisMonthRevenue,
        };

    }

    // get order stats
    private async getOrderStats() {
        const [totalOrders, statusCounts] = await Promise.all([
            OrderModel.countDocuments(),
            OrderModel.aggregate([
                {
                   $group: {
                    _id: "$status",
                    count: {$sum: 1}
                   } 
                }
            ])
        ]);

        const statusMap: Record<string, number> ={};
        statusCounts.forEach((item) => {
            statusMap[item._id] = item.count;
        });

        return {
            total: totalOrders,
            pending: statusMap.pending || 0,
            processing: statusMap.processing || 0,
            shipped: statusMap.procesing || 0,
            delivered: statusMap.delivered || 0,
            cancelled: statusMap.delivered || 0,
        };
    }

    // get user sttats
    private async getUserStats() {
        const [totalUsers, roleCounts] = await Promise.all([
            UserModel.countDocuments(),
            UserModel.aggregate([
                {
                    $group: {
                        _id: "$role",
                        count: {$sum: 1},
                    }
                }
            ])
        ]);

        const roleMap: Record<string, number> = {};
        roleCounts.forEach((item) => {
            roleMap[item._id] = item.count;
        });

        return {
            total: totalUsers,
            buyers: roleMap.user || 0,
            sellers: roleMap.seller || 0,
            admins: roleMap.admin|| 0,
        };
    }

    // get products
    private async getProductStats() {
        const [totalProducts, lowStockCount] = await Promise.all([
            ProductModel.countDocuments(),
            ProductModel.countDocuments({stock: {$lt: 10}}),
            ]);

            return {
                total: totalProducts,
                lowStock:lowStockCount,
            };
            
    }

    // gert revenue stats
    async getRevenueOverTime(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if(isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new HttpError(404, "Invalid date format");
        }

        const result = await OrderModel.aggregate([
            {
                $match: {
                    status: {$in: ["delivered", "processing", "shipped"]},
                    createdAt: {$gte: start, $lte: end},
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt"},
                        month: {$month: "$createdAt"},
                        day: {$dayOfMonth: "$createdAt"},
                    },
                    revenue: {$sum: "$total"},
                    orders: {$sum: 1},
                },
            },
            {
                $sort: {"_id.year": 1, "_id.month": 1, "_id.day": 1},
            },
        ]);

        return result.map((item) => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`,
            revenue: item.revenue,
            orders: item.orders,
        }));
    }

    // gett top selling products
    async getTopProducts(limit: number = 5) {
        const result = await OrderModel.aggregate([
            {$unwind: "$items"},
            {
                $group: {
                    _id: "$item.productId",
                    productName:  {$first: "$items.productName"},
                    productImage: {$first: "$items.productImage"},
                    totalSold: {$sum: "$items.quantity"},
                    totalRevenue: {$sum: { $multiply: ["$items.quantity", "$items.price"]}},
                }
            },
            {$sort: {totalSold: -1}},
            {$limit: limit},
        ]);
        return result;
    }

    // get recent ordefrrs
    async getRecentOrders(limit: number =10) {
        const orders = await OrderModel.find().sort({createdAt:-1}).limit(limit).populate("userId","firstName lastName email").lean();

        return orders;
    }

    // get low stock
    async getLowStockProducts(threshold: number = 10) {
        const products = await ProductModel.find({stock:{ $lt: threshold}})
            .populate("categoryId", "name")
            .populate("sellerId", "firstName lastName email")
            .sort({stock: 1})
            .limit(20)
            .lean();
        
        return products;
    }

    // get top sellers

    async getTopSellers(limit: number =  10){
        const result = await OrderModel.aggregate([
            {$unwind: "$items"},
            {
                $group: {
                    _id: "$items.sellerId",
                    totalRevenue: {$sum: {$multiply: ["$items.quantity", "$items.price"]}},
                    totalOrders: {$sum: 1},
                }
            },
            {$sort: {totalRevenue: -1}},
            {$limit: limit},
            {
                $lookup: {
                    from: "users",
                    localField:"_id",
                    foreignField:"_id",
                    as: "seller",
                }
            },
            {$unwind:"$seller"},
            {
                $project: {
                    sellerId: "$_id",
                    sellerName: {$concat: ["seller.firstName"," ", "$seller.lastName"]},
                    sellerEmail: "$seller.email",
                    totalRevenue: 1,
                    totalOrders: 1,
                }
            }
        ]);
        return result;
    } 
}