"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class Utils {
    /**
     * 尝试打开文件
     * @param {string} path 路径
     */
    static async tryOpen(path) {
        const uuid = await this.fspathToUuid(path);
        // 是否配置了快速打开
        this.open(uuid);
        // 聚焦到文件
        this.focusOnFile(uuid);
    }
    /**
     * 打开文件
     * @param {string} uuid Uuid
     */
    static open(uuid) {
        Editor.Message.send('asset-db', 'open-asset', uuid);
    }
    /**
     * 聚焦到文件（在资源管理器中显示并选中文件）
     * @param {string} uuid Uuid
     */
    static focusOnFile(uuid) {
        Editor.Selection.clear('asset');
        Editor.Selection.select('asset', [uuid]);
    }
    /**
     * 通过绝对路径获取 uuid
     * @param {string} path 路径
     * @returns {Promise<string>}
     */
    static fspathToUuid(path) {
        return Editor.Message.request('asset-db', 'query-uuid', path);
    }
    static format(mat, ...param) {
        if (typeof (mat) != "string") {
            mat = String(mat);
        }
        let matchs = mat.match(/%s|%f|%\S?\d?d/g) || [];
        if (matchs.length != param.length) {
            console.warn("format  参数不正确！或暂不支持");
            return mat;
        }
        else {
            for (let i = 0; i < param.length; i++) {
                let match = matchs[i];
                let value = param[i];
                if (match == "%s") {
                    mat = mat.replace(match, value);
                }
                else if (match == "%f") {
                    mat = mat.replace(match, value);
                }
                else if (match.match(/%\S?\d?d/)) {
                    let pv = match.match(/%(\S?)(\d?)d/);
                    if (!pv)
                        return mat;
                    let flag = pv[1];
                    let num = pv[2];
                    let v = String(value);
                    let patch = Number(num) - v.length;
                    if (patch > 0) {
                        while (patch) {
                            v = flag + v;
                            patch--;
                        }
                    }
                    mat = mat.replace(match, v);
                }
            }
            return mat;
        }
    }
    static Obj2String(obj, add = "    ") {
        return JSON.stringify(obj);
    }
    static createFile(path, data = "") {
        return new Promise((resolve, reject) => {
            Editor.Message.request('asset-db', 'create-asset', path, data, false, false).then((res) => {
                if (res) {
                    resolve(res);
                }
                else {
                    reject(`create dir fail: ${path}`);
                }
            });
        });
    }
    static getClsNameElement(item, name) { var _a; return (_a = item.getElementsByClassName(name)) === null || _a === void 0 ? void 0 : _a[0]; }
    static getTagNameElement(item, name) { var _a; return (_a = item.getElementsByTagName(name)) === null || _a === void 0 ? void 0 : _a[0]; }
    static checkModel(name) {
        let len = name.length;
        if (len < 5)
            return false;
        let index = name.lastIndexOf('Model');
        return index >= 0 && index + 5 == len;
    }
    static readFile(path) {
        return new Promise((resolve, reject) => {
            fs_1.default.readFile(path, 'utf-8', (err, res) => {
                if (res) {
                    resolve(res);
                }
                else {
                    console.log('read file err: ', path, err);
                }
            });
        });
    }
    static existsSync(path) {
        return fs_1.default.existsSync(path);
    }
}
exports.default = Utils;
