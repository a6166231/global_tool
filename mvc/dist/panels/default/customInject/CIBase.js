"use strict";
/**
 * custom-inject
 * 自定义注入基类
 * 不同的类的注入内容方式不同，需要解析各自的结构后进行分析插入代码
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIBase = void 0;
const path_1 = require("path");
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const AST_1 = require("../ts-morph/AST");
class CIBase {
    static async create(CIItem) {
        let ts = Reflect.construct(CIItem.CIWay, [CIItem]);
        if (CIItem.fpath) {
            await ts.createByPath((0, path_1.join)(Editor.Project.path, CIItem.fpath));
        }
        else if (CIItem.buffer) {
            ts.createByStr(CIItem.buffer, CIItem.opath);
        }
        return ts;
    }
    async createByStr(str, path) {
        this.sourceFile = AST_1.AST.formatSourceByStr(path, str);
        try {
            await this.readyToInject();
        }
        catch (error) {
            console.error('解析失败', error);
        }
    }
    async createByPath(str) {
        this.sourceFile = await AST_1.AST.loadSourceByPath(str);
        try {
            await this.readyToInject();
        }
        catch (error) {
            console.error('解析失败', error);
        }
    }
    /** 不让外部实例化 */
    constructor(CIItem) {
        /** 资源文件 */
        this.sourceFile = null;
        /** 注入数据结构 */
        this._CIItemData = null;
        this._CIItemData = CIItem;
    }
    /** 准备注入信息 */
    readyToInject() { }
    ;
    getFullText() {
        var _a;
        return ((_a = this.sourceFile) === null || _a === void 0 ? void 0 : _a.getFullText()) || "";
    }
    /** import 外部 class */
    async injectImportClass(name, opath) {
        let importFile = await AST_1.AST.loadSourceByPath((0, path_1.join)(Editor.Project.path, opath, name + '.ts'));
        // let project = await AST.loadDirectoryAtPath(join(Editor.Project.path, opath))
        // if (!project) return;
        // let importFile = project.find((v) => { return v.getBaseName() == name + '.ts' })
        if (!importFile)
            return;
        let _class = importFile.getClass(name);
        if (!_class)
            return;
        this.sourceFile.addImportDeclaration({
            moduleSpecifier: this.sourceFile.getRelativePathTo((0, path_1.join)(importFile.getDirectoryPath(), importFile.getBaseNameWithoutExtension())),
            defaultImport: _class.getName()
        });
    }
    async save() {
        try {
            await this.sourceFile.save();
        }
        catch (error) {
            console.log(`保存失败：${this.sourceFile.getFilePath()}. `, error);
        }
    }
}
exports.CIBase = CIBase;
