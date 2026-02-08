import z from 'zod';

export const CategorySchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    status:z.enum(["active", "inactive"]).default("active"),
    
})

export type CategoryType = z.infer<typeof CategorySchema>