"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageManager = exports.ResBroadcast = void 0;
const mvc_1 = require("./mvc");
const singleton_1 = require("./singleton");
var ResBroadcast;
(function (ResBroadcast) {
    ResBroadcast["Add"] = "asset-db:asset-add";
    ResBroadcast["Change"] = "asset-db:asset-change";
    ResBroadcast["Delete"] = "asset-db:asset-delete";
})(ResBroadcast = exports.ResBroadcast || (exports.ResBroadcast = {}));
class MessageManager extends singleton_1.singleton {
    constructor() {
        super(...arguments);
        //@ts-ignore
        this._call = null;
        this.messageMap = {};
    }
    addListener() {
        this.messageMap[ResBroadcast.Add] = (p1, p2, p3) => {
            this.resAdd(p1, p2, p3);
        };
        this.messageMap[ResBroadcast.Change] = (p1, p2, p3) => {
            this.resChange(p1, p2, p3);
        };
        this.messageMap[ResBroadcast.Delete] = (p1, p2, p3) => {
            this.resDel(p1, p2, p3);
        };
        Editor.Message.addBroadcastListener(ResBroadcast.Add, this.messageMap[ResBroadcast.Add]);
        Editor.Message.addBroadcastListener(ResBroadcast.Change, this.messageMap[ResBroadcast.Change]);
        Editor.Message.addBroadcastListener(ResBroadcast.Delete, this.messageMap[ResBroadcast.Delete]);
    }
    removeListener() {
        Editor.Message.removeBroadcastListener(ResBroadcast.Add, this.messageMap[ResBroadcast.Add]);
        Editor.Message.removeBroadcastListener(ResBroadcast.Change, this.messageMap[ResBroadcast.Change]);
        Editor.Message.removeBroadcastListener(ResBroadcast.Delete, this.messageMap[ResBroadcast.Delete]);
    }
    triggerListener(type) {
        this._call && this._call(type);
    }
    setResChangeCall(call) {
        //@ts-ignore
        this._call = call;
    }
    /** p1暂时不知道是作什么用的 */
    resAdd(p1, p2, p3) {
        //是ts类型的
        if (p2.importer != 'typescript')
            return;
        this.setMapScriptItem(p2.uuid, p2.name, p2.path);
        this.triggerListener(ResBroadcast.Add);
    }
    /** p1暂时不知道是作什么用的
     * 文件修改名字或者内容更新都会走change消息
    */
    resChange(p1, p2, p3) {
        //是ts类型的
        if (p2.importer != 'typescript')
            return;
        let has = mvc_1.mvc.scriptMgr().getScript(p2.uuid);
        if (!has) {
            this.setMapScriptItem(p2.uuid, p2.name, p2.file);
        }
        else {
            if (has.name != p2.name) { //文件名改了 先把旧名字的删掉
                this.delMapScriptItem(p2.uuid, has.name);
                this.setMapScriptItem(p2.uuid, p2.name, p2.path);
            }
        }
        this.triggerListener(ResBroadcast.Change);
    }
    /** p1暂时不知道是作什么用的 */
    resDel(p1, p2, p3) {
        //是ts类型的
        if (p2.importer != 'typescript')
            return;
        this.delMapScriptItem(p2.uuid, p2.name);
        this.triggerListener(ResBroadcast.Delete);
    }
    setMapScriptItem(uuid, name, path) {
        mvc_1.mvc.scriptMgr().setScript(uuid, name.replace('.ts', ''), path);
    }
    delMapScriptItem(uuid, name) {
        mvc_1.mvc.scriptMgr().delScript(uuid, name.replace('.ts', ''));
    }
}
exports.MessageManager = MessageManager;
