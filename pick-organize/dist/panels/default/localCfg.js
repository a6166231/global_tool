"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalCfg = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const package_json_1 = __importDefault(require("../../../package.json"));
const singleton_1 = require("../../singleton");
class LocalCfg extends singleton_1.singleton {
    constructor() {
        super(...arguments);
        this.ppath = 'localCfg.json';
    }
    getLocalCfgJson() {
        // if (!this.cfgJson) {
        let json = (0, fs_1.readFileSync)(path_1.default.join(Editor.Package.getPath(package_json_1.default.name), 'src/cfg.json'), { encoding: 'utf-8' });
        try {
            if (json) {
                this.cfgJson = JSON.parse(json.toString());
            }
            else {
                this.cfgJson = [];
            }
        }
        catch (error) {
            this.cfgJson = [];
        }
        // }
        return this.cfgJson;
    }
    setLocalCfgJson(cfgs) {
        this.cfgJson = cfgs;
        (0, fs_1.writeFileSync)(path_1.default.join(Editor.Package.getPath(package_json_1.default.name), 'src/cfg.json'), JSON.stringify(cfgs), { encoding: 'utf-8' });
    }
}
exports.LocalCfg = LocalCfg;
