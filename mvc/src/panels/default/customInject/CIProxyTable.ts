import { SyntaxKind } from "ts-morph";
import { CIBase } from "./CIBase";

export class CIProxyTable extends CIBase {

    private _sProxyTable = 'ProxyTable'

    readyToInject() {
        let varMemberList = this.sourceFile.getVariableDeclaration(this._sProxyTable)?.getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression)
        if (!varMemberList) return;
        for (let name of (this._CIItemData.readyList || [])) {
            varMemberList.addProperty(`${name}: "${name}", // ${this._CIItemData.comment}`);
        }
    }

}