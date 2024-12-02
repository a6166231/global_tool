import { SyntaxKind } from "ts-morph";
import { CIBase } from "./CIBase";

export class CIProxyTable extends CIBase {

    private _sProxyTable = 'ProxyTable'

    async readyToInject() {
        let varMemberList = this.sourceFile.getVariableDeclaration(this._sProxyTable)?.getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression)
        if (!varMemberList) return;

        let index = await CIBase.getCustomUserInjectIndexByObject(varMemberList)

        for (let name of (this._CIItemData.readyList || [])) {
            varMemberList.insertProperty(index, `${name}: "${name}", ${this._CIItemData!.comment!.length > 0 ? (' //' + this._CIItemData.comment) : ""}`)
            index += 1
        }
    }

}