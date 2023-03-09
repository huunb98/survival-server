"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class String {
    static isNullOrWhiteSpace(value) {
        try {
            if (value === undefined || value === '')
                return false;
            else
                return true;
        }
        catch (e) {
            return false;
        }
    }
    static getYYYYMMDD(date) {
        let mm = date.getMonth() + 1; // getMonth() bắt đầu từ 0
        let dd = date.getDate();
        return Number.parseInt([date.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join(''));
    }
}
exports.default = String;
String.Empty = '';
//# sourceMappingURL=stringFormat.js.map