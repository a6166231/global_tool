"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Picker = void 0;
class Picker {
    constructor(items) {
        this._items = [];
        this._items = items;
        this._refreshReadyList();
    }
    _refreshReadyList() {
        let readyList = [];
        for (let item of this._items) {
        }
    }
}
exports.Picker = Picker;
