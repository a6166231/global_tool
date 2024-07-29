"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImgMD5 = void 0;
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const singleton_1 = require("../singleton");
function generateFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto_1.default.createHash('md5');
        const stream = fs_1.default.createReadStream(filePath);
        stream.on('data', (chunk) => {
            hash.update(chunk);
        });
        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
}
class ImgMD5 extends singleton_1.singleton {
    async getHash(filePath) {
        return generateFileHash(filePath);
    }
}
exports.ImgMD5 = ImgMD5;
