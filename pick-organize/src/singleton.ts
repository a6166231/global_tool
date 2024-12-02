export class singleton {
    protected static _instance: any;
    public static getInstance<T extends singleton>(model: new () => T): T {
        if (!this._instance) {
            this._instance = Reflect.construct(model, [])
        }
        return this._instance
    }
}