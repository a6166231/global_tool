"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = void 0;
let setGroup = (groupName, uuids) => {
};
let newGroup = (groupName, uuids) => {
};
exports.messages = {
    map: [{
            url: '/pick-organize/set-group',
            handle: setGroup,
        },
        {
            url: '/pick-organize/new-group',
            handle: newGroup,
        },],
};
