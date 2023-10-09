import { MessageManager } from "./messageManager";
import { ScriptManager } from "./scriptManager";

export class mvc {
    public static scriptMgr() {
        return ScriptManager.getInstance(ScriptManager);
    }

    public static messageMgr() {
        return MessageManager.getInstance(MessageManager);
    }



}