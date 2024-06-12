import {z} from "zod"



export const MessageSchema=z.object({
 acceptMessage:z
 .string()
 .min(10, "message must be atleast 10 characters")
.max(300, "message cannot be more than 300 characters")
 
  
})