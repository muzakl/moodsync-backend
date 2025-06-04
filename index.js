import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { connectToDatabase } from "./services/database.js";
import authRoutes from "./routes/auth.routes.js";


const app = express();
const PORT = process.env.PORT || 5000;

connectToDatabase()
    .then(() => console.log(" Connected to MongoDB"))
    .catch((err) => console.error(" MongoDB connection failed:", err));


app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));


app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
    res.json({ message: "API is running " });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});