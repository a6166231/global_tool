"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mvc = void 0;
const messageManager_1 = require("./messageManager");
const scriptManager_1 = require("./scriptManager");
class mvc {
    static scriptMgr() {
        return scriptManager_1.ScriptManager.getInstance(scriptManager_1.ScriptManager);
    }
    static messageMgr() {
        return messageManager_1.MessageManager.getInstance(messageManager_1.MessageManager);
    }
}
exports.mvc = mvc;
