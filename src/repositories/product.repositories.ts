import { IProduct, ProductModel } from "../models/product.model";

export interface IProductRepository{
    createProduct(productData: Partial<IProduct>): Promise<IProduct>
    getProductsBySellerId(sellerId: string): Promise<IProduct[]>
    getProductById(productId: string): Promise<IProduct | null>
    updateProduct(productId: string, updateData: Partial<IProduct>): Promise<IProduct|null> 
    deleteProduct(productId: string): Promise<boolean | null>
    getAllProducts(): Promise<IProduct[]>
    getProductsByCategory(categoryId: string): Promise<IProduct[]>
    searchProducts(query: string): Promise<IProduct[]>
    getAllProductsPaginated(page: number, limit: number): Promise<IProduct[]>
}

export class ProductRepository implements IProductRepository {
    async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
        const product = new ProductModel(productData);
        await product.save();
        return product;

    }

   async getProductsBySellerId(sellerId: string): Promise<IProduct[]> {
    const products = await ProductModel.find({ sellerId: sellerId })
        .populate('categoryId', 'name description')
        .populate('sellerId', 'username email');
    return products;
}


    async getProductById(productId: string): Promise<IProduct | null> {
        const product = await ProductModel.findById(productId)
        .populate('categoryId', 'name description')
        .populate('sellerId', 'username  email')
        ;
        return product;
    }

    async updateProduct(productId: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
        const product = await ProductModel.findByIdAndUpdate(productId, updateData, {new: true});
        return product;
    }

    async deleteProduct(productId: string): Promise<boolean | null> {
        const product = await ProductModel.findByIdAndDelete(productId);
        return product? true: false;
    }

    async getAllProducts(): Promise<IProduct[]> {
        const products = await ProductModel.find();
        return products;
    }

    async getProductsByCategory(categoryId: string): Promise<IProduct[]> {
        const products = await ProductModel.find({categoryId})
        .populate('categoryId','name description')
        .populate('sellerId', 'username email')
        return products
    }

    async searchProducts(query: string): Promise<IProduct[]> {
        if(!query?.trim()) return await ProductModel.find();

        const regex = new RegExp(query.trim(), "i");

        return await ProductModel.find({
            $or:[
                {title: regex},
                {description: regex}
            ]

        });        
    }

    async getAllProductsPaginated(page: number, limit: number): Promise<IProduct[]> {
        const skip = (page-1) * limit;

        const products = await ProductModel.find()
        .skip(skip)
        .limit(limit)

        return products;

    }

    async getAllProductsWithFilters(filters: {
        categoryId?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        sort?: string;
    }) : Promise<IProduct[]> {
        const query: any = {};

        // category fiktler
        if(filters.categoryId) {
            query.catgeoryId = filters.categoryId;
        }

        // search filter
        if(filters.search && filters.search.trim()) {
            const regex = new RegExp(filters.search.trim(),"i");
            query.$or = [
                {title: regex},
                {description: regex}
            
            ];
        }

        // price filter
        if(filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            query.price = {};
            if(filters.minPrice !== undefined)query.price.$gte = filters.minPrice;
            if(filters.maxPrice  !== undefined) query.price.$lte = filters.maxPrice;
        }

        // build query
        let productQuery = ProductModel.find(query).populate('categoryId', 'name description').populate('sellerId', 'username email');

        // sort
        if(filters.sort) {
            switch(filters.sort) {
                case 'price_asc':
                    productQuery = productQuery.sort({price: 1});
                    break;
                case 'price_desc':
                    productQuery = productQuery.sort({price: -1});
                    break;
                case 'newest':
                    productQuery = productQuery.sort({createdAt: -1});
                    break;
                default:
                    break;
            }
        }
        return await productQuery;


    }




}