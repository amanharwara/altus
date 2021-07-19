const disableUtilityBar = () => {
  if (
    document.querySelector("footer") &&
    document.querySelector("footer").previousElementSibling
  )
    document.querySelector("footer").previousElementSibling.style.height =
      "0px";
  if (document.querySelector(".utility-bar"))
    document.querySelector(".utility-bar").remove();
};

module.exports = disableUtilityBar;
