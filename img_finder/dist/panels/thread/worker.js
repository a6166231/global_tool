"use strict";
// 监听 main 并将缓冲区转移到 myWorker
self.onmessage = (msg) => {
    console.log("message from main received in worker:", msg);
};
