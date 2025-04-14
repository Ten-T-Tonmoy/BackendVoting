import express from "express";
import dotenv from "dotenv";
import { Request, Response, Express } from "express";
//used concurrently and rimraf on script

const app: Express = express();
dotenv.config();

const PORT: number = parseInt(process.env.PORT || "3000");
app.get("/test", (req: Request, res: Response) => {
  res.send("Aur Bantai kya bolti tum ");
});

app.listen(PORT, () => {
  console.log(`Connected to port ${PORT}`);
});
