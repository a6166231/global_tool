import { ArrayLiteralExpression, ExpressionStatement, ObjectLiteralExpression, SyntaxKind } from "ts-morph";
import { CIBase } from "./CIBase";

export interface JumpLayerProxyData {
    open: string,
    close: string,
    layer: string
}

export class CIJumpLayerProxy<T extends JumpLayerProxyData = JumpLayerProxyData> extends CIBase<T> {

    private _sWorldMediatorTable = 'JumpLayerProxy'
    async readyToInject() {

        let _class = this.sourceFile.getClass(this._sWorldMediatorTable)
        let _funcBody = _class?.getMethod('InitJumpMessage')?.getBody()

        //@ts-ignore
        let expressStatement = _funcBody?.getStatementByKind(SyntaxKind.ExpressionStatement) as ExpressionStatement

        let obj = expressStatement.getExpression().getFirstChildByKind(SyntaxKind.ObjectLiteralExpression) as ObjectLiteralExpression
        for (let item of (this._CIItemData.readyList || [])) {
            // item.open
            obj.addProperty(`// ${this._CIItemData.comment}\n[LT.${item.layer}]: { attach: NT.${item.open}, unAttach: NT.${item.close} }`)
        }

    }

}