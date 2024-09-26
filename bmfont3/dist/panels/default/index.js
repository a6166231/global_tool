"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
const panelDataMap = new WeakMap();
const Fs = require('fs');
const { dialog } = require('electron').remote;
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {},
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('MyCounter', {
                template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/vue/counter.html'), 'utf-8'),
                data() {
                    return {
                        filePath: "",
                        imageList: [],
                        updateImageList: [],
                        canvasWidth: 256,
                        canvasHeight: 256,
                        fontInfo: '',
                        autoFixSize: false,
                        fixSize: {
                            width: 0,
                            height: 0
                        }
                    };
                },
                methods: {
                    checkAutoFix(e) {
                        this.autoFixSize = e.target.checked;
                        this.canvasWidth = 256;
                        this.canvasHeight = 256;
                        this.updateCanvas(null, (maxX, maxY) => {
                            this.canvasWidth = maxX + 2;
                            this.canvasHeight = maxY;
                            setTimeout(() => {
                                this.updateCanvas(null);
                            }, 10);
                        });
                    },
                    dragEnter(e) {
                        e.stopPropagation();
                        e.preventDefault();
                    },
                    dragOver(e) {
                        e.stopPropagation();
                        e.preventDefault();
                    },
                    onDrop(e) {
                        this.removeAll();
                        this.canvasWidth = 256;
                        this.canvasHeight = 256;
                        e.stopPropagation();
                        e.preventDefault();
                        let dt = e.dataTransfer;
                        let files = dt === null || dt === void 0 ? void 0 : dt.files;
                        this.showImgData(files);
                        this.fixSize.width = this.fixSize.height = 0;
                    },
                    showImgData(files) {
                        if (files.length) {
                            let successCount = 0;
                            for (var i = 0; i < files.length; i++) {
                                let file = files[i];
                                if (!/^image\//.test(file.type))
                                    continue;
                                let fileReader = new FileReader();
                                fileReader.onload = (() => {
                                    return (e) => {
                                        if (this.updateImageList.indexOf(e.target.result) !== -1)
                                            return;
                                        var img = new Image();
                                        img.src = e.target.result;
                                        img.onload = () => {
                                            this.fixSize.width = Math.max(this.fixSize.width, img.width);
                                            this.fixSize.height = Math.max(this.fixSize.height, img.height);
                                            let fileName = file.name.split('.')[0];
                                            this.imageList.push({
                                                img: e.target.result,
                                                char: fileName.substr(fileName.length - 1, 1),
                                                width: img.width,
                                                height: img.height,
                                                x: 0,
                                                y: 0,
                                            });
                                            this.updateImageList.push(e.target.result);
                                            this.updateCanvas(null, (maxX, maxY) => {
                                                successCount++;
                                                if (successCount >= files.length) {
                                                    this.canvasWidth = maxX + 2;
                                                    this.canvasHeight = maxY;
                                                    setTimeout(() => {
                                                        this.updateCanvas(null);
                                                    }, 10);
                                                }
                                            });
                                        };
                                    };
                                })();
                                fileReader.readAsDataURL(file);
                            }
                        }
                    },
                    updateCanvas(data, func) {
                        if (!this.imageList.length)
                            return;
                        let height = 0;
                        let space = 2;
                        let x = space;
                        let y = space;
                        let maxX = x;
                        let maxY = y;
                        this.imageList.forEach((img) => {
                            if (img.height > height)
                                height = img.height;
                        });
                        height = Math.ceil(height);
                        this.fontSize = this.autoFixSize ? this.fixSize.height : height;
                        let content = this.$refs.fontCanvas.getContext('2d');
                        content.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
                        this.imageList.forEach((img2) => {
                            let img = new Image();
                            img.src = img2.img;
                            let width = this.autoFixSize ? this.fixSize.width : img2.width;
                            let height2 = this.autoFixSize ? this.fixSize.height : height;
                            if (x + width + space > this.canvasWidth) {
                                y += height2 + space;
                                if (y + height2 + space > this.canvasHeight) {
                                    this.canvasWidth += (x + width + space);
                                    this.canvasHeight += y;
                                }
                                x = space;
                            }
                            content.drawImage(img, x + (this.autoFixSize ? Math.floor((width - img2.width) / 2) : 0), y + (this.autoFixSize ? Math.floor((height2 - img2.height) / 2) : 0));
                            img2.x = x;
                            img2.y = y;
                            x += width + space;
                            if (maxX < x) {
                                maxX = x;
                            }
                            if (maxY < y + height2 + space) {
                                maxY = y + height2 + space;
                            }
                        });
                        func && func(maxX, maxY);
                    },
                    loadFileData() {
                        let str = `info size=${this.fontSize} unicode=1 stretchH=100 smooth=1 aa=1 padding=0,0,0,0 spacing=1,1 outline=0`;
                        str += `\ncommon lineHeight=${this.fontSize} base=23 scaleW=${this.canvasWidth} scaleH=${this.canvasHeight} pages=1 packed=0`;
                        str += `\npage id=0 file="${this.fontName}.png"`;
                        str += `\nchars count=${this.imageList.length}\n`;
                        this.imageList.forEach((img) => {
                            str += `char id=${this.caseConvertEasy(img.char).charCodeAt(0)} x=${img.x} y=${img.y} width=${this.autoFixSize ? this.fixSize.width : img.width} height=${this.autoFixSize ? this.fixSize.height : img.height} xoffset=0 yoffset=0 xadvance=${this.autoFixSize ? this.fixSize.width : img.width}\n`;
                        });
                        this.fontInfo = str;
                    },
                    caseConvertEasy(str) {
                        return str.split('').map((s) => {
                            if (s.charCodeAt() <= 90) {
                                return s.toUpperCase();
                            }
                            return s.toLowerCase();
                        }).join('');
                    },
                    removeAll() {
                        this.imageList = [];
                        this.updateImageList = [];
                        this.updateCanvas();
                    },
                    save() {
                        this.selectFolder(() => {
                            this.loadFileData();
                            this.savePng();
                            this.saveFnt();
                        });
                    },
                    selectFolder(func) {
                        dialog.showSaveDialog({
                            properties: ['showOverwriteConfirmation']
                        }).then(result => {
                            let fontPath = result.filePath;
                            console.log("保存路径： ", fontPath);
                            this.selectSuccess(fontPath, func);
                        }).catch(err => {
                            console.log(err);
                        });
                        // let self = this;
                        // Editor.Scene.callSceneScript('bitmapfont', 'getCocosVersion', function (err, version) {
                        //     let result = self.compareVersion(version, "2.4.5");
                        //     Editor.log("版本号： ", version, "结果", result);
                        //     if (result >= 0) { //大于等于2.4.5版本
                        //         dialog.showSaveDialog({
                        //             properties: ['openDirectory']
                        //         }).then(result => {
                        //             let fontPath = result.filePath;
                        //             Editor.log("保存路径： ", fontPath);
                        //             self.selectSuccess(fontPath, func);
                        //         }).catch(err => {
                        //             Editor.log(err)
                        //         })
                        //     } else { //
                        //         let fontPath = dialog.showSaveDialog({
                        //             properties: ['openDirectory',]
                        //         });
                        //         Editor.log("保存路径： ", fontPath);
                        //         self.selectSuccess(fontPath, func);
                        //     }
                        // });
                    },
                    compareVersion(v1, v2) {
                        let vers1 = v1.split('.');
                        let vers2 = v2.split('.');
                        const len = Math.max(v1.length, v2.length);
                        while (vers1.length < len) {
                            vers1.push('0');
                        }
                        while (vers2.length < len) {
                            vers2.push('0');
                        }
                        for (let i = 0; i < len; i++) {
                            const num1 = parseInt(vers1[i]);
                            const num2 = parseInt(vers2[i]);
                            if (num1 > num2) {
                                return 1;
                            }
                            else if (num1 < num2) {
                                return -1;
                            }
                        }
                        return 0;
                    },
                    selectSuccess(fontPath, func) {
                        if (fontPath) {
                            var agent = navigator.userAgent.toLowerCase();
                            let fontArr = [];
                            var isMac = /macintosh|mac os x/i.test(navigator.userAgent);
                            /**32或者64位 windoiws系统 */
                            let isWindows = (agent.indexOf("win32") >= 0 || agent.indexOf("wow32") >= 0) || (agent.indexOf("win64") >= 0 || agent.indexOf("wow64") >= 0);
                            if (isWindows) {
                                fontArr = fontPath.split("\\");
                            }
                            if (isMac) {
                                fontArr = fontPath.split("/");
                            }
                            this.fontName = fontArr[fontArr.length - 1];
                            this.filePath = fontPath.replace("\\" + this.fontName, "");
                            if (this.filePath) {
                                console.log("选择完成，保存中");
                                func();
                            }
                        }
                    },
                    saveFnt() {
                        Fs.writeFileSync(this.filePath.replace(/\\/g, "/") + '/' + this.fontName + '.fnt', this.fontInfo);
                    },
                    savePng() {
                        let src = this.$refs.fontCanvas.toDataURL("image/png");
                        let data = src.replace(/^data:image\/\w+;base64,/, "");
                        let buffer = new window.Buffer(data, 'base64');
                        Fs.writeFileSync(this.filePath.replace(/\\/g, "/") + '/' + this.fontName + '.png', buffer);
                        console.log("保存成功");
                    }
                }
            });
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
