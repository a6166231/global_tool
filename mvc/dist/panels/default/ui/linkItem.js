"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkItem = void 0;
const MVCModel_1 = require("../MVCModel");
const mvc_1 = require("../mvc");
const util_1 = __importDefault(require("../util"));
class LinkItem {
    constructor(item, data, changeCall) {
        this._status = true;
        this._item = {};
        this._select = {};
        this._unselect = {};
        this._btn = {};
        this._link = {};
        this._data = {};
        //@ts-ignore
        this._changeCall = null;
        this._item = item;
        this._data = data;
        this._changeCall = changeCall;
        this._btn = util_1.default.getClsNameElement(item, 'btnLink');
        this._link = util_1.default.getTagNameElement(item, 'ui-select');
        let vbtn = item.getElementsByTagName('span') || [];
        this._select = vbtn[0];
        this._unselect = vbtn[1];
        this.initLinkList();
        this.refreshSelect();
        this.addListener();
    }
    get status() {
        return this._status;
    }
    get selected() {
        return this._link.value;
    }
    set hidden(status) {
        this._item.hidden = status;
    }
    get hidden() {
        return this._item.hidden;
    }
    set dropLinkHiddent(status) {
        this._link.hidden = status;
    }
    get dropLinkHiddent() {
        return this._link.hidden;
    }
    refreshSelect() {
        this._select.hidden = !this._status;
        this._unselect.hidden = this._status;
    }
    addListener() {
        this._btn.onclick = () => {
            this.onClick();
            this.onChangeCall();
        };
        this._link.onclick = () => {
            this.initLinkList();
        };
        this._link.onchange = () => {
            this.onChangeCall();
        };
    }
    onChangeCall() {
        this._changeCall && this._changeCall();
    }
    onClick() {
        this._status = !this._status;
        this.refreshSelect();
    }
    initLinkList() {
        if (this._link.innerHTML.length != 0)
            return;
        let mapData = new Map;
        let hidden = true;
        switch (this._data.name) {
            case MVCModel_1.MVCModelName.Mediator:
                mapData = mvc_1.mvc.scriptMgr().getLayerScript();
                hidden = false;
                break;
            case MVCModel_1.MVCModelName.Proxy:
                mapData = mvc_1.mvc.scriptMgr().getModelScript();
                hidden = false;
                break;
        }
        let innerHtml = '';
        for (let [k, v] of mapData) {
            innerHtml += `<option value="${k}">${v}</option>`;
        }
        this._link.innerHTML = innerHtml;
        this._link.hidden = hidden;
    }
}
exports.LinkItem = LinkItem;
