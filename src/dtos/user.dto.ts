import z from "zod";
import { UserSchema } from "../types/user.types";

export const CreateUserDto = UserSchema.pick({
    firstName: true,// true means include this field
    lastName: true,
    username: true,
    email: true,
    password: true,
    imageUrl: true,


}
).extend(
    {
        confirmPassword: z.string().min(6),
        // imageUrl: false
    }
).refine(
    (data) => data.password == data.confirmPassword,
    {
        message:"Password do not match",
        path: ['confirmPassword']//set the path of the error to "confirmPassword"
    }
)

export type CreateUserDto = z.infer<typeof CreateUserDto>;

// export const UpdatedUserDto = UserSchema.pick(
//     {
//         firstName: true,
//         lastName: true,
//         username: true,
//         email: true,
//     }

// )

// export type UpdatedUserDto = z.infer<typeof UpdatedUserDto>

export const LoginUserDto = z.object({
    email: z.email(),
    password: z.string().min(6)
})

export type LoginUserDto = z.infer<typeof LoginUserDto>;

export const UpdateUserDto = UserSchema.partial();
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;