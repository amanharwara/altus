const addChatIDs = () => {
  const section = document.querySelector("#pane-side div[class][role]")

  if (section.childNodes.length > 0) {
    section
      .childNodes
      .forEach((chat) => {
        let Fiber =
          chat[
            Object.keys(chat).find((key) => key.includes("Fiber"))
          ];
        let id =
          Fiber.memoizedProps.children.props.chat.contact.__x_id._serialized;
        chat.id = id;
      });
  }
};
module.exports = addChatIDs;
