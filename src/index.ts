import startApp from "./app";
import { PrismaClient } from "@prisma/client";
import express from "express";

const PORT = 3000;

const prisma = new PrismaClient();
const expressApp = express();

const app = startApp({ prisma, expressApp });

app.listen(PORT, () => {
  console.log(`mundo listening on ${PORT}`);
});
