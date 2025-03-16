import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/message";
import { auth } from "@/auth";

export async function GET(request) {
    let connection;
    try {
      const session = await auth();
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const { searchParams } = new URL(request.url);
      const vehicleId = searchParams.get("vehicleId");
      const receiverId = searchParams.get("receiverId");
  
      connection = await connectToDatabase();
      const userId = session.user.id;
  
      // Build query
      const query = {
        $or: [{ sender: userId }, { receiver: userId }],
      };
      if (vehicleId) query.vehicle = vehicleId;
      if (receiverId) query.receiver = receiverId;
  
      const messages = await Message.find(query)
        .populate("sender", "name email")
        .populate("receiver", "name email")
        .populate("vehicle", "model year")
        .sort({ createdAt: -1 })
        .lean();
  
      const unreadCount = await Message.countDocuments({
        receiver: userId,
        read: false,
      });
  
      return NextResponse.json({ messages, unreadCount }, { status: 200 });
    } catch (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages", details: error.message },
        { status: 500 }
      );
    } finally {
      if (connection && typeof connection.close === "function") {
        await connection.close();
      }
    }
  }
  
  export async function POST(request) {
    let connection;
    try {
      const session = await auth();
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const { receiverId, content, vehicleId } = await request.json();
      if (!receiverId || !content) {
        return NextResponse.json(
          { error: "Receiver ID and content are required" },
          { status: 400 }
        );
      }
  
      connection = await connectToDatabase();
      const message = new Message({
        sender: session.user.id,
        receiver: receiverId,
        content,
        vehicle: vehicleId || null,
      });
  
      await message.save();
      return NextResponse.json({ success: true, message }, { status: 201 });
    } catch (error) {
      console.error("Error sending message:", error);
      return NextResponse.json(
        { error: "Failed to send message", details: error.message },
        { status: 500 }
      );
    } finally {
      if (connection && typeof connection.close === "function") {
        await connection.close();
      }
    }
  }