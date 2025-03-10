"use server";

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGO environment variable in .env.local");
}

// Cached connection state
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    // Return cached connection if already established
    if (cached.conn) {
        console.log("Reusing existing MongoDB connection");
        return cached.conn;
    }

    // If no connection promise exists, create one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Your preference
        };

        console.log("Establishing new MongoDB connection");
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
            console.log("MongoDB connected successfully");
            return mongooseInstance;
        }).catch((err) => {
            console.error("MongoDB connection failed:", err);
            cached.promise = null; // Reset on failure to allow retry
            throw err;
        });
    }

    // Await the connection and cache it
    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        throw error; // Propagate error to caller
    }
}

export default connectToDatabase;