import z, { boolean } from 'zod';

export const UserSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email(),
    password: z.string().min(6),
    username: z.string().min(3),
    role: z.enum(["user", "admin", "seller"]).default("user"),
    isApproved: z.boolean().default(false),
    imageUrl: z.string().optional()

})

export type UserType = z.infer<typeof UserSchema>;