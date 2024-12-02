import { ArrayLiteralExpression, SyntaxKind } from "ts-morph";
import { CIBase } from "./CIBase";

export class CIWorldMediatorTable extends CIBase {

    private _sWorldMediatorTable = 'WorldMediatorTable'
    async readyToInject() {
        let varMemberList = this.sourceFile.getVariableDeclaration(this._sWorldMediatorTable)?.getFirstChildByKindOrThrow(SyntaxKind.ArrayLiteralExpression)
        if (!varMemberList) return;

        for (let name of (this._CIItemData.readyList || [])) {
            await CIBase.setCustomUserInjectIndexByArray(varMemberList, `${this._CIItemData!.comment!.length > 0 ? ('//' + this._CIItemData.comment + '\n') : ""}${name + ','}`)
            await this.injectImportClass(name, this._CIItemData.lpath!.replace('db:', ''), true)
        }

    }

}