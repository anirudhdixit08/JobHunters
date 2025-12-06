import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieparser from "cookie-parser";

import DBConnection from "./config/db.js";
import RedisConnection from "./config/redis.js";

import authRouter from "./routes/userRoutes.js";

const app = express();

dotenv.config();

// const corsOptions = {
//     origin: 'http://localhost:5173',
//     credentials : true,
//     optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());

app.use("/user", authRouter);

async function InitializeConnection() {
  console.log("Starting Connection!");

  try {
    // await Promise.all([DBConnection(), RedisConnection(), connectCloudinary()]);
    await Promise.all([DBConnection(), RedisConnection()]);
    // console.log("Connection to Mongo, Cloudinary and Redis Established!");
    console.log("Connection to Mongo and Redis Established!");

    app.listen(process.env.PORT, () => {
      console.log(`Server listening on Port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("CRITICAL: Initialization failed. Server did not start.");
    console.error(error);
    process.exit(1);
  }
}

InitializeConnection();

app.get("/", (req, res) => {
  res.send("Hello from Anirudh");
});

// app.listen(process.env.PORT, () => {
//   console.log(`Server listening on Port ${process.env.PORT}`);
// });
