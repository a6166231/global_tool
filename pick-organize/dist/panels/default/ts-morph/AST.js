"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AST = void 0;
const ts_morph_1 = require("ts-morph");
class AST {
    /** 每次打开公用同一个project 之后再加载sourceFile的时候先get一次看能否从缓存中get到 */
    static get Project() {
        if (!AST._project) {
            AST._project = new ts_morph_1.Project();
        }
        return AST._project;
    }
    static clear() {
        this._project = null;
    }
    static getSourceByPath(path) {
        return AST.Project.getSourceFile(path);
    }
    static getDirByPath(path) {
        return AST.Project.getDirectory(path);
    }
    /** 根据字符串格式化 */
    static formatSourceByStr(path, str) {
        let p = AST.Project;
        return p.createSourceFile(path, str, { overwrite: true });
    }
    /** 根据文件路径加载为source */
    static loadSourceByPath(path) {
        return AST.getSourceByPath(path) || AST.Project.addSourceFileAtPath(path);
    }
    /** 获取路径下的所有的source */
    static async loadDirectoryAtPath(path) {
        path = path.replace(new RegExp('\\\\', 'g'), '/');
        let dir = AST.getDirByPath(path);
        if (dir) {
            return dir.addSourceFilesAtPaths('**/*.ts');
        }
        else {
            return (await AST.Project.addDirectoryAtPath(path, { recursive: true })).addSourceFilesAtPaths('**/*.ts');
        }
    }
}
exports.AST = AST;
