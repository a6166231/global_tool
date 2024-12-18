"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CILayerTable = void 0;
const ts_morph_1 = require("ts-morph");
const CIBase_1 = require("./CIBase");
class CILayerTable extends CIBase_1.CIBase {
    constructor() {
        super(...arguments);
        this._sLayerTable = 'LayerTable';
    }
    async readyToInject() {
        var _a;
        let varMemberList = (_a = this.sourceFile.getVariableDeclaration(this._sLayerTable)) === null || _a === void 0 ? void 0 : _a.getFirstChildByKindOrThrow(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
        if (!varMemberList)
            return;
        let index = await CIBase_1.CIBase.getCustomUserInjectIndexByObject(varMemberList);
        for (let name of (this._CIItemData.readyList || [])) {
            varMemberList.insertProperty(index, `${name}: 99999,${this._CIItemData.comment.length > 0 ? ('//' + this._CIItemData.comment) : ""}`);
            index += 1;
        }
    }
}
exports.CILayerTable = CILayerTable;
