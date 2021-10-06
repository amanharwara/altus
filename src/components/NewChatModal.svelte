<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Modal from "./common/Modal.svelte";

  export let visible = false;
  let countryCode = "";
  let countryCodeInput: HTMLInputElement;
  let phoneNumber = "";
  let phoneNumberInput: HTMLInputElement;

  $: {
    if (countryCodeInput && visible) {
      countryCodeInput.focus();
    }
  }

  $: formattedNumber = `${
    countryCode.includes("+")
      ? countryCode.substring(countryCode.indexOf("+") + 1, countryCode.length)
      : countryCode
  }${phoneNumber}`;

  const dispatchEvent = createEventDispatcher();
  const startNewChat = () => {
    if (!countryCode || countryCode.length === 0) {
      countryCodeInput.focus();
    } else if (!phoneNumber || phoneNumber.length === 0) {
      phoneNumberInput.focus();
    } else {
      countryCode = "";
      phoneNumber = "";
      dispatchEvent("start-new-chat", formattedNumber);
    }
  };

  const handleEnter = ({ key }: KeyboardEvent) => {
    if (key === "Enter") {
      startNewChat();
    }
  };
</script>

<Modal modalTitle="New Chat" {visible}>
  <form on:keydown={handleEnter}>
    <div class="flex items-bottom">
      <div class="flex flex-col mr-4 min-content">
        <label for="country-code">Country Code:</label>
        <input
          type="text"
          id="country-code"
          bind:value={countryCode}
          bind:this={countryCodeInput}
        />
      </div>
      <div class="flex flex-col">
        <label for="number">Phone Number:</label>
        <input
          type="text"
          id="number"
          bind:value={phoneNumber}
          bind:this={phoneNumberInput}
        />
      </div>
    </div>
    <div class="controls">
      <button type="button" class="submit" on:click={startNewChat}
        >Start Chat</button
      >
    </div>
  </form>
</Modal>

<style lang="scss">
  .flex {
    display: flex;
  }
  .items-bottom {
    align-items: flex-end;
  }
  .flex-col {
    flex-flow: column;
  }
  .mr-4 {
    margin-right: 1rem;
  }
  label {
    margin-bottom: 0.5rem;
  }
  input {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    font-size: 1rem;
    font-weight: 400;
    padding: 0.4rem 0.5rem;
    border: 0;
  }
  .min-content {
    width: min-content;
  }
  #country-code {
    min-width: 7ch;
    max-width: 7ch;
  }
  .controls {
    margin-top: 1rem;
  }
</style>
