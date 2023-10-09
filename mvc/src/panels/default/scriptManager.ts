import { ScriptDataModel } from "../../main";
import { singleton } from "./singleton";
import Utils from "./util";

export class ScriptManager extends singleton {
    private _mapScript: Map<string, ScriptDataModel | string> = new Map;

    private _mapModelScript: Map<string, string> = new Map;
    private _mapLayerScript: Map<string, string> = new Map;

    public init(mapScript: Map<string, ScriptDataModel | string> = new Map, mapModelScript: Map<string, string> = new Map, mapLayerScript: Map<string, string> = new Map) {
        this._mapScript = mapScript;
        this._mapModelScript = mapModelScript;
        this._mapLayerScript = mapLayerScript;
    }
    public getScript(name: string = '') {
        return this._mapScript.get(name);
    }

    public getModelScript() {
        return this._mapModelScript;
    }
    public getLayerScript() {
        return this._mapLayerScript;
    }

    public async setScript(uuid: string = '', name: string = '', path: string = '') {
        this._mapScript.set(uuid, {
            trueName: name,
            name: name.toLowerCase(),
            path: path,
        });
        this._mapScript.set(name.toLowerCase(), uuid);

        if (Utils.checkModel(name)) {
            this._mapModelScript.set(uuid, name)
        }
    }
    public delScript(uuid: string = '', name: string = '') {
        this._mapScript.delete(uuid);
        this._mapScript.delete(name.toLowerCase());

        this._mapModelScript.delete(uuid);
        this._mapLayerScript.delete(uuid);
    }
}