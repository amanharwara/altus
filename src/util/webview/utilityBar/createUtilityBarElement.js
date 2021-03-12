const createUtilityBarElement = () => {
  let utilityBar = document.createElement("div");
  utilityBar.className = "utility-bar";
  utilityBar.style = `height: 47px;
  max-height: 47px;
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 98.5%;
  background: var(--gray-100);
  padding: 0.5rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  z-index: -1;`;
  let styleElement = document.createElement("style");
  styleElement.innerHTML = `
  :not([data-theme="default"]) > .utility-bar {
    background: var(--gray-850) !important;
    color: #fff;
  }
  .ub-button {
    padding: 0.35rem 0.5rem;
    margin: 0 0.35rem 0 0;
    background: var(--green-deep);
    color: #fff;
    border-radius: 2px;
    user-select: none;
    cursor: pointer;
  }
  .ub-button:not(.quick-reply) {
    display: flex;
    align-items: center;
  }
  .ub-button:hover {
    background: var(--green);
  }
  .quick-replies::before {
    content: "|";
    font-weight: 100;
    color: var(--gray-600);
  }
  .quick-replies {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    max-width: 100%;
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
  }
  .quick-reply {
    max-width: 7.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }
  .quick-reply:first-child {
    margin-left: 0.35rem;
  }
  .section-title {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.35rem;
  }
  .ub-input:focus {
    outline: 1px solid var(--green-deep);
  }
  .show {
    display: block !important;
  }
  .ub-remove {
    margin-left: 0.5rem;
    font-weight: bold;
  }`;
  utilityBar.appendChild(styleElement);
  return utilityBar;
};

module.exports = createUtilityBarElement;
