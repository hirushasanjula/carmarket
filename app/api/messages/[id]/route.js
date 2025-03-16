import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/message";
import { auth } from "@/auth";

export async function PATCH(request, { params }) {
  let connection;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    connection = await connectToDatabase();

    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    if (message.receiver.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    message.read = true;
    await message.save();

    return NextResponse.json({ success: true, message }, { status: 200 });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return NextResponse.json(
      { error: "Failed to update message", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") {
      await connection.close();
    }
  }
}