import { SyntaxKind } from "ts-morph";
import { CIBase } from "./CIBase";

export class CINoticeTable extends CIBase {

    private _sNoticeTable = 'NoticeTable'

    readyToInject() {
        let _enumList = this.sourceFile.getEnums();
        let noticeTableEnum = _enumList.find((v) => { return v.getName() == this._sNoticeTable })

        let list = noticeTableEnum?.getLastChildByKindOrThrow(SyntaxKind.SyntaxList);
        if (!noticeTableEnum) return;

        list?.addChildText(`${this._CIItemData!.comment!.length > 0 ? ('//' + this._CIItemData.comment) : ""}`);
        for (let notice of (this._CIItemData.readyList || [])) {
            if (noticeTableEnum!.getMember(notice)) {
                console.warn('消息已经存在：', notice)
                continue;
            }
            list?.addChildText(notice + ',');
        }
    }

}