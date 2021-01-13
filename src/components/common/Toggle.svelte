<script lang="ts">
  export let id = "toggle";
  export let value = false;
</script>

<style>
  .toggle-bg,
  .toggle {
    background: #fff;
    width: 2.75rem;
    height: 1.5rem;
    border-radius: 1rem;
    cursor: pointer;
    position: relative;
  }

  .toggle {
    background: none;
  }

  .toggle-bg::after {
    content: "";
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 100%;
    background: #2a71d1;
    position: absolute;
    top: 50%;
    left: 10%;
    right: 100%;
    transform: translateY(-50%);
    z-index: 0;
    transition: left 0.15s, right 0.15s;
  }

  .checkbox {
    cursor: pointer;
    opacity: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5;
  }

  .checkbox:checked + .toggle-bg::after {
    transition: 0.15s;
    background: #fff;
    left: 50%;
    right: 10%;
  }

  .checkbox:checked + .toggle-bg {
    background: #2a71d1;
  }

  .checkbox:focus + .toggle-bg,
  .checkbox:active + .toggle-bg {
    outline: 1px solid #2a71d1;
  }
</style>

<div class="toggle">
  <input type="checkbox" class="checkbox" {id} checked={value} />
  <div class="toggle-bg" />
</div>
