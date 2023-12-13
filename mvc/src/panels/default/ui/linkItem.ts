import { TemplateModel } from "../../../main";
import { MVCModelName } from "../MVCModel";
import { mvc } from "../mvc";
import Utils from "../util";

export class LinkItem {
    private _status: boolean = true;
    private _item: HTMLElement = {} as HTMLElement;

    private _select: HTMLElement = {} as HTMLElement;
    private _unselect: HTMLElement = {} as HTMLElement;

    private _btn: HTMLElement = {} as HTMLElement;
    private _link: HTMLSelectElement = {} as HTMLSelectElement;
    private _data: TemplateModel = {} as TemplateModel;

    //@ts-ignore
    private _changeCall: Function = null;

    public get status() {
        return this._status;
    }

    public get selected() {
        return this._link.value
    }

    public set hidden(status: boolean) {
        this._item.hidden = status;
    }

    public get hidden() {
        return this._item.hidden;
    }
    public set dropLinkHiddent(status: boolean) {
        this._link.hidden = status;
    }

    public get dropLinkHiddent() {
        return this._link.hidden;
    }

    constructor(item: HTMLElement, data: TemplateModel, changeCall: Function) {
        this._item = item;
        this._data = data;
        this._changeCall = changeCall;

        this._btn = Utils.getClsNameElement(item, 'btnLink');
        this._link = Utils.getTagNameElement(item, 'ui-select') as HTMLSelectElement;

        let vbtn = item.getElementsByTagName('span') || []
        this._select = vbtn[0] as HTMLElement;
        this._unselect = vbtn[1] as HTMLElement;

        this.initLinkList();
        this.refreshSelect();
        this.addListener();
    }

    private refreshSelect() {
        this._select.hidden = !this._status;
        this._unselect.hidden = this._status;
    }

    private addListener() {
        this._btn.onclick = () => {
            this.onClick()
            this.onChangeCall()
        }

        this._link.onclick = (ev) => {
            ev.stopPropagation();
            this.initLinkList();
        }

        this._link.onchange = () => {
            this.onChangeCall()
        }
    }

    private onChangeCall() {
        this._changeCall && this._changeCall();
    }

    private onClick() {
        this._status = !this._status;
        this.refreshSelect();
    }

    private initLinkList() {
        if (this._link.innerHTML.length != 0) return;
        let mapData: Map<string, string> = new Map;
        let hidden = true;
        switch (this._data.name) {
            case MVCModelName.Mediator:
                mapData = mvc.scriptMgr().getLayerScript()
                hidden = false
                break;
            case MVCModelName.Proxy:
                mapData = mvc.scriptMgr().getModelScript()
                hidden = false
                break;
        }
        let innerHtml = ''
        for (let [k, v] of mapData) {
            innerHtml += `<option value="${k}">${v}</option>`
        }
        this._link.innerHTML = innerHtml;
        this._link.hidden = hidden;
    }

}