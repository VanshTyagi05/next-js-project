import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user;
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated ",
      },
      {
        status: 401,
      }
    );
  }
  const userId = user._id;
  const { acceptMessages } = await request.json();
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "userstatus to accept messages is not updated",
        },
        {
          status: 401,
        }
      );
    } else {
      return Response.json(
        {
          success: true,
          message: "message Acceptance status changed successfully ",
        },
        {
          status: 201,
        }
      );
    }
  } catch (error) {
    console.error("failed to update user status to accept message");
    return Response.json(
      {
        success: false,
        message: "failed to update user status to accept message",
      },
      {
        status: 401,
      }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();
  5;

  const session = await getServerSession(authOptions);
  const user: User = session?.user;
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated ",
      },
      {
        status: 401,
      }
    );
  }
  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User Not Found",
        },
        {
          status: 401,
        }
      );
    }
  
    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessage,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error in getting Message Acceptance Status",error);
    return Response.json(
      {
        success: false,
        message: "Error in getting Message Acceptance Status",
      },
      {
        status: 401,
      }
    );
  }
}
