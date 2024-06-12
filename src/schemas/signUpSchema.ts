import {z} from "zod"

export const usernameValidation=z
.string()
.min(2, "username must be atleast 2 characters")
.max(20, "username cannot be more than 20 characters")
.regex(/^[a-zA-Z0-9_]+$/, "Username cannot have special Characters")

export const signUpSchema= z.object({
  username:usernameValidation,
  email:z.string().email({message:"invalid email address"})
  ,
  password:z.
  string().min(8,{message:"passwrod must be atleast 6 characters"})
  .max(20,{message:"password cannot be more than 20 characters"}),

  
})