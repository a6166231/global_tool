"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.po = void 0;
const localCfg_1 = require("./panels/default/localCfg");
class po {
    static get localCfg() {
        return localCfg_1.LocalCfg.getInstance(localCfg_1.LocalCfg);
    }
}
exports.po = po;
