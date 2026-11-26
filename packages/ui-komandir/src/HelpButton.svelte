<script lang="ts">
  import { useKomandirUiHost } from "./host";
  const { message: localize } = useKomandirUiHost();
  import IconButton from "./IconButton.svelte";
  import Icon from "./Icon.svelte";

  let { message }: { message: string } = $props();
</script>

<IconButton ghost class="ui-help-button" label={localize("Help")} data-tooltip={message} data-tooltip-toggle data-hold-context>
  <Icon name="toolbar.properties" size={15} />
</IconButton>
