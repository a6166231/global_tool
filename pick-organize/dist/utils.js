"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    async QueryAssetInfo(ppath) {
        return Editor.Message.request('asset-db', 'query-asset-info', ppath);
    },
    async QueryAssetList(ppath) {
        return Editor.Message.request('asset-db', 'query-assets', {
            pattern: `${ppath}/*`
        });
    },
    OpenAsset(ppath) {
        return Editor.Message.send('asset-db', 'open-asset', ppath);
    },
    JumpAsset(ppath) {
        return Editor.Message.broadcast('ui-kit:touch-asset', ppath);
    },
};
