import { ArrayLiteralExpression, Block, ExpressionStatement, ObjectLiteralExpression, SyntaxKind, SyntaxList } from "ts-morph";
import { CIBase } from "./CIBase";

export interface JumpLayerProxyData {
    open: string,
    close: string,
    layer: string
}

export class CIJumpLayerProxy<T extends JumpLayerProxyData = JumpLayerProxyData> extends CIBase<T> {

    private _sWorldMediatorTable = 'JumpLayerProxy'

    private _methodName = 'InitJumpMessage'
    private _propertyName = 'this.LayerMessageTable'

    async readyToInject() {
        let _class = this.sourceFile.getClass(this._sWorldMediatorTable)
        let _funcBody = _class?.getMethod(this._methodName)?.getBody() as Block
        for (let comment of _funcBody.getStatementsWithComments()) {
            if (comment.getKind() != SyntaxKind.ExpressionStatement) continue

            let expressStatement = comment as ExpressionStatement

            let properType = expressStatement.getExpression().getFirstChildByKind(SyntaxKind.PropertyAccessExpression)
            if (!properType || properType.getText() != this._propertyName) continue

            let obj = expressStatement.getExpression().getFirstChildByKind(SyntaxKind.ObjectLiteralExpression) as ObjectLiteralExpression

            let list = obj.getFirstChildByKind(SyntaxKind.SyntaxList)
            if (!list) continue

            let index = await CIBase.getCustomUserInjectIndex(list)
            if (this._CIItemData!.comment!.length > 0) {
                list.insertChildText(index, `${('//' + this._CIItemData.comment)}`)
                index += 1
            }
            for (let item of (this._CIItemData.readyList || [])) {
                list.insertChildText(index, `[LT.${item.layer}]: { attach: NT.${item.open}, unAttach: NT.${item.close} },`)
                index += 2
            }
            break
        }
    }

}