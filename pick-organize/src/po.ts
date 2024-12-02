import { LocalCfg } from "./panels/default/localCfg";

export class po {
    public static get localCfg() {
        return LocalCfg.getInstance(LocalCfg);
    }
}