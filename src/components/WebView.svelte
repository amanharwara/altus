<script lang="ts">
  export let partition;
</script>

<webview
  id={`webview-${partition}`}
  src="https://web.whatsapp.com"
  preload="../preload.js"
  {partition}
  useragent={window.navigator.userAgent.replace(/(Altus4|Electron)([^\s]+\s)/g, '')} />
