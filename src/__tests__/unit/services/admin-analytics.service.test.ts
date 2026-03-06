import { AdminAnalyticsService } from '../../../services/admin/analytics.service';
import { OrderModel } from '../../../models/order.model';
import { ProductModel } from '../../../models/product.model';
import { UserModel } from '../../../models/user.model';
import { HttpError } from '../../../errors/http-error';

jest.mock('../../../models/order.model', () => ({
    OrderModel: {
        aggregate: jest.fn(),
        countDocuments: jest.fn(),
        find: jest.fn(),
    }
}));
jest.mock('../../../models/product.model', () => ({
    ProductModel: {
        countDocuments: jest.fn(),
        find: jest.fn(),
    }
}));
jest.mock('../../../models/user.model', () => ({
    UserModel: {
        countDocuments: jest.fn(),
        aggregate: jest.fn(),
    }
}));

describe('AdminAnalyticsService', () => {
    let service: AdminAnalyticsService;
    const mockLean = jest.fn().mockResolvedValue([]);
    const mockLimit = jest.fn().mockReturnValue({ lean: mockLean });
    const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockPopulate2 = jest.fn().mockReturnValue({ sort: mockSort });
    const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AdminAnalyticsService();

        // Default mocks for aggregate / countDocuments / find
        (OrderModel.aggregate as jest.Mock).mockResolvedValue([]);
        (OrderModel.countDocuments as jest.Mock).mockResolvedValue(0);
        (OrderModel.find as jest.Mock).mockReturnValue({ sort: () => ({ limit: () => ({ populate: () => ({ lean: () => Promise.resolve([]) }) }) }) });
        (ProductModel.countDocuments as jest.Mock).mockResolvedValue(0);
        (ProductModel.find as jest.Mock).mockReturnValue({ populate: mockPopulate1 });
        (UserModel.countDocuments as jest.Mock).mockResolvedValue(0);
        (UserModel.aggregate as jest.Mock).mockResolvedValue([]);
    });

    describe('getOverViewStats', () => {
        it('should aggregate revenue, order, user, and product stats', async () => {
            const result = await service.getOverViewStats();
            expect(result).toHaveProperty('revenue');
            expect(result).toHaveProperty('orders');
            expect(result).toHaveProperty('users');
            expect(result).toHaveProperty('products');
        });

        it('should return 0 defaults when there is no data', async () => {
            const result = await service.getOverViewStats();
            expect(result.revenue.allTime).toBe(0);
            expect(result.orders.total).toBe(0);
            expect(result.users.total).toBe(0);
            expect(result.products.total).toBe(0);
        });

        it('should use aggregate result when orders exist', async () => {
            (OrderModel.aggregate as jest.Mock).mockResolvedValue([{ total: 9999 }]);
            const result = await service.getOverViewStats();
            expect(result.revenue.allTime).toBe(9999);
        });
    });

    describe('getRevenueOverTime', () => {
        it('should throw HttpError for invalid start date', async () => {
            await expect(service.getRevenueOverTime('invalid-date', '2025-01-01')).rejects.toThrow(HttpError);
        });

        it('should throw HttpError for invalid end date', async () => {
            await expect(service.getRevenueOverTime('2025-01-01', 'bad')).rejects.toThrow(HttpError);
        });

        it('should return formatted result for valid date range', async () => {
            (OrderModel.aggregate as jest.Mock).mockResolvedValue([
                { _id: { year: 2025, month: 1, day: 5 }, revenue: 500, orders: 3 }
            ]);
            const result = await service.getRevenueOverTime('2025-01-01', '2025-01-31');
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('date', '2025-01-05');
            expect(result[0]).toHaveProperty('revenue', 500);
            expect(result[0]).toHaveProperty('orders', 3);
        });

        it('should return empty array when no orders in date range', async () => {
            (OrderModel.aggregate as jest.Mock).mockResolvedValue([]);
            const result = await service.getRevenueOverTime('2025-01-01', '2025-01-31');
            expect(result).toHaveLength(0);
        });
    });

    describe('getTopProducts', () => {
        it('should return aggregated top products', async () => {
            (OrderModel.aggregate as jest.Mock).mockResolvedValue([{ _id: 'p1', totalSold: 10 }]);
            const result = await service.getTopProducts(5);
            expect(result).toHaveLength(1);
        });

        it('should return empty array if no products', async () => {
            (OrderModel.aggregate as jest.Mock).mockResolvedValue([]);
            expect(await service.getTopProducts()).toHaveLength(0);
        });
    });

    describe('getRecentOrders', () => {
        it('should return recent orders', async () => {
            (OrderModel.find as jest.Mock).mockReturnValue({
                sort: () => ({ limit: () => ({ populate: () => ({ lean: () => Promise.resolve([{ _id: 'o1' }]) }) }) })
            });
            const result = await service.getRecentOrders(5);
            expect(result).toHaveLength(1);
        });
    });

    describe('getLowStockProducts', () => {
        it('should return list of low-stock products', async () => {
            (ProductModel.find as jest.Mock).mockReturnValue({
                populate: () => ({ populate: () => ({ sort: () => ({ limit: () => ({ lean: () => Promise.resolve([{ _id: 'prod1', stock: 2 }]) }) }) }) })
            });
            const result = await service.getLowStockProducts(10);
            expect(result).toHaveLength(1);
        });
    });

    describe('getTopSellers', () => {
        it('should return aggregated top sellers', async () => {
            (OrderModel.aggregate as jest.Mock).mockResolvedValue([{ sellerId: 's1', totalRevenue: 500 }]);
            const result = await service.getTopSellers(5);
            expect(result).toHaveLength(1);
        });
    });
});
