"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dragDisableSet = void 0;
exports.dragDisableSet = new Set();
['cc.SimpleTexture', 'cc.Texture2D', 'cc.TextureBase', 'cc.ImageAsset'].forEach(v => {
    exports.dragDisableSet.add(v);
});
