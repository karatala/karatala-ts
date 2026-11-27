<script lang="ts">
  import { onMount } from "svelte";
  import { installHoverInput } from "@karatala/dom-input";
  import { provideRachanaUiHost } from "@karatala/ui-rachana/host.ts";
  import { uiIcons } from "@karatala/ui-rachana/icons.ts";
  import "@karatala/ui-rachana/styles.css";
  import ModalDialog from "@karatala/ui-rachana/ModalDialog.svelte";
  import TimelineFlag from "@karatala/ui-rachana/TimelineFlag.svelte";
  import TimelineMarkerName from "@karatala/ui-rachana/TimelineMarkerName.svelte";
  import UiButton from "@karatala/ui-rachana/UiButton.svelte";
  import UiCheckboxButton from "@karatala/ui-rachana/UiCheckboxButton.svelte";
  import UiComboButton from "@karatala/ui-rachana/UiComboButton.svelte";
  import UiContextMenu from "@karatala/ui-rachana/UiContextMenu.svelte";
  import UiFavoriteButton from "@karatala/ui-rachana/UiFavoriteButton.svelte";
  import UiField from "@karatala/ui-rachana/UiField.svelte";
  import UiFloatingToolbar from "@karatala/ui-rachana/UiFloatingToolbar.svelte";
  import UiHelp from "@karatala/ui-rachana/UiHelp.svelte";
  import UiIcon from "@karatala/ui-rachana/UiIcon.svelte";
  import UiKeycap from "@karatala/ui-rachana/UiKeycap.svelte";
  import UiLoading from "@karatala/ui-rachana/UiLoading.svelte";
  import UiMiniPopup from "@karatala/ui-rachana/UiMiniPopup.svelte";
  import UiNumberStepper from "@karatala/ui-rachana/UiNumberStepper.svelte";
  import UiPickerFilter from "@karatala/ui-rachana/UiPickerFilter.svelte";
  import UiPositionSlider from "@karatala/ui-rachana/UiPositionSlider.svelte";
  import UiResizeHandle from "@karatala/ui-rachana/UiResizeHandle.svelte";
  import UiSegmentedButton from "@karatala/ui-rachana/UiSegmentedButton.svelte";
  import UiSegmentedControl from "@karatala/ui-rachana/UiSegmentedControl.svelte";
  import UiSegmentedGroup from "@karatala/ui-rachana/UiSegmentedGroup.svelte";
  import UiSelect from "@karatala/ui-rachana/UiSelect.svelte";
  import UiShortcutHint from "@karatala/ui-rachana/UiShortcutHint.svelte";
  import UiStepControl from "@karatala/ui-rachana/UiStepControl.svelte";
  import UiSwitch from "@karatala/ui-rachana/UiSwitch.svelte";
  import UiTextArea from "@karatala/ui-rachana/UiTextArea.svelte";
  import UiTextInput from "@karatala/ui-rachana/UiTextInput.svelte";
  import UiTooltip from "@karatala/ui-rachana/UiTooltip.svelte";
  import UiValueControl from "@karatala/ui-rachana/UiValueControl.svelte";
  import UiWheelButton from "@karatala/ui-rachana/UiWheelButton.svelte";
  import UiZoomSelect from "@karatala/ui-rachana/UiZoomSelect.svelte";
  let { name }: { name: string } = $props();
  let value = $state(75); let choice = $state("all"); let checked = $state(false); let disabled = $state(false); let text = $state("Sample"); let open = $state(false); let status = $state("Ready");
  const options = [{value:"all",label:"All"},{value:"files",label:"Files"},{value:"folders",label:"Folders"}];
  provideRachanaUiHost({translate:(label,values)=>label.replace(/\{([^}]+)\}/g,(match,key:string)=>String(values?.[key]??match))});
  onMount(()=>installHoverInput(window));
  function number(next:number){value=next;status="Value: "+next;}
  function select(next:string){choice=next;status="Selected: "+next;}
