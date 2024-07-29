import { readFileSync } from 'fs-extra';
import path, { join } from 'path';
import { createApp, App } from 'vue';

import { www } from '../www';

const { clipboard } = require('electron');
const panelDataMap = new WeakMap<any, App>();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
Editor.Panel.define = Editor.Panel.define || function (options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.error('show'); },
        hide() { console.error('hide'); },
    },
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        text: '#text',
    },
    methods: {
    },
    ready(defualt?: string, model?: any) {
        // if (model)
        //     www.ImgDiff().model = model
        if (this.$.app) {
            const app = createApp({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('MyCounter', {
                template: readFileSync(join(__dirname, '../../../static/template/vue/counter.html'), 'utf-8'),
                data() {
                    //@ts-ignore
                    window['__focusFunc'] = () => {
                        this.refreshClipBoard(false)
                    }
                    return {
                        imgData: defualt
                    };
                }, methods: {
                    refreshClipBoard() {
                        setTimeout(() => {
                            this.imgData = clipboard.readImage().toDataURL();
                            www.ImgDiff().searchImage(this.imgData)
                        }, 100);
                    },
                    find() {
                        this.refreshClipBoard();
                    },
                    init() {
                        www.ImgArrange().initAllSpfs()
                    },
                }
            });
            app.mount(this.$.app);
            panelDataMap.set(this, app);
            //@ts-ignore
            window.addEventListener('focus', window['__focusFunc']);
        }

    },
    beforeClose() { },
    close() {
        //@ts-ignore
        window.removeEventListener('focus', window['__focusFunc']);

        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
