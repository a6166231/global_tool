"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageManager = void 0;
const singleton_1 = require("./singleton");
const watcher_1 = require("./watcher");
class MessageManager extends singleton_1.singleton {
    constructor() {
        super(...arguments);
        //@ts-ignore
        this._call = null;
        this._scriptChangeTypeMap = {};
    }
    triggerListener(type) {
        this._call && this._call(type);
    }
    setResChangeCall(call) {
        //@ts-ignore
        this._call = call;
    }
    resAdd(path) {
        this.setScriptChangeByType(watcher_1.ResBroadcast.Add, path);
        this.triggerListener(watcher_1.ResBroadcast.Add);
    }
    resChange(path) {
        this.setScriptChangeByType(watcher_1.ResBroadcast.Change, path);
        this.triggerListener(watcher_1.ResBroadcast.Change);
    }
    resDel(path) {
        this.setScriptChangeByType(watcher_1.ResBroadcast.Delete, path);
        this.triggerListener(watcher_1.ResBroadcast.Delete);
    }
    setScriptChangeByType(type, path) {
        let map = this._scriptChangeTypeMap[type];
        if (!map) {
            map = new Map;
            this._scriptChangeTypeMap[type] = map;
        }
        //@ts-ignore
        map.set(path, { path: path.replaceAll('\\', '/') });
    }
    getChangeMapByType(type) {
        return this._scriptChangeTypeMap[type] || new Map;
    }
    clearChangeMap() {
        this._scriptChangeTypeMap = {};
    }
}
exports.MessageManager = MessageManager;
