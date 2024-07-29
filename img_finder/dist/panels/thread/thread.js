"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WThread = void 0;
class WThread {
    static test() {
        const urls = [
            'E:/projects/creator_framework/creator_client/assets/resources/res/private/equip_retrieve_ui/bg_hsbtt_01.png',
            'E:/projects/creator_framework/creator_client/assets/resources/res/private/equip_retrieve_ui/bg_hsbtt_01.png',
            'E:/projects/creator_framework/creator_client/assets/resources/res/private/equip_retrieve_ui/bg_hsbtt_01.png',
            'E:/projects/creator_framework/creator_client/assets/resources/res/private/equip_retrieve_ui/bg_hsbtt_01.png',
            'E:/projects/creator_framework/creator_client/assets/resources/res/private/equip_retrieve_ui/bg_hsbtt_01.png',
            'E:/projects/creator_framework/creator_client/assets/resources/res/private/equip_retrieve_ui/bg_hsbtt_01.png',
            'E:/projects/creator_framework/creator_client/assets/resources/res/private/equip_retrieve_ui/bg_hsbtt_01.png',
            'E:/projects/creator_framework/creator_client/assets/resources/res/private/equip_retrieve_ui/bg_hsbtt_01.png',
            'E:/projects/creator_framework/creator_client/assets/resources/res/private/equip_retrieve_ui/bg_hsbtt_01.png',
            'E:/projects/creator_framework/creator_client/assets/resources/res/private/equip_retrieve_ui/bg_hsbtt_01.png',
        ];
        this.postWorkers(urls, (data) => {
            console.log(data);
        });
    }
    static getWorkers() {
        if (this._workers.length == 0) {
            const numWorkers = navigator.hardwareConcurrency || 4;
            // 创建Web Workers
            for (let i = 0; i < numWorkers; i++) {
                let worker = new Worker('');
                this._workers.push(worker);
            }
        }
        return this._workers;
    }
    static endTasks() {
        console.log('end all tasks');
        this._busy = false;
        for (let work of this.getWorkers()) {
            work.terminate();
        }
    }
    static postWorkers(tasks, resolve) {
        if (this._busy) {
            console.error('thread is busy');
            return;
        }
        if (tasks.length == 0) {
            console.warn('no task todo');
            return;
        }
        let workers = this.getWorkers();
        let len = workers.length;
        let totalTasks = tasks.length;
        this._busy = true;
        console.log('post task');
        tasks.forEach((task, index) => {
            const workerIndex = index % len;
            workers[workerIndex].postMessage(task);
        });
        workers.forEach(worker => {
            worker.onmessage = event => {
                console.error(event);
                const data = event.data;
                if (data.loaded) {
                    resolve(data);
                }
                else if (data.error) {
                    console.error(`Failed to do work: ${data}`);
                }
                totalTasks--;
                if (totalTasks == 0) {
                    this.endTasks();
                }
            };
        });
    }
}
WThread._workers = [];
WThread._busy = false;
exports.WThread = WThread;
