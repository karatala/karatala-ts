<script lang="ts">
  import { onMount } from "svelte";
  import { provideKomandirUiHost } from "@karatala/ui-komandir/host.ts";
  import { provideIconPickerHost } from "@karatala/ui-komandir/icon-picker-host.ts";
  import { createMemoryIconPickerHost } from "./icon-picker-memory";
  import palettes from "./palettes.json";
  import Button from "@karatala/ui-komandir/Button.svelte";
  import CheckButton from "@karatala/ui-komandir/CheckButton.svelte";
  import CheckMark from "@karatala/ui-komandir/CheckMark.svelte";
  import ColorPicker from "@karatala/ui-komandir/ColorPicker.svelte";
  import ColumnHeader from "@karatala/ui-komandir/ColumnHeader.svelte";
  import ConfirmPopover from "@karatala/ui-komandir/ConfirmPopover.svelte";
  import ContextAction from "@karatala/ui-komandir/ContextAction.svelte";
  import ContextMenu from "@karatala/ui-komandir/ContextMenu.svelte";
  import ContextSubmenu from "@karatala/ui-komandir/ContextSubmenu.svelte";
  import DataTable from "@karatala/ui-komandir/DataTable.svelte";
  import Dialog from "@karatala/ui-komandir/Dialog.svelte";
  import Dropdown from "@karatala/ui-komandir/Dropdown.svelte";
  import FileDate from "@karatala/ui-komandir/FileDate.svelte";
  import HelpButton from "@karatala/ui-komandir/HelpButton.svelte";
  import Icon from "@karatala/ui-komandir/Icon.svelte";
  import IconButton from "@karatala/ui-komandir/IconButton.svelte";
  import IconPicker from "@karatala/ui-komandir/IconPicker.svelte";
  import Keycap from "@karatala/ui-komandir/Keycap.svelte";
  import MessageBar from "@karatala/ui-komandir/MessageBar.svelte";
  import MiniPopup from "@karatala/ui-komandir/MiniPopup.svelte";
  import Notification from "@karatala/ui-komandir/Notification.svelte";
  import PathLabel from "@karatala/ui-komandir/PathLabel.svelte";
  import Popover from "@karatala/ui-komandir/Popover.svelte";
  import Portal from "@karatala/ui-komandir/Portal.svelte";
  import RowSweepHandle from "@karatala/ui-komandir/RowSweepHandle.svelte";
  import SegmentedControl from "@karatala/ui-komandir/SegmentedControl.svelte";
  import ShortcutHint from "@karatala/ui-komandir/ShortcutHint.svelte";
  import SplitButton from "@karatala/ui-komandir/SplitButton.svelte";
  import SvgIcon from "@karatala/ui-komandir/SvgIcon.svelte";
  import Switch from "@karatala/ui-komandir/Switch.svelte";
  import TableRow from "@karatala/ui-komandir/TableRow.svelte";
  import TabSurface from "@karatala/ui-komandir/TabSurface.svelte";
  import Tooltip from "@karatala/ui-komandir/Tooltip.svelte";
  import WindowDialog from "@karatala/ui-komandir/WindowDialog.svelte";
  import WindowTitleBar from "@karatala/ui-komandir/WindowTitleBar.svelte";
  let { name }: { name: string } = $props();
  let value=$state("all"); let color=$state("#4e7aff"); let checked=$state(false); let disabled=$state(false); let open=$state(false); let status=$state("Ready"); let width=$state(180); let ascending=$state(true); let trigger=$state<HTMLElement|null>(null);
  let bindings=$state({"sample.save":[{ctrl:true,key:"s"}]});
  let iconValue=$state<string>();
  const defaults={"sample.save":[{ctrl:true,key:"s"}]};
  const options=[{value:"all",label:"All"},{value:"files",label:"Files"},{value:"folders",label:"Folders"},{value:"unavailable",label:"Unavailable",disabled:true}];
  const date={parts:[{text:"2026-11-26",muted:false},{text:" 12:30",muted:true}],visible:"2026-11-26 12:30",full:"2026-11-26 12:30:00"};
  const iconPickerHost = createMemoryIconPickerHost();
  provideKomandirUiHost(iconPickerHost.icons);
  provideIconPickerHost(iconPickerHost.picker);
  onMount(()=>{for(const [key,colorValue]of Object.entries(palettes.commander))document.documentElement.style.setProperty(key,colorValue);});
  function launch(event:MouseEvent){trigger=event.currentTarget as HTMLElement;open=true;}
  function close(){open=false;}
  function focusReturn(){trigger?.focus();}
  function select(next:string){value=next;status="Selected: "+next;}
