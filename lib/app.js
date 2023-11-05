"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cryptr_1 = __importDefault(require("cryptr"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = __importDefault(require("express"));
const constants_1 = require("./constants");
const app = ({ prisma, expressApp }) => {
    expressApp.use(express_1.default.urlencoded({ extended: true }));
    // respond with "hello world" when a GET request is made to the homepage
    expressApp.get("/", function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return res.send("hello");
        });
    });
    expressApp.post("/signup", function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const user = yield prisma.user.findUnique({ where: { email } });
            if (user) {
                return res.status(409).send(constants_1.USER_ALREADY_EXISTS);
            }
            const cryptr = new cryptr_1.default(process.env.PASSWORD_ENCRYPT_KEY);
            const encryptedString = cryptr.encrypt(password);
            yield prisma.user.create({
                data: {
                    email,
                    password: encryptedString,
                },
            });
            yield prisma.$disconnect();
            res.status(200).send(constants_1.USER_CREATED);
        });
    });
    expressApp.post("/login", function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const user = yield prisma.user.findUnique({ where: { email } });
            if (!user) {
                yield prisma.$disconnect();
                return res.status(409).send(constants_1.USER_NOT_FOUND);
            }
            const cryptr = new cryptr_1.default(process.env.PASSWORD_ENCRYPT_KEY);
            const decryptedString = cryptr.decrypt(user.password);
            if (decryptedString !== password) {
                yield prisma.$disconnect();
                return res.status(401).send(constants_1.WRONG_PASSWORD);
            }
            const token = jsonwebtoken_1.default.sign({ email, userId: user.id }, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });
            yield prisma.$disconnect();
            return res.status(200).send(token);
        });
    });
    return expressApp;
};
exports.default = app;
