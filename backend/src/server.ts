import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import feedbackRoutes from "./routes/feedbackRoutes";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/feedback", feedbackRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});