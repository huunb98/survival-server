"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtAuthenticate = void 0;
const jwt = __importStar(require("jsonwebtoken"));
class JwtAuthenticate {
    /**
     * Access Token 1 day
     * @param user
     * @returns
     */
    generateAccessToken(user) {
        return jwt.sign(user, process.env.ServerAccessToken, {
            algorithm: 'HS384',
            expiresIn: '1d',
        });
    }
    generateRefreshToken(user) {
        return jwt.sign(user, process.env.ServerRefreshToken, {
            algorithm: 'HS384',
            expiresIn: '60d',
        });
    }
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token)
            return res.status(401).send({
                code: 0,
                data: null,
                message: 'Token missing',
            });
        jwt.verify(token, process.env.ServerAccessToken, (err, response) => {
            if (err)
                return res.status(403).send({
                    code: 0,
                    data: err,
                    message: 'Forbiden',
                });
            res.locals.user = response.user;
            res.locals.role = response.role;
            next();
        });
    }
}
exports.jwtAuthenticate = new JwtAuthenticate();
//# sourceMappingURL=jwtAuthen.js.map