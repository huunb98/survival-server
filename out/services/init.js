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
const leaderboardManager_1 = require("../leaderboard/leaderboardManager");
const mailManager_1 = require("../mails/mailManager");
const mongodb_1 = require("./database/mongodb");
module.exports = {
    Init: function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield new mongodb_1.MongoDBDatabase().connectAsync();
            mailManager_1.mailManager.getMailConfig();
            leaderboardManager_1.leaderboardManager.initLeaderboard();
        });
    },
};
//# sourceMappingURL=init.js.map