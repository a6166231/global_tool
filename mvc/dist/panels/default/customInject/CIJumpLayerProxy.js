"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIJumpLayerProxy = void 0;
const ts_morph_1 = require("ts-morph");
const CIBase_1 = require("./CIBase");
class CIJumpLayerProxy extends CIBase_1.CIBase {
    constructor() {
        super(...arguments);
        this._sWorldMediatorTable = 'JumpLayerProxy';
    }
    async readyToInject() {
        var _a;
        let _class = this.sourceFile.getClass(this._sWorldMediatorTable);
        let _funcBody = (_a = _class === null || _class === void 0 ? void 0 : _class.getMethod('InitJumpMessage')) === null || _a === void 0 ? void 0 : _a.getBody();
        //@ts-ignore
        let expressStatement = _funcBody === null || _funcBody === void 0 ? void 0 : _funcBody.getStatementByKind(ts_morph_1.SyntaxKind.ExpressionStatement);
        let obj = expressStatement.getExpression().getFirstChildByKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
        for (let item of (this._CIItemData.readyList || [])) {
            // item.open
            obj.addProperty(`${this._CIItemData.comment.length > 0 ? ('//' + this._CIItemData.comment + '\n') : ""}[LT.${item.layer}]: { attach: NT.${item.open}, unAttach: NT.${item.close} }`);
        }
    }
}
exports.CIJumpLayerProxy = CIJumpLayerProxy;
