import { Component, ComponentProps } from "solid-js";

const RestoreIcon: Component<ComponentProps<"svg">> = (props) => {
  return (
    <svg
      aria-hidden="true"
      style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="M4 8h4V4h12v12h-4v4H4V8m12 0v6h2V6h-8v2h6M6 12v6h8v-6H6z"
        fill="currentColor"
      />
    </svg>
  );
};

export default RestoreIcon;
