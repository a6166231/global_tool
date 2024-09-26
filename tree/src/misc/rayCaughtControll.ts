// @ts-nocheck
import Utils from "./Utils";

const rayCaughtTag = '__ray_caught_tag__'

export class rayCaughtControll {
    private _canvas;
    private _touchPos;
    private _status: boolean = false;

    private _touch;

    private static _int: rayCaughtControll;
    public static Ins() {
        if (!this._int) {
            this._int = new rayCaughtControll()
        }
        return this._int
    }

    set status(status: boolean) {
        this._status = status;
        this._touch = null

        if (!this._canvas || !cc.isValid(this._canvas)) {
            this._canvas = null
            this.readyToRayCaught()
        }
        this._canvas.active = status
        if (!this._status) {
            this._touchPos = null;
            this._canvas.destroyAllChildren()
        }
    }
    get status() {
        return this._status;
    }

    constructor() {
        this.readyToRayCaught();
    }

    private _initListener() {
        if (!this._canvas) return

        this._canvas.on(cc.Node.EventType.TOUCH_END, () => {
            if (this._touch) {
                window.__updateSelectCurrentNode && window.__updateSelectCurrentNode(this._touch)
            }
            this.status = false
        }, this)

        this._canvas.on(cc.Node.EventType.MOUSE_MOVE, this.rayTest, this)
    }
    private _offListener() {
        if (!this._canvas) return
        this._canvas.off(cc.Node.EventType.MOUSE_MOVE, this.rayTest, this)
    }

    readyToRayCaught() {
        if (this._canvas) return
        this._initTopCaught();
        this._initListener();
    }

    private _initTopCaught() {
        if (this._canvas) return
        let Caught = new cc.Node('Caught')
        Caught.addComponent(cc.UITransformComponent).priority = 999999
        Caught.getComponent(cc.UITransformComponent).setContentSize(cc.view.getVisibleSize())
        this._canvas = Caught
        cc.director.getScene().addChild(Caught);
        Caught.addComponent(cc.Canvas)
        let widget = Caught.addComponent(cc.Widget)
        widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true
        widget.left = widget.right = widget.top = widget.bottom = 0;
        widget.alignMode = cc.Widget.AlignMode.ALWAYS;
    }

    readyToClear() {
        this._offListener();
        this._canvas?.destroy();
        this._canvas = null
        this._touchPos = null;
    }

    rayTest(ev) {
        if (!this._status) return

        this._touchPos = ev.getLocation();
        let canvas = cc.director.getScene();
        let touch = this.foreachChild(canvas)
        touch && this._drawItemRect(touch)
    }

    private _drawItemRect(touch: any) {
        this._canvas.destroyAllChildren()

        let _rect;
        let transform = touch.getComponent(cc.UITransformComponent);
        if (transform) {
            _rect = Utils.getSelfBoundingBoxToWold(transform);
        } else {
            let worldPos = cc.v3();
            touch.getWorldPosition(worldPos);
            _rect = cc.rect(worldPos.x, worldPos.y, 0, 0);
        }

        let nodeRect = new cc.Node('nodeRect')
        nodeRect[rayCaughtTag] = true

        let graphics = nodeRect.addComponent(cc.GraphicsComponent);
        let bgTransform = nodeRect.addComponent(cc.UITransformComponent);
        this._canvas.addChild(nodeRect);
        let centerPos = cc.v3(_rect.center.x, _rect.center.y, 0);
        let localPos = cc.v3();
        this._canvas.getComponent(cc.UITransformComponent).convertToNodeSpaceAR(centerPos, localPos);
        nodeRect.setPosition(localPos);
        nodeRect.layer = touch.layer;

        this._touch = touch
        let isZeroSize = _rect.width === 0 || _rect.height === 0;
        if (isZeroSize) {
            graphics.circle(0, 0, 100);
            graphics.fillColor = cc.Color.GREEN;
            graphics.fill();
        } else {
            bgTransform.width = _rect.width;
            bgTransform.height = _rect.height;
            graphics.rect(-bgTransform.width / 2, -bgTransform.height / 2, bgTransform.width, bgTransform.height);
            graphics.fillColor = new cc.Color().fromHEX('#E91E6390');
            graphics.fill();
        }
    }



    foreachChild(node: any) {
        let touch;
        for (let i = node.children.length - 1; i >= 0; i--) {
            let child = node.children[i];
            if (!child.activeInHierarchy) continue;
            if (child[rayCaughtTag]) continue

            if (child._uiProps.uiTransformComp && child._uiProps.uiComp && child._uiProps.uiTransformComp.hitTest(this._touchPos)) {
                if (!(child._uiProps.uiComp instanceof cc.Graphics))
                    touch = child
            }
            let touch2 = this.foreachChild(child, this._touchPos);
            if (touch2) {
                touch = touch2
            }
            if (touch) {
                break;
            }
        }
        return touch
    }

}