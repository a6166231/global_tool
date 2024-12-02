import { SyntaxKind, SyntaxList } from "ts-morph";
import { CIBase } from "./CIBase";

export class CINoticeTable extends CIBase {
    private _sNoticeTable = 'NoticeTable'

    async readyToInject() {
        let _enumList = this.sourceFile.getEnums();
        let noticeTableEnum = _enumList.find((v) => { return v.getName() == this._sNoticeTable })

        let list = noticeTableEnum?.getLastChildByKindOrThrow(SyntaxKind.SyntaxList);
        if (!list) return;

        let index = await CIBase.getCustomUserInjectIndex(list)
        if (this._CIItemData!.comment!.length > 0) {
            list.insertChildText(index, `${'//' + this._CIItemData.comment}`)
            index += 1
        }
        for (let notice of (this._CIItemData.readyList || [])) {
            if (noticeTableEnum!.getMember(notice)) {
                console.warn('消息已经存在：', notice)
                continue;
            }
            list.insertChildText(index, notice + ',')
            index += 2
        }
    }

}