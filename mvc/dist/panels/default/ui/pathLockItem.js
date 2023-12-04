"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathLockItem = void 0;
class pathLockItem {
    get status() {
        return this._status;
    }
    constructor(item, changeCall) {
        this._status = false;
        this._lock = {};
        this._unlock = {};
        this._btn = {};
        //@ts-ignore
        this._changeCall = null;
        this._btn = item;
        this._changeCall = changeCall;
        let vbtn = item.getElementsByTagName('span') || [];
        this._lock = vbtn[0];
        this._unlock = vbtn[1];
        this.refreshLockStatus();
        this.addListener();
    }
    onChangeCall() {
        this._changeCall && this._changeCall();
    }
    refreshLockStatus() {
        this._lock.hidden = !this._status;
        this._unlock.hidden = this._status;
    }
    addListener() {
        this._btn.onclick = () => {
            this.onClick();
            this.onChangeCall();
        };
    }
    onClick() {
        this._status = !this._status;
        this.refreshLockStatus();
    }
}
exports.pathLockItem = pathLockItem;
