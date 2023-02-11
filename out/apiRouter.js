"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwtAuthen_1 = require("./auth/jwt/jwtAuthen");
const Matching_1 = __importDefault(require("./pvp/Matching"));
const mailRouter_1 = __importDefault(require("./routers/mailRouter"));
const pvpRouter_1 = __importDefault(require("./routers/pvpRouter"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
var ApiRouter = (0, express_1.Router)();
ApiRouter.use('/match', Matching_1.default);
ApiRouter.use('/mail', jwtAuthen_1.jwtAuthenticate.authenticateToken, mailRouter_1.default);
ApiRouter.use('/pvp', jwtAuthen_1.jwtAuthenticate.authenticateToken, pvpRouter_1.default);
ApiRouter.use('/user', userRouter_1.default);
exports.default = ApiRouter;
//# sourceMappingURL=apiRouter.js.map