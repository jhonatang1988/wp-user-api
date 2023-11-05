"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const PORT = 3000;
const prisma = new client_1.PrismaClient();
const expressApp = (0, express_1.default)();
const app = (0, app_1.default)({ prisma, expressApp });
app.listen(PORT, () => {
    console.log(`mundo listening on ${PORT}`);
});
