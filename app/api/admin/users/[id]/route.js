import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/user";
import { auth } from "@/auth";

export async function PATCH(request, { params }) {
  let connection;
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const { role } = await request.json();

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    connection = await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") {
      await connection.close();
    }
  }
}