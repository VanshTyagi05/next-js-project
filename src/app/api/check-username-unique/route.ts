import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { usernameValidation } from "@/schemas/signUpSchema";
import { log } from "console";

import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  // if (request.method !== 'GET') {
  //   return Response.json({
  //     success: false,
  //     message: "Method not allowed",
  //   });
  // } Now its not neccessary
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    // validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log(result); //Todo remove
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(",")
              : "Invalid Query Parameter",
        },
        {
          status: 400,
        }
      );
    }
    const { username } = result.data;
    const existingUserVerified = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerified) {
      return Response.json({
        success: false,
        message: "Usernamem is already taken",
      },{
        status:405
      });
    }
    return Response.json({
      success: true,
      message: "Usernamem is unique",
    });
  } catch (error) {
    console.error("Error Checking Username", error);
    return Response.json({
      success: false,
      message: "Error Checking Username",
    });
  }
}
