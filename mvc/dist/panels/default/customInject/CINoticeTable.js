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
    readyToInject() {
        let _enumList = this.sourceFile.getEnums();
        let noticeTableEnum = _enumList.find((v) => { return v.getName() == this._sNoticeTable; });
        let list = noticeTableEnum === null || noticeTableEnum === void 0 ? void 0 : noticeTableEnum.getLastChildByKindOrThrow(ts_morph_1.SyntaxKind.SyntaxList);
        if (!noticeTableEnum)
            return;
        list === null || list === void 0 ? void 0 : list.addChildText(`// ${this._CIItemData.comment}`);
        for (let notice of (this._CIItemData.readyList || [])) {
            if (noticeTableEnum.getMember(notice)) {
                console.warn('消息已经存在：', notice);
                continue;
            }
            list === null || list === void 0 ? void 0 : list.addChildText(notice + ',');
        }
    }
}
exports.CINoticeTable = CINoticeTable;
