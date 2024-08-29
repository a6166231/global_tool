import { SyntaxKind } from "ts-morph";
import { CIBase } from "./CIBase";

export class CIWorldProxyTable extends CIBase {

    private _sWorldProxyTable = 'WorldProxyTable'

    async readyToInject() {
        let varMemberList = this.sourceFile.getVariableDeclaration(this._sWorldProxyTable)?.getFirstChildByKindOrThrow(SyntaxKind.ArrayLiteralExpression)
        if (!varMemberList) return
        for (let name of (this._CIItemData.readyList || [])) {
            varMemberList?.addElement(`${this._CIItemData!.comment!.length > 0 ? ('//' + this._CIItemData.comment + '\n') : ""}${name + ','}`);
            await this.injectImportClass(name, this._CIItemData.lpath!.replace('db:', ''))
        }
    }

}