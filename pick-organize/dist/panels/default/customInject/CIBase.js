"use strict";
/**
 * custom-inject
 * 自定义注入基类
 * 不同的类的注入内容方式不同，需要解析各自的结构后进行分析插入代码
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIBase = void 0;
const path_1 = __importStar(require("path"));
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const ts_morph_1 = require("ts-morph");
const AST_1 = require("../ts-morph/AST");
const util_1 = __importDefault(require("../util"));
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
    async injectImportClass(name, opath, bUserIndex) {
        let importFile = await AST_1.AST.loadSourceByPath((0, path_1.join)(Editor.Project.path, opath, name + '.ts'));
        // let project = await AST.loadDirectoryAtPath(join(Editor.Project.path, opath))
        // if (!project) return;
        // let importFile = project.find((v) => { return v.getBaseName() == name + '.ts' })
        if (!importFile)
            return;
        let _class = importFile.getClass(name);
        if (!_class)
            return;
        let list = await this.sourceFile.getChildSyntaxList();
        if (bUserIndex && list) {
            let index = await CIBase.getCustomUserInjectIndex(list, { last: ts_morph_1.SyntaxKind.ImportDeclaration });
            this.sourceFile.insertImportDeclaration(index, {
                moduleSpecifier: this.sourceFile.getRelativePathTo((0, path_1.join)(importFile.getDirectoryPath(), importFile.getBaseNameWithoutExtension())),
                defaultImport: _class.getName()
            });
        }
        else {
            this.sourceFile.addImportDeclaration({
                moduleSpecifier: this.sourceFile.getRelativePathTo((0, path_1.join)(importFile.getDirectoryPath(), importFile.getBaseNameWithoutExtension())),
                defaultImport: _class.getName()
            });
        }
    }
    async save() {
        try {
            await this.sourceFile.save();
        }
        catch (error) {
            console.log(`保存失败：${this.sourceFile.getFilePath()}. `, error);
        }
    }
    /** import列表注入 */
    static async injectImport(vResponseImport, sourceFile, injectFile) {
        if (!vResponseImport.length)
            return;
        let project = await AST_1.AST.loadDirectoryAtPath(path_1.default.dirname(sourceFile.getFilePath()));
        if (!project)
            return;
        vResponseImport = Array.from(new Set(vResponseImport));
        for (let _import of vResponseImport) {
            if (!_import || _import.length == 0)
                continue;
            let importFile = project.find((v) => { return v.getBaseName() == _import + '.ts'; });
            if (!importFile)
                continue;
            //直接查找导出的interface 或者 class
            let _export = importFile.getInterface(_import) || importFile.getClass(_import);
            if (!_export)
                continue;
            injectFile.addImportDeclaration({
                moduleSpecifier: injectFile.getRelativePathTo((0, path_1.join)(importFile.getDirectoryPath(), importFile.getBaseNameWithoutExtension())),
                defaultImport: _export.getName()
            });
        }
    }
    static async getCustomUserInjectString() {
        let userInfo = await util_1.default.getUserInfo();
        let name = (userInfo === null || userInfo === void 0 ? void 0 : userInfo.nickname) || (userInfo === null || userInfo === void 0 ? void 0 : userInfo.email) || 'User';
        return `// ^ -----------  【${name}】  ----------- ^`;
    }
    static async getCustomUserInjectIndex(list, or) {
        var _a, _b;
        let userInject = await this.getCustomUserInjectString();
        let item = list.getChildrenOfKind(ts_morph_1.SyntaxKind.SingleLineCommentTrivia).find(v => { return v.getText() == userInject; });
        let index;
        if (item) {
            index = item.getChildIndex();
        }
        else {
            if (or) {
                if (or.first) {
                    index = (_a = list.getLastChildByKind(or.first)) === null || _a === void 0 ? void 0 : _a.getChildIndex();
                }
                else if (or.last) {
                    index = (_b = list.getLastChildByKind(or.last)) === null || _b === void 0 ? void 0 : _b.getChildIndex();
                    if (index) {
                        index++;
                    }
                }
                else if (or.bEnd) {
                    index = list.getChildCount();
                }
                else if (or.bStart) {
                    index = 0;
                }
            }
            if (!index && index != 0) {
                index = list.getChildCount();
                list.addChildText(userInject);
            }
            else {
                list.insertChildText(index, userInject);
            }
        }
        return index;
    }
    static async getCustomUserInjectIndexByObject(obj, or) {
        let userInject = await this.getCustomUserInjectString();
        let list = obj.getPropertiesWithComments();
        let itemIdx = list.findIndex(v => { return v.getText() == userInject; });
        let item = list[itemIdx];
        let index;
        if (item) {
            index = itemIdx;
        }
        else {
            if (or) {
                if (or.bEnd) {
                    index = list.length;
                }
                else if (or.bStart) {
                    index = 0;
                }
            }
            if (!index && index != 0) {
                index = list.length;
                obj.addProperty(userInject);
            }
            else {
                obj.insertProperty(index, userInject);
            }
        }
        return index;
    }
    static async setCustomUserInjectIndexByArray(ary, info) {
        let userInject = await this.getCustomUserInjectString();
        let list = ary.getFirstChildByKind(ts_morph_1.SyntaxKind.SyntaxList);
        let item = list.getChildren().find(v => { return v.getFullText().includes(userInject); });
        if (item) {
            let index = item.getChildIndex();
            list.insertChildText(index, info);
        }
        else {
            ary.addElement(info + '\n' + userInject);
        }
    }
}
exports.CIBase = CIBase;
