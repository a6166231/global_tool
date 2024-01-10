//@ts-nocheck

export interface IComponentProp {
    name: string;
    key: string;
    custom?: boolean;
    show?: boolean | ((...p) => boolean);
    enum?: any,
    progress?: { min?: number, max: number, step?: number },
}

export class ComponentManager {
    static getViewModel(name: string, componentGetter: any) {
        switch (name) {
            case 'cc.UITransform':
                return new CCUITransformModel(componentGetter);
            case 'cc.Label':
                return new CCLabelModel(componentGetter);
            case 'cc.RichText':
                return new CCRichTextModel(componentGetter);
            case 'cc.Sprite':
                return new CCSpriteModel(componentGetter);
            case 'cc.UIOpacity':
                return new CCUIOpacityModel();
            case 'cc.ProgressBar':
                return new CCProgressBarModel();
            case 'cc.Layout':
                return new CCLayoutModel(componentGetter);
            default:
                return null
        }
    }

    static getCustomViewModel(name: string, componentGetter: any) {
        switch (name) {
            case 'FontStyleLabel':
                return new CSFontStyleLabel()
            case 'GoodsNode':
                return new CSGoodsNode()
            default:
                return null
        }
    }
}

class ComponentViewModelBase {
    props: IComponentProp[] = []

    protected _propObj: Record<string, IComponentProp>;
    get propObj() {
        if (!this._propObj) {
            this._propObj = [] as any
            for (let k of this.props) {
                this._propObj[k.name] = k
            }
        }
        return this._propObj;
    }
}

class ComponentGetterViewModel extends ComponentViewModelBase {
    props: IComponentProp[] = []
    protected componentGetter: any;
    constructor(componentGetter: any) {
        super()
        this.componentGetter = componentGetter;
    }

    get component(): any {
        return this.componentGetter();
    }
}

class CCUITransformModel extends ComponentGetterViewModel {
    props: IComponentProp[] = [
        { name: 'Width', key: 'width', custom: true },
        { name: 'Height', key: 'height', custom: true },
        { name: 'Anchor X', key: 'anchorX', custom: true },
        { name: 'Anchor Y', key: 'anchorY', custom: true },
    ]

    get width() {
        return this.componentGetter().contentSize.width;
    }

    set width(value: number) {
        const origin = this.component.contentSize;
        this.component.setContentSize(value, origin.height);
    }

    get height() {
        return this.component.contentSize.height;
    }

    set height(value: number) {
        const origin = this.component.contentSize;
        this.component.setContentSize(origin.width, value);
    }

    get anchorX() {
        return this.component.anchorPoint.x;
    }

    set anchorX(value: number) {
        const origin = this.component.anchorPoint;
        this.component.setAnchorPoint(value, origin.y);
    }

    get anchorY() {
        return this.component.anchorPoint.y;
    }

    set anchorY(value: number) {
        const origin = this.component.anchorPoint;
        this.component.setAnchorPoint(origin.x, value);
    }

}

class CCLabelModel extends ComponentGetterViewModel {
    props: IComponentProp[] = [
        { name: 'String', key: 'string' },
        { name: 'Color', key: 'color' },
        { name: 'Font Size', key: 'fontSize' },
        { name: 'Line Height', key: 'lineHeight' },
        { name: 'Font', key: 'font' },
    ];
}

class CCRichTextModel extends CCLabelModel {
}

class CCLayoutModel extends ComponentGetterViewModel {
    props: IComponentProp[] = [
        { name: 'Type', key: 'type', enum: cc.Layout.Type },
        { name: 'ResizeMode', key: 'resizeMode', show: () => !(this.component.type == cc.Layout.Type.NONE), enum: cc.Layout.ResizeMode },
        { name: 'PaddingLeft', key: 'paddingLeft', show: () => Boolean(this.component.type == cc.Layout.Type.HORIZONTAL || this.component.type == cc.Layout.Type.GRID) },
        { name: 'PaddingRight', key: 'paddingRight', show: () => Boolean(this.component.type == cc.Layout.Type.HORIZONTAL || this.component.type == cc.Layout.Type.GRID) },
        { name: 'PaddingTop', key: 'paddingTop', show: () => Boolean(this.component.type == cc.Layout.Type.VERTICAL || this.component.type == cc.Layout.Type.GRID) },
        { name: 'PaddingBottom', key: 'paddingBottom', show: () => Boolean(this.component.type == cc.Layout.Type.VERTICAL || this.component.type == cc.Layout.Type.GRID) },
        { name: 'SpacingX', key: 'spacingX', show: () => Boolean(this.component.type == cc.Layout.Type.HORIZONTAL || this.component.type == cc.Layout.Type.GRID) },
        { name: 'SpacingY', key: 'spacingY', show: () => Boolean(this.component.type == cc.Layout.Type.HORIZONTAL || this.component.type == cc.Layout.Type.GRID) },
    ];
}

class CCSpriteModel extends ComponentGetterViewModel {
    props: IComponentProp[] = [
        { name: 'Color', key: 'color' },
        { name: 'SpriteFrame', key: 'spriteFrame', custom: true },
    ];

    get spriteFrame() {
        return this.component._spriteFrame
    }
}
class CCUIOpacityModel extends ComponentViewModelBase {
    props: IComponentProp[] = [
        { name: 'Opacity', key: 'opacity' },
    ];
}
class CCProgressBarModel extends ComponentViewModelBase {
    props: IComponentProp[] = [
        { name: 'Progress', key: 'progress', progress: { max: 1, step: 0.1 } },
    ];
}


/** --------------------------自定义脚本------------------------------ */

class CSFontStyleLabel extends ComponentViewModelBase {
    props: IComponentProp[] = [
        { name: 'Key', key: '_key' },
    ];
}

class CSGoodsNode extends ComponentViewModelBase {
    props: IComponentProp[] = [
        { name: 'ItemId', key: 'itemId' },
        { name: 'Count', key: 'count' },
    ];
}