</script>
<div class="preview-host">
  {#if ["Button","IconButton","IconPicker","CheckButton","Switch","Dropdown","SegmentedControl","TabSurface","SplitButton","Tooltip","Notification","WindowDialog","MiniPopup","ConfirmPopover","ContextMenu","ContextSubmenu","ContextAction","Portal","Dialog","Popover"].includes(name)}<div class="preview-tools"><CheckButton label="Disabled" checked={disabled} onChange={next=>disabled=next} /></div>{/if}
  <div class="sample">
  {#if name==="Button"}<Button {disabled} onclick={()=>status="Default clicked"}>Default</Button><Button tone="primary" {disabled} onclick={()=>status="Saved"}>Save</Button><Button tone="danger" {disabled}>Remove</Button>
  {:else if name==="IconButton"}<IconButton label="Close example" {disabled} onclick={()=>status="Close requested"}><Icon name="sharedControls.remove" /></IconButton>
  {:else if name==="CheckButton"}<CheckButton label="Include folders" {checked} {disabled} onChange={next=>checked=next} />
  {:else if name==="CheckMark"}<CheckMark checked={false} /><CheckMark checked /><CheckMark checked size={12} />
  {:else if name==="Switch"}<Switch label="Automatic mode" {checked} {disabled} onChange={next=>checked=next} />
  {:else if name==="ColorPicker"}<ColorPicker label="Item color" value={color} onChange={next=>{color=next;status="Committed color: "+next;}} />
  {:else if name==="Dropdown"}<div style="width:240px;max-width:100%"><Dropdown label="File scope" {value} {options} {disabled} onChange={select} /></div>
  {:else if name==="SegmentedControl"}<SegmentedControl label="File scope" {value} {options} {disabled} onChange={select} />
  {:else if name==="TabSurface"}<TabSurface selected={checked} role="tab" aria-selected={checked}><Button {disabled} onclick={()=>checked=!checked}>Workspace tab</Button></TabSurface>
  {:else if name==="SplitButton"}<SplitButton label="Save" menuLabel="More save actions" expanded={open} {disabled} onAction={()=>status="Saved"} onMenu={element=>{trigger=element;open=!open;}}>Save</SplitButton>{#if open}<ContextMenu label="Save actions" {trigger} onClose={close} onFocusReturn={focusReturn}><Button role="menuitem" onclick={()=>{status="Save as requested";close();}}>Save as</Button></ContextMenu>{/if}
  {:else if name==="HelpButton"}<HelpButton message="A real pinned help tooltip. First Escape closes help." />
  {:else if name==="Tooltip"}<Button title="Save the memory sample" data-shortcut-command="sample.save" {disabled} onclick={()=>status="Save clicked"}>Hover or focus to assign shortcut</Button>
  {:else if name==="Keycap"}<Keycap text="Ctrl" /><Keycap text="Enter" tone="gray" /><Keycap text="Esc" tone="red" />
  {:else if name==="ShortcutHint"}<ShortcutHint bindings={[{ctrl:true,key:"s"},{meta:true,key:"s"}]} />
  {:else if name==="Icon"}<Icon name="sharedControls.check" /><Icon name="sharedControls.remove" /><Icon name="sharedControls.dropdown" />
  {:else if name==="IconPicker"}<IconPicker value={iconValue} fallbackName="fileEntries.file" {disabled} onChange={next=>{iconValue=next;status="Assigned icon: "+(next??"Inherit");}} />
  {:else if name==="SvgIcon"}<div style="width:36px;height:36px"><SvgIcon url="/sample-icon.svg" viewBox="0 0 24 24" onError={()=>status="Could not load the sample icon. Reload this example."} /></div>
  {:else if name==="MessageBar"}<MessageBar role="status" message="The memory sample is ready." />
  {:else if name==="PathLabel"}<div style="width:240px;max-width:100%"><PathLabel value="/Documents/Projects/Archive/Long folder/recording.wav" /></div>
  {:else if name==="FileDate"}<FileDate {date} />
  {:else if name==="RowSweepHandle"}<RowSweepHandle label="Mark sample row" pressed={checked} onclick={()=>checked=!checked} />
  {:else if name==="DataTable"||name==="TableRow"||name==="ColumnHeader"}<DataTable role="table" aria-label="Sample records" style={"--table-columns:"+width+"px 70px;--table-min-width:220px"}><div class="ui-table-header" role="row"><ColumnHeader label="Name" sorted={ascending?"ascending":"descending"} {width} onSort={()=>ascending=!ascending} onResize={next=>width=next} onReset={()=>width=180} /><span role="columnheader">Size</span></div>{#each [{name:"Alpha.txt",size:10},{name:"Beta.txt",size:20}] as row,idx}<TableRow active={idx===1} selected={idx===0}><span role="cell">{row.name}</span><span role="cell">{row.size}</span></TableRow>{/each}</DataTable>
  {:else if name==="Notification"}<Button {disabled} onclick={launch}>Show notification</Button>{#if open}<Notification text="The sample action is complete." role="status" action={{label:"Undo",run:()=>status="Undo requested"}} onClose={close} />{/if}
  {:else if name==="WindowTitleBar"}<div class="title-stage"><WindowTitleBar>{#snippet heading()}<strong>Memory window</strong>{/snippet}<IconButton label="Close title example" onclick={()=>status="Close requested"}><Icon name="sharedControls.remove" /></IconButton></WindowTitleBar></div>
  {:else if name==="WindowDialog"}<Button {disabled} onclick={launch}>Open window</Button>{#if open}<WindowDialog title="Memory window" initialSize={{width:480,height:300}} onClose={close} onFocusReturn={focusReturn}><div class="demo-window-content"><label>Name<input aria-label="Window name" value="Sample" /></label><ColorPicker label="Window color" value={color} onChange={next=>color=next} /><HelpButton message="Help inside the window. Escape closes help first." /><div class="window-actions"><Button onclick={()=>{status="Saved";close();}}>Save</Button><Button onclick={close}>Cancel</Button></div></div></WindowDialog>{/if}
  {:else if name==="MiniPopup"}<Button {disabled} onclick={launch}>Open popup</Button>{#if open}<MiniPopup title="Memory popup" {trigger} onClose={close} onFocusReturn={focusReturn}><input aria-label="Popup name" value="Sample" /><Button onclick={close}>Close</Button></MiniPopup>{/if}
  {:else if name==="ConfirmPopover"}<Button {disabled} onclick={launch}>Confirm action</Button>{#if open}<ConfirmPopover label="Confirm sample" message="Apply this memory-only action?" confirmLabel="Apply" cancelLabel="Cancel" left={20} top={75} {trigger} pending={false} error="" onConfirm={()=>{status="Applied";close();}} onClose={close} onFocusReturn={focusReturn} />{/if}
  {:else if name==="ContextMenu"||name==="ContextSubmenu"||name==="ContextAction"}<Button {disabled} onclick={launch}>Open actions</Button>{#if open}<ContextMenu label="Sample actions" {trigger} onClose={close} onFocusReturn={focusReturn}><Button role="menuitem" onclick={()=>{status="Open requested";close();}}>Open</Button><ContextAction label="Copy sample" onclick={()=>{status="Copy requested";close();}}><Icon name="sharedControls.check" /></ContextAction><ContextSubmenu label="More"><Button role="menuitem" onclick={()=>{status="Details requested";close();}}>Details</Button></ContextSubmenu></ContextMenu>{/if}
  {:else if name==="Portal"}<Button {disabled} onclick={launch}>Show portalled content</Button>{#if open}<Portal><div class="demo-overlay"><p>Rendered through Portal into this document.</p><Button onclick={close}>Close portal</Button></div></Portal>{/if}
  {:else if name==="Dialog"||name==="Popover"}<Button {disabled} onclick={launch}>Open {name}</Button>{#if open}<Portal>{#if name==="Dialog"}<Dialog class="demo-overlay" aria-label="Memory dialog" onClose={close} onFocusReturn={focusReturn}><p>Modal focus and Escape owner</p><input aria-label="Dialog text" value="Sample" /><Button onclick={close}>Close dialog</Button></Dialog>{:else}<Popover class="demo-overlay" aria-label="Memory popover" onClose={close} onFocusReturn={focusReturn}><p>Nonmodal popover</p><Button onclick={close}>Close popover</Button></Popover>{/if}</Portal>{/if}
  {/if}
  </div>
  <output class="demo-status" aria-label="Example result">{status}</output>
  <Tooltip {bindings} {defaults} commands={["sample.save"]} ready={true} validate={()=>""} onAssign={async(command,shortcuts)=>{bindings={...bindings,[command]:shortcuts};status="Shortcut assigned";}} />
</div>
<style>
  .preview-host { min-height:100vh; padding:18px; font:var(--ui-font-normal) var(--ui-font-family); color:var(--theme-workbench-foreground); background:var(--theme-workbench-background); }
  .preview-tools { margin-bottom:18px; }
  .sample { display:flex; flex-wrap:wrap; align-items:center; gap:10px; min-height:40px; }
  .demo-status { display:block; block-size:3em; margin-top:22px; color:var(--theme-workbench-muted); overflow:auto; }
  .title-stage { width:100%; }
  .demo-window-content { display:flex; flex-direction:column; align-items:start; height:100%; padding:12px; gap:12px; }
  .window-actions { display:flex; justify-content:end; gap:8px; align-self:stretch; margin-top:auto; }
  :global(.demo-overlay) { position:fixed; z-index:2000; inset:40px 20px auto; padding:18px; background:var(--theme-workbench-raised); color:var(--theme-workbench-foreground); border-radius:6px; display:flex; flex-direction:column; align-items:start; gap:12px; }
</style>
