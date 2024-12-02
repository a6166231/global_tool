export class pathLockItem {
    private _status: boolean = false;

    private _lock: HTMLElement = {} as HTMLElement;
    private _unlock: HTMLElement = {} as HTMLElement;

    private _btn: HTMLElement = {} as HTMLElement;

    //@ts-ignore
    private _changeCall: Function = null;
    public get status() {
        return this._status;
    }
    constructor(item: HTMLElement, changeCall: Function) {
        this._btn = item
        this._changeCall = changeCall;

        let vbtn = item.getElementsByTagName('span') || []
        this._lock = vbtn[0] as HTMLElement;
        this._unlock = vbtn[1] as HTMLElement;

        this.refreshLockStatus();
        this.addListener();
    }

    private onChangeCall() {
        this._changeCall && this._changeCall();
    }

    private refreshLockStatus() {
        this._lock.hidden = !this._status;
        this._unlock.hidden = this._status;
    }

    private addListener() {
        this._btn.onclick = () => {
            this.onClick()
            this.onChangeCall()
        }
    }

    private onClick() {
        this._status = !this._status;
        this.refreshLockStatus();
    }
}