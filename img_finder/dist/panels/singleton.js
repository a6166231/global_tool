"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleton = void 0;
class singleton {
    static getInstance(model) {
        if (!this._instance) {
            this._instance = Reflect.construct(model, []);
        }
        return this._instance;
    }
}
exports.singleton = singleton;
