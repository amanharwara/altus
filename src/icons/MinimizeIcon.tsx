import { Component, ComponentProps } from "solid-js";

const MinimizeIcon: Component<ComponentProps<"svg">> = (props) => {
  return (
    <svg
      aria-hidden="true"
      style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 16 16"
      {...props}
    >
      <g>
        <path d="M14 8v1H3V8h11z" fill="currentColor" />
      </g>
    </svg>
  );
};

export default MinimizeIcon;
