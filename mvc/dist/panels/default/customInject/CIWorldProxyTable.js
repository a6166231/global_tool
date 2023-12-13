"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIWorldProxyTable = void 0;
const ts_morph_1 = require("ts-morph");
const CIBase_1 = require("./CIBase");
class CIWorldProxyTable extends CIBase_1.CIBase {
    constructor() {
        super(...arguments);
        this._sWorldProxyTable = 'WorldProxyTable';
    }
    async readyToInject() {
        var _a;
        let varMemberList = (_a = this.sourceFile.getVariableDeclaration(this._sWorldProxyTable)) === null || _a === void 0 ? void 0 : _a.getFirstChildByKindOrThrow(ts_morph_1.SyntaxKind.ArrayLiteralExpression);
        if (!varMemberList)
            return;
        for (let name of (this._CIItemData.readyList || [])) {
            varMemberList === null || varMemberList === void 0 ? void 0 : varMemberList.addElement(`// ${this._CIItemData.comment}\n${name + ','}`);
            await this.injectImportClass(name, this._CIItemData.lpath.replace('db:', ''));
        }
    }
}
exports.CIWorldProxyTable = CIWorldProxyTable;
