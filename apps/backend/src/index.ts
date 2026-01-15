import dotenv from "dotenv";

dotenv.config(); 

console.log("db", process.env.DATABASE_URL! )

import express from "express";
import type { Express } from "express";
import bodyParser from "body-parser";
import router from "./routes";

export const app: Express = express();

app.use(express.json());
app.use(bodyParser.json());

app.use("/api", router)
app.get("/", (req, res) => {
  res.send("Hello Contest");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
