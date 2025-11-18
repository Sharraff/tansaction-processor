import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return; // prevent multiple connections

  try {
    await mongoose.connect("mongodb://localhost:27017/tps");
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error", err);
    process.exit(1);
  }
}

// export async function connectDB() {
//     let isConnected = false;
//   try {
//     await mongoose.connect("mongodb://localhost:27017/tps"); 
//     console.log("MongoDB connected");
//   } catch (err) {
//     console.error("MongoDB connection error", err);
//     process.exit(1);
//   }
// }
// mongodb://localhost:27017/