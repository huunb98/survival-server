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
const axios_1 = __importDefault(require("axios"));
class Translate {
    static autoTranslate(inputText, languageOutput) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${languageOutput}&dt=t&q=${escape(inputText)}`;
        const translate = new Promise((resolve, rejects) => {
            axios_1.default
                .get(url)
                .then((data) => __awaiter(this, void 0, void 0, function* () {
                let results = '';
                for (const rs of data.data[0]) {
                    results = results.concat(...rs[0]);
                }
                resolve(results);
            }))
                .catch((err) => {
                rejects(inputText);
                console.log(err);
            });
        });
        return translate;
    }
}
exports.default = Translate;
//# sourceMappingURL=translate.js.map