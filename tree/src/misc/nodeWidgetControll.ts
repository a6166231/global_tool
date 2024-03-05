// @ts-nocheck
import Utils from "./Utils";
import { behaviorListControll } from "./behaviorListControll";
import { KeyCode, inputListenerControll } from "./inputListenerControll";
// import * as cc from 'cc'

/** 双击关闭节点捕捉状态 */
const doubleClickTimeCeil: number = 200;

/**
 * 节点捕获处理
 */
export class nodeWidgetControll {
    private _canvas;
    private _node;
    private _nodeRect;

    private _inputListener: inputListenerControll;//输入监听器

    private _movingFlag: boolean = false

    private _firstTag = false;//首次移动数据标记  只有在第一次选择了一个节点后的第一次移动会保存数据

    private _behaviorList: behaviorListControll<{ node: cc.Node, pos: cc.Vec2 }> //行为数据备份 用于撤销、恢复

    private static _int: nodeWidgetControll;
    public static Ins() {
        if (!this._int) {
            this._int = new nodeWidgetControll()
        }
        return this._int
    }

    set node(node) {
        if (this._node == node) {
            this._node = null
        } else {
            this._node = node;
        }
        console.log(this._node)
        if (!this._node) {
            this._firstTag = false

            this.clearSelect();
            this._offListener();
        } else {
            this._firstTag = true
            this._initListener()
            setTimeout(() => {
                this._drawItemRect()
            }, 100);
        }
    }
    get node() {
        return this._node;
    }

    constructor() {
        this.readyToRayCaught();

        this._behaviorList = new behaviorListControll<{ node: cc.Node, pos: cc.Vec2 }>()
    }

    private _initListener() {
        if (!this._canvas) return
        this._canvas.on(cc.Node.EventType.TOUCH_START, this.touchStart, this)
        this._canvas.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this)
        this._canvas.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this)

        if (!this._inputListener)
            this._inputListener = new inputListenerControll()

        this._inputListener.on([
            {
                key: [KeyCode.CTRL_LEFT, KeyCode.KEY_Z],
                call: () => {
                    this._triggerBehavior(this._behaviorList.prev())
                },
                strict: true,
            },
            {
                key: [KeyCode.CTRL_LEFT, KeyCode.KEY_Y],
                call: () => {
                    this._triggerBehavior(this._behaviorList.next())
                },
                strict: true,
            },
        ], false)
    }

    private _triggerBehavior(data) {
        if (!data) return
        let node = data.node;
        if (!cc.isValid(node)) return;

        node.setPosition(data.pos);
        this._node = node
        this._drawItemRect()
    }

    private _offListener() {
        if (!this._canvas) return
        this._canvas.off(cc.Node.EventType.TOUCH_START, this.touchStart, this)
        this._canvas.off(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this)
        this._canvas.off(cc.Node.EventType.TOUCH_END, this.touchEnd, this)

        this._inputListener.off()
    }

    touchStart() {
        if (this._firstTag) {
            this._firstTag = false
            if (this._node && cc.isValid(this._node)) {
                this._behaviorList.put({
                    node: this._node,
                    pos: this._node.getPosition(),
                })
            }
        }
    }

    private _touchTag = false
    touchEnd() {
        if (!this._node) return

        if (this._touchTag) {
            this.node = null;
            this._touchTag = false
            return
        }

        if (this._movingFlag) {//操作备份
            this._behaviorList.put({
                node: this._node,
                pos: this._node.getPosition(),
            })
        }
        this._movingFlag = false

        this._touchTag = true
        setTimeout(() => {//倒计时内点2下就关闭掉
            this._touchTag = false
        }, doubleClickTimeCeil)
    }

    touchMove(ev) {
        if (!this._node) return
        this._movingFlag = true
        let delta = ev.getDelta()

        let pos = this._node.position
        this._node.setPosition(pos.x + delta.x, pos.y + delta.y)
        if (this._nodeRect) {
            pos = this._nodeRect.position
            this._nodeRect.setPosition(pos.x + delta.x, pos.y + delta.y)
        }
    }

    readyToRayCaught() {
        if (this._canvas) return
        this._initTopCaught();
    }

    private _initTopCaught() {
        if (this._canvas) return
        let Caught = new cc.Node('Caught2')
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

    clearSelect() {
        this._canvas?.destroyAllChildren()
        this._nodeRect = null;
    }

    readyToClear() {
        this._offListener();
        this._canvas?.destroy();
        this._canvas = null
        this.clearSelect();
    }

    private _drawItemRect() {
        this._canvas.destroyAllChildren()

        let _rect;
        let transform = this._node.getComponent(cc.UITransformComponent);
        if (transform) {
            _rect = Utils.getSelfBoundingBoxToWold(transform);
        } else {
            let worldPos = cc.v3();
            this._node.getWorldPosition(worldPos);
            _rect = cc.rect(worldPos.x, worldPos.y, 0, 0);
        }

        let nodeRect = new cc.Node('nodeRect')

        let graphics = nodeRect.addComponent(cc.GraphicsComponent);
        let bgTransform = nodeRect.addComponent(cc.UITransformComponent);
        this._canvas.addChild(nodeRect);
        let centerPos = cc.v3(_rect.center.x, _rect.center.y, 0);
        let localPos = cc.v3();
        this._canvas.getComponent(cc.UITransformComponent).convertToNodeSpaceAR(centerPos, localPos);
        nodeRect.setPosition(localPos);
        nodeRect.layer = this._node.layer;
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

        this._nodeRect = nodeRect;
    }
}