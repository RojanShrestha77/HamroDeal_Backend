import { QueryFilter } from "mongoose";
import { BlogModel, IBlog } from "../models/blog.model";

export interface IBlogRepository {
create(blog: IBlog): Promise<IBlog>;
    findById(id: string): Promise<IBlog | null>;
    findAll({page, size, search} : {page: number, size: number, search?: string}): 
        Promise<{ blogs:IBlog[], total: number }>;
    update(id: string, blog: Partial<IBlog>): Promise<IBlog | null>;
    delete(id: string): Promise<boolean>;

}

export class BlogRepository implements IBlogRepository {
    async create(blog: IBlog): Promise<IBlog> {
        const newBlog = new BlogModel(blog);
        const saved = await newBlog.save();
        return saved;
    }
    async findById(id: string): Promise<IBlog | null> {
        const blog = await BlogModel.findById(id).populate("authorId", "firstName lastName email")
        return blog;
    }
    async findAll({ page, size, search }: { page: number; size: number; search?: string; }): Promise<{ blogs: IBlog[]; total: number; }> {
        let filter: QueryFilter<IBlog> = {};
        if(search) {
            filter = {
                $or: [
                    {title: {$regex: search, $options: 'i'}},
                    {content: {$regex: search, $options: 'i'}},
                ]
            };
        }
        const [blogs, total] = await Promise.all([
                BlogModel.find(filter)
                    .skip((page - 1) * size)
                    .limit(size)
                    .populate("authorId", "firstName lastName email"),
                BlogModel.countDocuments(filter)
            ]);
            return { blogs, total};

        
    }
    async update(id: string, blog: Partial<IBlog>): Promise<IBlog | null> {
        const update = await BlogModel.findByIdAndUpdate(id, blog, {new: true});
        return update
    }
    async delete(id: string): Promise<boolean> {
        const result = await BlogModel.findByIdAndDelete(id).exec();
        return result !== null;
    }

}