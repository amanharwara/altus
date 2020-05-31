const {
    zipChats
} = require('./zipChats');

function enableOnlineIndicator() {
    let onlineIndicatorStyle = `
<style id="online-indicator-style">
.chat-is-online {
    overflow: visible;
}

.chat-is-online::before {
    content: '';
    display: block;
    width: 1rem;
    height: 1rem;
    background: #46da7f;
    position: absolute;
    top: 70%;
    right: 0;
    z-index: 110;
    border-radius: 100%;
}
</style>
`;

    document.head.append(document.createRange().createContextualFragment(onlineIndicatorStyle));

    window.WAPI.getAllChats(chats => {
        // Get all chats
        let allChatIDs = chats.map(chat => chat.id._serialized);
        // Subscribe to all chats' presence update
        allChatIDs.forEach(id => window.WAPI.getChat(id).presence.subscribe());
        // Presence Updates
        window.presenceInterval = setInterval(() => {
            let elements = document.querySelector('._21sW0._1ecJY').children;
            let chats = window.WAPI.getAllChats();
            let zippedChats = zipChats(elements, chats);
            allChatIDs.forEach(id => {
                let chat = window.WAPI.getChat(id);
                let isOnline = chat.presence.isOnline;
                let chatElementPair = zippedChats.find(chat => chat[1].id._serialized === id);
                let [element] = chatElementPair;
                let imgContainer = element.querySelector('img').parentElement;
                if (isOnline) {
                    imgContainer.classList.add('chat-is-online');
                } else {
                    if (imgContainer.classList.contains('chat-is-online')) imgContainer.classList.remove('chat-is-online');
                }
            });
        }, 2000);
    });
}

module.exports = {
    enableOnlineIndicator
}