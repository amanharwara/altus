const Store = require('electron-store');

let quickRepliesStore = new Store({
    name: 'quickReplies',
    defaults: {
        replyStore: []
    }
});

module.exports = {
    quickRepliesStore
};