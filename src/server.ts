import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import router from "./routers";
dotenv.config();

const app = express();
const port = process.env.PORT || 3300;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/api", router);

app.listen(port, () => {
  return console.log(
    `Express server is listening at http://localhost:${port} 🚀`
  );
});
