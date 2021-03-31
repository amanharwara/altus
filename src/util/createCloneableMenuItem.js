const createCloneableMenuItem = ({
  submenu,
  id,
  label,
  type,
  accelerator,
  commandId,
}) => {
  let newSubmenu;

  if (submenu?.items && submenu?.items.length > 0) {
    newSubmenu = submenu.items.map((item) => createCloneableMenuItem(item));
  }

  return {
    ...(id ? { id } : {}),
    ...(label ? { label } : {}),
    ...(newSubmenu && newSubmenu.length > 0 ? { submenu: newSubmenu } : {}),
    ...(type ? { type } : {}),
    ...(accelerator ? { accelerator } : {}),
    ...(commandId ? { commandId } : {}),
    focused: false,
  };
};

module.exports = createCloneableMenuItem;
