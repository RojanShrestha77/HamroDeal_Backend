import z from "zod";

export const BlogSchema = z.object({
    title: z.string().min(1, "title is required"),
    content: z.string().min(1, "content is required"),
    authorId: z.string(),
});

export type BlogType = z.infer<typeof BlogSchema>;