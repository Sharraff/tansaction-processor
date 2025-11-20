import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./schema/database.ts";
import router from "./routes/index.ts";
import { sessionMiddleware } from "./config/session.ts";
import cookieParser from "cookie-parser";
import cors from "cors";
import incomingTransferRoutes from "./routes/index.ts";


const app = express();
app.use(express.json());

connectDB();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/', router);
app.use("/api", incomingTransferRoutes);
//app.use("/api/auth", index);

// enable session
app.use(sessionMiddleware);

// app.get("/", (req, res) => {
//   res.send("Server running");
// });

app.listen(3000, () => console.log("Server listening on port 3000"));
