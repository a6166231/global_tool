"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.www = void 0;
const ImgDiff_1 = require("./img/ImgDiff");
const ImgMd5_1 = require("./img/ImgMd5");
const ImgArrange_1 = require("./img/ImgArrange");
class www {
    static ImgDiff() {
        return ImgDiff_1.ImgDiff.getInstance(ImgDiff_1.ImgDiff);
    }
    static ImgMD5() {
        return ImgMd5_1.ImgMD5.getInstance(ImgMd5_1.ImgMD5);
    }
    static ImgArrange() {
        return ImgArrange_1.ImgArrange.getInstance(ImgArrange_1.ImgArrange);
    }
}
exports.www = www;
