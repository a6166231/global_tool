"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageManager = exports.ResBroadcast = void 0;
const mvc_1 = require("./default/mvc");
const singleton_1 = require("./default/singleton");
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
    }
    init() {
        Editor.Message.addBroadcastListener(ResBroadcast.Add, this.resAdd);
        Editor.Message.addBroadcastListener(ResBroadcast.Change, this.resChange);
        Editor.Message.addBroadcastListener(ResBroadcast.Delete, this.resDel);
    }
    delListener() {
        Editor.Message.removeBroadcastListener(ResBroadcast.Add, this.resAdd);
        Editor.Message.removeBroadcastListener(ResBroadcast.Change, this.resChange);
        Editor.Message.removeBroadcastListener(ResBroadcast.Delete, this.resDel);
    }
    triggerListener(type) {
        this._call && this._call(type);
    }
    addListener(call) {
        //@ts-ignore
        this._call = call;
    }
    /** p1暂时不知道是作什么用的 */
    resAdd(p1, p2, p3) {
        console.log('res add', p2);
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
        console.log('res change', p2);
        //是ts类型的
        if (p2.importer != 'typescript')
            return;
        let has = mvc_1.mvc.scriptMgr().getScript(p2.uuid);
        console.log(has);
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
        console.log('res delect', p2);
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
