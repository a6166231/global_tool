export const dragDisableSet = new Set<string>();
['cc.SimpleTexture', 'cc.Texture2D', 'cc.TextureBase', 'cc.ImageAsset'].forEach(v => {
    dragDisableSet.add(v)
})