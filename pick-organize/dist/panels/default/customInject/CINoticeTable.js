"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CINoticeTable = void 0;
const ts_morph_1 = require("ts-morph");
const CIBase_1 = require("./CIBase");
class CINoticeTable extends CIBase_1.CIBase {
    constructor() {
        super(...arguments);
        this._sNoticeTable = 'NoticeTable';
    }
    async readyToInject() {
        let _enumList = this.sourceFile.getEnums();
        let noticeTableEnum = _enumList.find((v) => { return v.getName() == this._sNoticeTable; });
        let list = noticeTableEnum === null || noticeTableEnum === void 0 ? void 0 : noticeTableEnum.getLastChildByKindOrThrow(ts_morph_1.SyntaxKind.SyntaxList);
        if (!list)
            return;
        let index = await CIBase_1.CIBase.getCustomUserInjectIndex(list);
        if (this._CIItemData.comment.length > 0) {
            list.insertChildText(index, `${'//' + this._CIItemData.comment}`);
            index += 1;
        }
        for (let notice of (this._CIItemData.readyList || [])) {
            if (noticeTableEnum.getMember(notice)) {
                console.warn('消息已经存在：', notice);
                continue;
            }
            list.insertChildText(index, notice + ',');
            index += 2;
        }
    }
}
exports.CINoticeTable = CINoticeTable;
