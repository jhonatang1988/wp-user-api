import { PrismaClient } from "@prisma/client";
import Cryptr from "cryptr";
import jwtWebToken from "jsonwebtoken";
import type { Express } from "express";
import express from "express";
import { error } from "console";
import { USER_ALREADY_EXISTS, USER_CREATED, USER_NOT_FOUND, WRONG_PASSWORD } from "./constants";

const app = ({ prisma, expressApp }: { prisma: PrismaClient, expressApp: Express }) => {
  expressApp.use(express.urlencoded({ extended: true }));

  // respond with "hello world" when a GET request is made to the homepage
  expressApp.get("/", async function (req, res) {
    return res.send("hello");
  });

  expressApp.post("/signup", async function (req, res) {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(409).send(USER_ALREADY_EXISTS);
    }

    const cryptr = new Cryptr(process.env.PASSWORD_ENCRYPT_KEY!);

    const encryptedString = cryptr.encrypt(password);

    await prisma.user.create({
      data: {
        email,
        password: encryptedString,
      },
    });

    await prisma.$disconnect();
    res.status(200).send(USER_CREATED);
  });

  expressApp.post("/login", async function (req, res) {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      await prisma.$disconnect();
      return res.status(409).send(USER_NOT_FOUND);
    }

    const cryptr = new Cryptr(process.env.PASSWORD_ENCRYPT_KEY!);

    const decryptedString = cryptr.decrypt(user.password);

    if (decryptedString !== password) {
      await prisma.$disconnect();
      return res.status(401).send(WRONG_PASSWORD);
    }

    const token = jwtWebToken.sign({ email, userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    await prisma.$disconnect();
    return res.status(200).send(token);
  });

  return expressApp;
};

export default app;