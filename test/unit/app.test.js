const dotenv = require("dotenv");
dotenv.config();
const request = require("supertest");
const startApp = require("../../lib/app").default;
const express = require("express");
const { describe } = require("node:test");
const mockDeep = require("jest-mock-extended").mockDeep;
const constants = require("../../lib/constants");
const jwt = require("jsonwebtoken");
const e = require("express");

const { WRONG_PASSWORD, USER_NOT_FOUND, USER_ALREADY_EXISTS, USER_CREATED } =
  constants;

describe("app", () => {
  let dependencies;
  beforeEach(() => {
    dependencies = {
      prisma: mockDeep(),
      expressApp: express(),
    };

    jest.resetModules();
  });

  describe("when calling GET /", () => {
    it("should return hello text", async () => {
      const response = await request(startApp(dependencies)).get("/");
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe("hello");
    });
  });

  describe("when calling POST /login", () => {
    it("should return 409 when user does not exist", async () => {
      const response = await request(startApp(dependencies))
        .post("/login")
        .type("form")
        .send({
          email: "john@DoesNotExist.com",
          password: "password",
        });

      expect(response.statusCode).toBe(409);
      expect(response.text).toBe(USER_NOT_FOUND);
    });

    it("should return 401 if password is incorrect", async () => {
      const user = {
        email: "john@forgotPassword.com",
        password:
          "10678d31be3e2a0497c785d59e99ededd6f2eeb8df3a903910460a4ac7d63417811aa162abcea92ec84a766b2218ff96b72a1bec312b2ced5a269f1429f00ff73e2a5654895e8f6f969b03608717bf1ade63aa395a32f3251cd08e43209276915f536c17",
      };

      dependencies.prisma.user.findUnique.mockResolvedValue(user);

      const response = await request(startApp(dependencies))
        .post("/login")
        .type("form")
        .send({
          ...user,
          password: "noIdea",
        });

      expect(response.statusCode).toBe(401);
      expect(response.text).toBe(WRONG_PASSWORD);
    });

    it("should return 200 and a valid jwt token if user exists", async () => {
      const user = {
        email: "johnatan@oldUser.com",
        password:
          "10678d31be3e2a0497c785d59e99ededd6f2eeb8df3a903910460a4ac7d63417811aa162abcea92ec84a766b2218ff96b72a1bec312b2ced5a269f1429f00ff73e2a5654895e8f6f969b03608717bf1ade63aa395a32f3251cd08e43209276915f536c17",
      };

      dependencies.prisma.user.findUnique.mockResolvedValue(user);

      const response = await request(startApp(dependencies))
        .post("/login")
        .type("form")
        .send({
          ...user,
          password: "1234",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeDefined();

      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.email).toBe(user.email);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();

      // exp should be 24 hour from now
      const now = new Date();
      const exp = new Date(decoded.exp * 1000);
      const diff = exp.getTime() - now.getTime();
      const diffInHours = diff / (1000 * 3600);
      const diffInHoursRounded = Math.round(diffInHours);
      expect(diffInHoursRounded).toBe(24);
    });
  });

  describe("POST /signup", () => {
    it("should return 409 if user already exists", async () => {
      const user = {
        email: "john@imAlreadyHere.com",
        password: "password",
      };

      dependencies.prisma.user.findUnique.mockResolvedValue(user);

      const response = await request(startApp(dependencies))
        .post("/signup")
        .type("form")
        .send(user);

      expect(response.statusCode).toBe(409);
      expect(response.text).toBe(USER_ALREADY_EXISTS);
    });

    it("should return 200 if user was created", async () => {
      const user = {
        email: "john@newUser.com",
        password: "password",
      };

      dependencies.prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(startApp(dependencies))
        .post("/signup")
        .type("form")
        .send(user);

      expect(response.statusCode).toBe(200);
      expect(response.text).toBe(USER_CREATED);
    });
  });
});
