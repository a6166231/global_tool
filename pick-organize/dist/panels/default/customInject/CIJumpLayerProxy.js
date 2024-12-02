"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIJumpLayerProxy = void 0;
const ts_morph_1 = require("ts-morph");
const CIBase_1 = require("./CIBase");
class CIJumpLayerProxy extends CIBase_1.CIBase {
    constructor() {
        super(...arguments);
        this._sWorldMediatorTable = 'JumpLayerProxy';
        this._methodName = 'InitJumpMessage';
        this._propertyName = 'this.LayerMessageTable';
    }
    async readyToInject() {
        var _a;
        let _class = this.sourceFile.getClass(this._sWorldMediatorTable);
        let _funcBody = (_a = _class === null || _class === void 0 ? void 0 : _class.getMethod(this._methodName)) === null || _a === void 0 ? void 0 : _a.getBody();
        for (let comment of _funcBody.getStatementsWithComments()) {
            if (comment.getKind() != ts_morph_1.SyntaxKind.ExpressionStatement)
                continue;
            let expressStatement = comment;
            let properType = expressStatement.getExpression().getFirstChildByKind(ts_morph_1.SyntaxKind.PropertyAccessExpression);
            if (!properType || properType.getText() != this._propertyName)
                continue;
            let obj = expressStatement.getExpression().getFirstChildByKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
            let list = obj.getFirstChildByKind(ts_morph_1.SyntaxKind.SyntaxList);
            if (!list)
                continue;
            let index = await CIBase_1.CIBase.getCustomUserInjectIndex(list);
            if (this._CIItemData.comment.length > 0) {
                list.insertChildText(index, `${('//' + this._CIItemData.comment)}`);
                index += 1;
            }
            for (let item of (this._CIItemData.readyList || [])) {
                list.insertChildText(index, `[LT.${item.layer}]: { attach: NT.${item.open}, unAttach: NT.${item.close} },`);
                index += 2;
            }
            break;
        }
    }
}
exports.CIJumpLayerProxy = CIJumpLayerProxy;
