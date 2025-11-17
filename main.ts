import express from "express";
import { connectDB } from "./schema/database";
import router from "./routes/index";
import { sessionMiddleware } from "./config/session";


const app = express();
app.use(express.json());

connectDB();



app.use('/', router);

// enable session
app.use(sessionMiddleware);

// app.get("/", (req, res) => {
//   res.send("Server running");
// });

app.listen(3000, () => console.log("Server listening on port 3000"));
