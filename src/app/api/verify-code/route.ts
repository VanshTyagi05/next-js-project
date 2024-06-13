import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { usernameValidation } from "@/schemas/signUpSchema";

import { z } from "zod";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    const decodedUsername = decodeURIComponent(username);

    const user =await UserModel.findOne({ username: decodedUsername })
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Error veryfying User",
        },
        {
          status: 405,
        }
      )
    }
    
    const isCodevalid=user.verifyCode===code
    const isCodeNotExpired=new Date(user.verifyCodeExpiry)>new Date()

      if(isCodevalid && isCodeNotExpired){
        user.isVerified=true;
        await user.save();
        return Response.json(
          {
            success: true,
            message: "User Verified Successfully",
          },
          {
            status: 201,
          }
        )
      }
      else if(!isCodeNotExpired){

        return Response.json(
        {
          success: false,
          message: "verifyCode Expired please sign-up again to re verify",
        },
        {
          status: 405,
        }
      )
      }else{
        return Response.json(
          {
            success: false,
            message: "Incorrect Verification Code",
          },
          {
            status: 400,
          }
        )
      }

  } catch (error) {
    console.error("Error veryfying User", error);
    return Response.json(
      {
        success: false,
        message: "Error veryfying User",
      },
      {
        status: 405,
      }
    );
  }
}