</script>
<div class="app-shell preview-host" data-appearance="rachana-dark">
  {#if ["UiButton","UiTextInput","UiTextArea","UiField","UiCheckboxButton","UiSwitch","UiNumberStepper","UiStepControl","UiValueControl","UiPositionSlider","UiSelect","UiComboButton","UiWheelButton","UiZoomSelect","UiSegmentedControl","UiSegmentedButton","UiSegmentedGroup","UiContextMenu","UiMiniPopup","ModalDialog"].includes(name)}<div class="preview-tools"><UiCheckboxButton compact label="Disabled" checked={disabled} onchange={next=>disabled=next} /></div>{/if}
  <div class="sample">
  {#if name === "UiButton"}
    <UiButton label="Default action" text="Default" {disabled} onclick={()=>status="Default clicked"} /><UiButton label="Save" text="Save" tone="primary" {disabled} onclick={()=>status="Saved"} /><UiButton label="Remove" text="Remove" tone="danger" {disabled} onclick={()=>status="Removed"} /><UiButton label="Close" variant="icon" tone="close" path={uiIcons.close} {disabled} />
  {:else if name === "UiTextInput"}<UiTextInput aria-label="Sample text" bind:value={text} {disabled} /><UiTextInput aria-label="Schedule time" type="time" value="22:30" {disabled} />
  {:else if name === "UiTextArea"}<UiTextArea aria-label="Sample multiline text" bind:value={text} rows={4} maxlength={1000} {disabled} />
  {:else if name === "UiField"}<UiField label="Name"><UiTextInput aria-label="Name" bind:value={text} {disabled} /></UiField>
  {:else if name === "UiLoading"}<UiLoading label="Loading sample" />
  {:else if name === "UiFloatingToolbar"}<div class="toolbar-stage"><UiFloatingToolbar label="Sample tools"><UiButton label="Add" variant="icon" text="+" /><UiButton label="Close tool" path={uiIcons.close} variant="icon" /></UiFloatingToolbar><p>Content area</p></div>
  {:else if name === "UiIcon"}<UiIcon path={uiIcons.star} label="Star" /><UiIcon path={uiIcons.close} label="Close" />
  {:else if name === "UiCheckboxButton"}<UiCheckboxButton label="Enabled option" {checked} {disabled} onchange={next=>checked=next} /><UiCheckboxButton compact label="Icon-only option" text="" {checked} {disabled} onchange={next=>checked=next} /><UiCheckboxButton compact label="Mixed state" checked={false} mixed {disabled} onchange={next=>checked=next} />
  {:else if name === "UiSwitch"}<UiSwitch label="Automatic mode" {checked} {disabled} onchange={next=>checked=next} />
  {:else if name === "UiFavoriteButton"}<div data-favorite-item class="favorite-stage"><UiFavoriteButton label="Saved favorite" active={true} onclick={()=>status="Favorite selected"} /><span>Hover to reveal another favorite:</span><UiFavoriteButton label="Toggle favorite" active={checked} onclick={()=>checked=!checked} /></div>
  {:else if name === "UiNumberStepper"}<UiNumberStepper label="Amount" {value} min={0} max={100} suffix="%" {disabled} onchange={number} />
  {:else if name === "UiStepControl"}<UiStepControl label="Step value" caption={String(value)} upLabel="Increase" downLabel="Decrease" {disabled} onup={()=>number(value+1)} ondown={()=>number(value-1)} /><UiStepControl label="Horizontal actions" orientation="horizontal" caption="Actions"><UiButton label="First action" text="First" {disabled} onclick={()=>status="First action"} /><UiButton label="Second action" text="Second" {disabled} onclick={()=>status="Second action"} /></UiStepControl>
  {:else if name === "UiValueControl"}<UiValueControl label="Volume" {value} max={100} resetValue={75} {disabled} onchange={number} /><UiValueControl label="Dial" {value} max={100} resetValue={75} dial {disabled} onchange={number} />
  {:else if name === "UiPositionSlider"}<UiPositionSlider label="Position" {value} max={100} resetValue={75} {disabled} onchange={number} /><UiPositionSlider label="Commit position on release" {value} max={100} step={0.1} {disabled} oncommit={next=>{number(next);status="Committed position: "+next;}} />
  {:else if name === "UiResizeHandle"}<div class="resize-stage" style:width={value+80+"px"}><span>Resizable panel</span><UiResizeHandle label="Resize panel" {value} minimum={0} maximum={150} onchange={number} onreset={()=>number(75)} /></div>
  {:else if name === "UiSelect"}<UiSelect label="File scope" bind:value={choice} {disabled} onchange={()=>status="Selected: "+choice}>{#each options as option}<option value={option.value}>{option.label}</option>{/each}<option disabled>Unavailable</option></UiSelect>
  {:else if name === "UiComboButton"}<UiComboButton label="Scope grid" value={choice} {options} {disabled} onchange={select} />
  {:else if name === "UiWheelButton"}<UiWheelButton label="Scope wheel" value={choice} {options} wheel {disabled} onchange={select} /><UiContextMenu label="Wheel command card" actionsFor={()=>[{label:"Command details",run:()=>status="Command details"}]}><UiWheelButton label="Wheel with command actions" value={choice} {options} wheel {disabled} actions={{closeLabel:"Close",helpLabel:"Help",favoriteLabel:"Favorite",favorite:checked,toggleFavorite:()=>{checked=!checked;},closeHelp:()=>{status="Help requested";}}} onchange={select} /></UiContextMenu>
  {:else if name === "UiZoomSelect"}<UiZoomSelect label="Zoom" {value} {disabled} onchange={number} />
  {:else if name === "UiSegmentedControl"}<UiSegmentedControl label="Scope" value={choice} {options} {disabled} labelMode="all" onchange={select} />
  {:else if name === "UiSegmentedButton"}<UiSegmentedGroup label="Pages">{#each options as option}<UiSegmentedButton label={option.label} text={option.label} active={choice===option.value} {disabled} onclick={()=>select(option.value)} />{/each}</UiSegmentedGroup>
  {:else if name === "UiSegmentedGroup"}<UiSegmentedGroup label="Actions"><UiButton label="Add" text="Add" {disabled} /><UiButton label="Remove" text="Remove" {disabled} /></UiSegmentedGroup>
  {:else if name === "UiPickerFilter"}<UiPickerFilter searchLabel="Search samples" bind:query={text} bind:favoritesOnly={checked}><UiSegmentedButton label="All" text="All" active /></UiPickerFilter>
  {:else if name === "UiHelp"}<UiHelp label="Example help" sections={[{title:"Help",text:"This example changes memory only. Escape closes pinned help."}]} />
  {:else if name === "UiTooltip"}<UiButton label="Tooltip example" text="Hover or focus" title="A real delayed tooltip" />
  {:else if name === "UiKeycap"}<UiKeycap text="Ctrl" /><UiKeycap text="Enter" tone="gray" /><UiKeycap text="Esc" tone="red" />
  {:else if name === "UiShortcutHint"}<UiShortcutHint value="Save: Ctrl+S / Meta+S" />
  {:else if name === "UiContextMenu"}<UiContextMenu label="Sample actions" actionsFor={()=>[{label:"Open",run:()=>status="Open requested"},{label:"Copy",run:()=>status="Copy requested"}]}><UiButton label="Context menu target" text="Right-click or Shift+F10" {disabled} /></UiContextMenu>
  {:else if name === "UiMiniPopup"}<UiMiniPopup bind:open label="Memory popup">{#snippet trigger(attributes)}<UiButton {...attributes} label="Open popup" text="Open popup" {disabled} />{/snippet}<UiTextInput aria-label="Popup text" bind:value={text} /><UiButton label="Close popup" text="Close" onclick={()=>open=false} /></UiMiniPopup>
  {:else if name === "ModalDialog"}<UiButton label="Open window" text="Open window" {disabled} onclick={()=>open=true} />{#if open}<ModalDialog title="Memory window" layoutKey="demo" onclose={()=>open=false}><UiTextInput aria-label="Window text" bind:value={text} /><UiHelp label="Window help" sections={[{title:"Help",text:"First Escape closes help, second closes this window."}]} />{#snippet actions()}<UiButton label="Save window" text="Save" onclick={()=>{status="Saved: "+text;open=false;}} /><UiButton label="Cancel window" text="Cancel" onclick={()=>open=false} />{/snippet}</ModalDialog>{/if}
  {:else if name === "TimelineFlag"}<TimelineFlag label="Section marker" text="Verse" color="#e08040" onclick={()=>status="Marker selected"} />
  {:else if name === "TimelineMarkerName"}<TimelineMarkerName label="Section" bind:value={text} />
  {/if}
  </div>
  <output class="demo-status" aria-label="Example result">{status}</output>
  <UiTooltip delayMs={350} />
</div>
<style>
  .preview-host { display:block; min-height:100vh; padding:18px; font:12px Tahoma,"Segoe UI",sans-serif; color:var(--ui-text); background:var(--ui-surface); }
  .preview-tools { margin-bottom:18px; }
  .sample { display:flex; align-items:center; flex-wrap:wrap; gap:10px; min-height:40px; }
  .sample :global(.ui-select),.sample :global(.ui-text-input) { max-width:260px; }
  .demo-status { display:block; block-size:3em; overflow:auto; margin-top:22px; color:var(--ui-text-muted); }
  .favorite-stage { display:flex; align-items:center; gap:10px; }
  .toolbar-stage { position:relative; width:100%; min-height:100px; }
  .resize-stage { display:flex; min-height:50px; justify-content:space-between; background:var(--ui-control-surface); padding:8px; }
</style>
