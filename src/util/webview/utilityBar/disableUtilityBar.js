const disableUtilityBar = () => {
  document.querySelector("footer").previousElementSibling.style.height = "0px";
  document.querySelector(".utility-bar").remove();
};

module.exports = disableUtilityBar;
