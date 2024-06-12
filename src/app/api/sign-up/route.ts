import { dbConnect } from "@/lib/dbConnect";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import UserModel from "@/models/User.model";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    const exixtingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (exixtingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "username is already taken",
        },
        {
          status: 400,
        }
      );
    }
    const exixtingUserByEmail = await UserModel.findOne({ email });
    //creating a verification code for sign_up process
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (exixtingUserByEmail) {
         if(exixtingUserByEmail.isVerified){
          return Response.json(
            {
              success: false,
              message: "User already exist with the email",
            },
            {
              status: 400,
            }
          );
         }
         else{
          const hashedPassword = await bcrypt.hash(password, 10);
          exixtingUserByEmail.password=hashedPassword;
          exixtingUserByEmail.verifyCode=verifyCode;
          exixtingUserByEmail.verifyCodeExpiry=new Date(Date.now()+3600000)
          await exixtingUserByEmail.save();
         }
 

    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        message: [],
      });
      await newUser.save();
    }

    // send verifiction email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message || "Unable to Send Verification Email",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message:
          "User Registered Successfully & Verification code sent to your email",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error registering the user", error);
    return Response.json(
      {
        success: false,
        message: "error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
