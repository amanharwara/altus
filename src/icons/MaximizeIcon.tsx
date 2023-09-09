import { Component, ComponentProps } from "solid-js";

const MaximizeIcon: Component<ComponentProps<"svg">> = (props) => {
  return (
    <svg
      aria-hidden="true"
      style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M4 4h16v16H4V4m2 4v10h12V8H6z" fill="currentColor" />
    </svg>
  );
};

export default MaximizeIcon;
