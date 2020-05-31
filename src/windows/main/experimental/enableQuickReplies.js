const {
    quickRepliesStore
} = require("../store/quickReplies");
const {
    getActiveChat
} = require('./getActiveChat');

/**
 * Enable quick replies feature
 * @param {string} id ID of the WhatsApp tab to enable quick replies for.
 */
function enableQuickReplies(id) {
    let quickRepliesStyle = `
<style id="quick-replies-style">
footer > div:first-child {
    position: relative;
}
.reply-container {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    border: 1px solid #b7b7b7;
    border-left: none !important;
    border-right: none;
    padding: 0.5rem 1rem !important;
    min-height: auto;
    background: inherit !important;
}
.add-reply {
    padding: 0.5rem 1rem !important;
    min-height: auto;
    background: inherit !important;
    border: 1px solid #b7b7b7;
}
.element {
    color: aliceblue;
    background: #596c8e;
    display: inline-flex;
    padding: .35rem .75rem;
    box-sizing: border-box;
    border-radius: 1rem;
    margin: 0 .25rem;
    cursor: pointer;
    flex-shrink: 0;
    max-width: 6rem;
}
.quick-replies::-webkit-scrollbar {
    width: .25rem !important;
    height: .25rem !important;
}
.quick-replies {
    overflow: auto hidden;
    display: flex;
    flex-direction: row;
    width: 97%;
    flex-wrap: nowrap;
    box-sizing: border-box;
}
.element span.text {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: inline-block;
}
.element span.remove-reply {
    margin-left: 0.5rem;
    border-left: 1px solid #d2d2d2a6;
    padding-left: 0.25rem;
}
.element span.remove-reply:hover {
    background: rgba(0, 0, 0, 0.25);
}
.toggle-reply-container {
    color: aliceblue;
    background: #324a75;
    display: inline-flex;
    padding: .15rem .25rem;
    position: absolute;
    bottom: 100%;
    left: 0;
    cursor: pointer;
    font-size: 0.75rem;
    z-index: 200;
}
.toggle-reply-container:hover {
    background: #5274b1;
}
</style>
`;

    document.head.append(
        document.createRange().createContextualFragment(quickRepliesStyle)
    );

    let quickReplies = [];

    findAndGetReplies();

    function findAndGetReplies() {
        if (quickRepliesStore.get("replyStore").find((store) => store.id === id)) {
            quickReplies = quickRepliesStore
                .get("replyStore")
                .find((store) => store.id === id).replies;
        } else {
            quickRepliesStore.set("replyStore", [
                ...quickRepliesStore.get("replyStore"),
                {
                    id: id,
                    replies: [],
                },
            ]);
        }
    }

    const handleRemoveReplyClick = e => {
        if (e.target.classList.contains('remove-reply')) {
            e.preventDefault();
            e.stopPropagation();
            let store = quickRepliesStore.get('replyStore');
            store = store.map(str => {
                if (str.id === id) {
                    return {
                        ...str,
                        replies: str.replies.filter(reply => reply !== e.target.getAttribute('data-reply'))
                    }
                } else {
                    return str
                }
            });
            quickRepliesStore.set('replyStore', [...store]);
            updateReplyList();
        }
    }

    document.addEventListener('click', handleRemoveReplyClick);

    const handleReplyClick = e => {
        console.log(e.target);
        if (e.target.closest('.reply-element') && !e.target.classList.contains('remove-reply')) {
            getActiveChat().sendMessage(e.target.closest('.reply-element').querySelector('.text').innerText);
        }
    };

    document.addEventListener('click', handleReplyClick);

    const handleToggleContainerClick = e => {
        if (e.target.classList.contains('toggle-reply-container')) {
            if (document.querySelector('.reply-container')) {
                if (document.querySelector('.reply-container').style.display === 'none') {
                    document.querySelector('.reply-container').style.display = '';
                } else {
                    document.querySelector('.reply-container').style.display = 'none';
                }
            }
        }
    }

    document.addEventListener('click', handleToggleContainerClick);

    function addRepliesToDOM() {
        if (quickReplies.length > 0) {
            quickReplies.forEach((reply) => {
                let replyElement = document
                    .createRange()
                    .createContextualFragment(
                        `<div class="element reply-element" title="${reply}"><span class="text">${reply}</span><span class="remove-reply" data-reply="${reply}">×</span></div>`
                    );

                document.querySelector(".quick-replies").append(replyElement);
            });
        }
    }

    new MutationObserver((mutations) => {
        mutations.forEach((mut) => {
            if (
                mut.addedNodes.length > 0 &&
                Array.from(mut.addedNodes).find((node) => node.id === "main")
            ) {
                let replyContainer = document
                    .createRange()
                    .createContextualFragment(`<div class="toggle-reply-container" title="Open/Close Quick Replies">▼</div><div class="reply-container"><div class="quick-replies"></div></div>`);

                document
                    .querySelector("footer > div:first-child")
                    .append(replyContainer);


                let addReplyButton = document.createRange().createContextualFragment(`<div class="element" id="add-quick-replies" title="Add New Reply">+</div>`);

                document.querySelector('.quick-replies').append(addReplyButton);
                document.querySelector('#add-quick-replies').addEventListener('click', () => toggleAddNewReply());

                addRepliesToDOM();
            }
        });
    }).observe(document.querySelector(".app > ._1-iDe.Wu52Z"), {
        subtree: true,
        childList: true,
    });

    function updateReplyList() {
        document.querySelectorAll('.reply-element').forEach(reply => {
            reply.removeEventListener('click', handleReplyClick);
            reply.remove()
        });
        findAndGetReplies();
        addRepliesToDOM();
    }

    function toggleAddNewReply() {
        let element = document.createRange().createContextualFragment(`<div class="add-reply"><input type="text" class="reply-textbox" id="add-reply-textbox"><div class="element" id="add-reply-button">Add</div></div>`);

        let handleAddReply = () => {
            let reply = document.querySelector('#add-reply-textbox').value;
            if (reply && reply.length > 0) {
                let store = quickRepliesStore.get('replyStore');
                store.find(str => str.id === id).replies.push(reply);
                quickRepliesStore.set('replyStore', store);
                updateReplyList();
            }
            document.querySelector('#add-reply-textbox').value = '';
        };

        if (document.querySelector('.add-reply')) {
            document.querySelector('.add-reply').remove();
            document.querySelector('#add-reply-button').removeEventListener('click', handleAddReply);
        } else {
            document.querySelector('#main').append(element);

            document.querySelector('.add-reply').style.position = 'absolute';
            document.querySelector('.add-reply').style.left = '0';
            document.querySelector('.add-reply').style.zIndex = '200';
            document.querySelector('.add-reply').style.top =
                document.querySelector('.reply-container').getBoundingClientRect().top - document.querySelector('.reply-container').getBoundingClientRect().height + 'px';

            document.querySelector('#add-reply-button').addEventListener('click', handleAddReply);
        }
    }
}

module.exports = {
    enableQuickReplies,
};