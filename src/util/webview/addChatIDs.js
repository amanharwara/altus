const addChatIDs = () => {
  if (document.querySelectorAll('#pane-side [role="region"] > *').length > 0) {
    document
      .querySelectorAll('#pane-side [role="region"] > *')
      .forEach((chat) => {
        let internalInstance =
          chat[
            Object.keys(chat).find((key) => key.includes("InternalInstance"))
          ];
        let id =
          internalInstance.memoizedProps.children.props.contact.id._serialized;
        chat.id = id;
      });
  }
};
module.exports = addChatIDs;
