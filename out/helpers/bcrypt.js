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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptHelper = void 0;
const bcrypt = require('bcrypt');
class BcryptHelper {
    /**
     * encode password
     * @param text
     */
    encode(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt.genSalt(10);
            const hashedPassword = yield bcrypt.hash(text, salt);
            return hashedPassword;
        });
    }
    compareHash(text, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt.compare(text, hash);
        });
    }
}
exports.BcryptHelper = BcryptHelper;
//# sourceMappingURL=bcrypt.js.map