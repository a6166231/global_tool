'use strict';

module.exports = {
    load() {

    },
    unload() {

    },
    ///注册消息
    messages: {
        'unpacker'() {
            Editor.Panel.open('texture-unpacker');
        }
    },
}