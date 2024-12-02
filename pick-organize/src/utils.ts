import { AssetInfo } from "../@types/packages/asset-db/@types/public"

export default {
    async QueryAssetInfo(ppath: string): Promise<AssetInfo | null> {
        return Editor.Message.request('asset-db', 'query-asset-info', ppath)
    },
    async QueryAssetList(ppath: string): Promise<Array<AssetInfo> | null> {
        return Editor.Message.request('asset-db', 'query-assets', {
            pattern: `${ppath}/*`
        })
    },
    OpenAsset(ppath: string) {
        return Editor.Message.send('asset-db', 'open-asset', ppath)
    },
    JumpAsset(ppath: string) {
        return Editor.Message.broadcast('ui-kit:touch-asset', ppath)
    },
}