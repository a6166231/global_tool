// @ts-nocheck
import { rayCaughtControll } from "./rayCaughtControll";

export default class Utils {
    static checkNodeValid(ccNode: any) {
        // @ts-ignore
        return ccNode && cc.isValid(ccNode)
    }

    static outputToConsole(target: any) {
        let i = 1;
        // @ts-ignore
        while (window['temp' + i] !== undefined) {
            i++;
        }
        // @ts-ignore
        window['temp' + i] = target;
        console.log('temp' + i);
        // @ts-ignore
        console.log(window['temp' + i]);
    }

    static drawNodeRect(target: any) {
        let rect;
        let transform = target.getComponent(cc.UITransformComponent);
        if (transform) {
            rect = this.getSelfBoundingBoxToWold(transform);
        } else {
            let worldPos = cc.v3();
            target.getWorldPosition(worldPos);
            rect = cc.rect(worldPos.x, worldPos.y, 0, 0);
        }
        let canvasNode = new cc.Node('Canvas');
        let scene = cc.director.getScene();
        scene.addChild(canvasNode);
        canvasNode.addComponent(cc.Canvas);
        let bgNode = new cc.Node();
        let graphics = bgNode.addComponent(cc.GraphicsComponent);
        let bgTransform = bgNode.addComponent(cc.UITransformComponent);
        canvasNode.addChild(bgNode);
        let centerPos = cc.v3(rect.center.x, rect.center.y, 0);
        let localPos = cc.v3();
        canvasNode.getComponent(cc.UITransformComponent).convertToNodeSpaceAR(centerPos, localPos);
        bgNode.setPosition(localPos);
        bgNode.layer = target.layer;
        let isZeroSize = rect.width === 0 || rect.height === 0;
        if (isZeroSize) {
            graphics.circle(0, 0, 100);
            graphics.fillColor = cc.Color.GREEN;
            graphics.fill();
        } else {
            bgTransform.width = rect.width;
            bgTransform.height = rect.height;
            graphics.rect(-bgTransform.width / 2, -bgTransform.height / 2, bgTransform.width, bgTransform.height);
            graphics.fillColor = new cc.Color().fromHEX('#E91E6390');
            graphics.fill();
        }
        setTimeout(() => {
            if (cc.isValid(canvasNode)) {
                canvasNode.destroy();
            }
        }, 2000);
        return target;
    }

    static addAnimation(id: number, node: Node) {
        let canvasNode = new cc.Node('anim_' + id);
        if (globalThis.Global && globalThis.Global.FrameAnimManager) {
            let anim = globalThis.Global.FrameAnimManager.CreateSFXAnim(id)
            if (anim) {
                canvasNode.removeAllChildren()
                canvasNode.addChild(anim.node)
                anim.setLayoutZOrder(canvasNode.layer)
                anim.Play(0, 0, true)
                node.addChild(canvasNode)
            } else {
                console.log("没有此id对应的动画")
            }
        }
    }

    static getComponentName(component: any) {
        return component.__classname__;
    }

    static getComponents(ccNode: any) {
        return ccNode.components.map((component: any) => {
            return { name: component.__classname__, target: component }
        });
    }

    static getSelfBoundingBoxToWold(transform: any) {
        let _worldMatrix = cc.mat4();
        if (transform.node.parent) {
            transform.node.parent.getWorldMatrix(_worldMatrix);
            let parentMat = _worldMatrix;
            let _matrix = cc.mat4();
            cc.Mat4.fromRTS(_matrix, transform.node.getRotation(), transform.node.getPosition(), transform.node.getScale());
            const width = transform._contentSize.width;
            const height = transform._contentSize.height;
            const rect = cc.rect(-transform._anchorPoint.x * width, -transform._anchorPoint.y * height, width, height);
            cc.Mat4.multiply(_worldMatrix, parentMat, _matrix);
            rect.transformMat4(_worldMatrix);
            return rect;
        } else {
            return transform.getBoundingBox();
        }
    }

    static createRayCaught() {
        rayCaughtControll.Ins().status = !rayCaughtControll.Ins().status
    }

    static directorPause() {
        if (!cc.director._paused) {
            console.log('%c@@@@@@   暂停逻辑执行，不影响渲染和 UI 响应，详情看cc.director.pause()', 'color:#ff6600;font-size:1em')
            cc.director.pause();
        } else {
            console.log('%c@@@@@@   恢复逻辑执行，详情看cc.director.resume()', 'color:#118855;font-size:1em')
            cc.director.resume();
        }
    }

    static getNodePath(node) {
        if(!node) return ''
        let temp = node;
        let paths = [temp.name]
        while(temp.parent){
            paths.push(temp.parent.name)
            temp = temp.parent
        }
        return paths.reverse().join('/')
    }

}
