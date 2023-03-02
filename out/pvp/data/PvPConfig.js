"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinType = exports.PVP_MatchMarker = exports.PVPTimerConfig = exports.PVPGameState = void 0;
var PVPGameState;
(function (PVPGameState) {
    PVPGameState[PVPGameState["Waiting"] = 0] = "Waiting";
    PVPGameState[PVPGameState["Preparing"] = 1] = "Preparing";
    PVPGameState[PVPGameState["Playing"] = 2] = "Playing";
    PVPGameState[PVPGameState["Finish"] = 3] = "Finish";
})(PVPGameState = exports.PVPGameState || (exports.PVPGameState = {}));
exports.PVPTimerConfig = {
    MaxPlayerIngame: 2,
    TimePlay: 180,
    PrepareTime: 30,
};
exports.PVP_MatchMarker = {
    ReloadMakingTime: 5,
    MMAtackRange: 200,
    AtkRange: 0.5,
};
var WinType;
(function (WinType) {
    WinType[WinType["DIE"] = 0] = "DIE";
    WinType[WinType["SCORE"] = 1] = "SCORE";
    WinType[WinType["DISCONNECT"] = 2] = "DISCONNECT";
})(WinType = exports.WinType || (exports.WinType = {}));
//# sourceMappingURL=PvPConfig.js.map