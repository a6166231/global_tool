import { SyntaxKind } from "ts-morph";
import { CIBase } from "./CIBase";

export class CILayerTable extends CIBase {

    private _sLayerTable = 'LayerTable'

    readyToInject() {
        let varMemberList = this.sourceFile.getVariableDeclaration(this._sLayerTable)?.getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression)
        if (!varMemberList) return;
        for (let name of (this._CIItemData.readyList || [])) {
            varMemberList.addProperty(`${name}, // ${this._CIItemData.comment}`);
        }
    }

}