"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptManager = void 0;
const singleton_1 = require("./singleton");
const util_1 = __importDefault(require("./util"));
class ScriptManager extends singleton_1.singleton {
    constructor() {
        super(...arguments);
        this._mapScript = new Map;
        this._mapModelScript = new Map;
        this._mapLayerScript = new Map;
    }
    init(mapScript = new Map, mapModelScript = new Map, mapLayerScript = new Map) {
        this._mapScript = mapScript;
        this._mapModelScript = mapModelScript;
        this._mapLayerScript = mapLayerScript;
    }
    getScript(name = '') {
        return this._mapScript.get(name);
    }
    getModelScript() {
        return this._mapModelScript;
    }
    getLayerScript() {
        return this._mapLayerScript;
    }
    async setScript(uuid = '', name = '', path = '') {
        this._mapScript.set(uuid, {
            trueName: name,
            name: name.toLowerCase(),
            path: path,
        });
        this._mapScript.set(name.toLowerCase(), uuid);
        if (util_1.default.checkModel(name)) {
            this._mapModelScript.set(uuid, name);
        }
    }
    delScript(uuid = '', name = '') {
        this._mapScript.delete(uuid);
        this._mapScript.delete(name.toLowerCase());
        this._mapModelScript.delete(uuid);
        this._mapLayerScript.delete(uuid);
    }
}
exports.ScriptManager = ScriptManager;
