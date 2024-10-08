import { IAssetMeta } from "../@types/packages/asset-db/@types/public";
import { IAssetInfo } from "../@types/packages/package-asset/@types/public";
import { singleton } from "./singleton";
import { ResBroadcast } from "./watcher";

export interface ScriptItemData {
    path: string
}

export class MessageManager extends singleton {
    //@ts-ignore
    private _call: (type: ResBroadcast) => any = null;

    private _scriptChangeTypeMap: Record<ResBroadcast, Map<string, ScriptItemData>> = {} as any

    triggerListener(type: ResBroadcast) {
        this._call && this._call(type);
    }

    setResChangeCall(call: (type: ResBroadcast) => any) {
        //@ts-ignore
        this._call = call;
    }

    public resAdd(path: string) {
        this.setScriptChangeByType(ResBroadcast.Add, path)
        this.triggerListener(ResBroadcast.Add);
    }
    public resChange(path: string) {
        this.setScriptChangeByType(ResBroadcast.Change, path)
        this.triggerListener(ResBroadcast.Change);
    }
    public resDel(path: string) {
        this.setScriptChangeByType(ResBroadcast.Delete, path)
        this.triggerListener(ResBroadcast.Delete);
    }

    private setScriptChangeByType(type: ResBroadcast, path: string) {
        let map = this._scriptChangeTypeMap[type]
        if (!map) {
            map = new Map
            this._scriptChangeTypeMap[type] = map
        }
        //@ts-ignore
        map.set(path, { path: path.replaceAll('\\', '/') })
    }

    public getChangeMapByType(type: ResBroadcast) {
        return this._scriptChangeTypeMap[type] || new Map
    }

    public clearChangeMap() {
        this._scriptChangeTypeMap = {} as any
    }

}