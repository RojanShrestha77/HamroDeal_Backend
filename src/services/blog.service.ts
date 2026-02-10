import { HttpError } from "../errors/http-error";
import { BlogRepository } from "../repositories/blog.repository";

const blogRepo = new BlogRepository();

export class BlogService {
    async createBlog(data: any) {
        const blog = await blogRepo.create(data);
        return blog;

    }

    async getAllBlogs(
        { page, size, search }: { page?: string, size?: string, search?: string }
    ) {
        const currentPage = page ? parseInt(page) : 1;
        const pageSize = size ? parseInt(size) : 10;
        const currentSearch = search || '';
        const { blogs, total } = await blogRepo.findAll(
            { page: currentPage, size: pageSize, search: currentSearch }
        );
        const pagination = {
            page: currentPage,
            size: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
        return { blogs, pagination };
    }

    async getBlogById(id: string) {
        const blog = await blogRepo.findById(id);
        if (!blog) {
            throw new HttpError(404, "Blog not found");
        }
        return blog;
    }

    async updateBlog(id: string, data: any, userId?: string) {
        const blog = await blogRepo.findById(id);
        if (!blog) {
            throw new HttpError(404, "Blog not found");
        }

        // Check if user is the author (optional: add admin check)
        if (userId && blog.authorId.toString() !== userId.toString()) {
            throw new HttpError(403, "You are not authorized to update this blog");
        }

        const updated = await blogRepo.update(id, data);
        return updated;
    }

    async deleteBlog(id: string) {
        const blog = await blogRepo.findById(id);
        if (!blog) {
            throw new HttpError(404, "Blog not found");

        }
        const deleted = await blogRepo.delete(id);
        return deleted;
    }
}