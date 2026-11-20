
import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import { ConnectDB } from "./utils/helper";
import router from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";

dotenv.config();

const app: Express = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// Existing routes — no change needed
app.use("/api", router);

// Must be registered AFTER the routes so errors come back as JSON
app.use(errorMiddleware);

ConnectDB()
  .then(() => {
    console.log("MongoDB is connected successfully");

    app.listen(process.env.PORT, () => {
      console.log(
        `Server running at http://localhost:${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error", error);
  });

export default app;

// https://github.com/Vaibhav252-web/Ecom_Website.git
