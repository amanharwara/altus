const { v4: uuid } = require("uuid");

const defaultTabSettings = () => {
  return {
    id: uuid(),
    name: "",
    active: true,
    config: {
      theme: "default",
      notifications: true,
      sound: true,
      utilityBar: false,
      color: "#2A3440",
      spellChecker: false,
    },
  };
};

export default defaultTabSettings;
