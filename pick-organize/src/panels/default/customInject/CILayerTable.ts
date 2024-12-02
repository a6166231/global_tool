import { SyntaxKind } from "ts-morph";
import { CIBase } from "./CIBase";

export class CILayerTable extends CIBase {

    private _sLayerTable = 'LayerTable'

    async readyToInject() {
        let varMemberList = this.sourceFile.getVariableDeclaration(this._sLayerTable)?.getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression)
        if (!varMemberList) return;

        let index = await CIBase.getCustomUserInjectIndexByObject(varMemberList)

        for (let name of (this._CIItemData.readyList || [])) {
            varMemberList.insertProperty(index, `${name}: 99999,${this._CIItemData!.comment!.length > 0 ? ('//' + this._CIItemData.comment) : ""}`)
            index += 1
        }
    }

}