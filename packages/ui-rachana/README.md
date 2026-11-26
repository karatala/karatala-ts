# Rachana UI variants

Existing controls with their source API and styles. These names remain distinct from KoMandir variants.

```ts
import UiTextInput from "@karatala/ui-rachana/UiTextInput.svelte";
import UiLoading from "@karatala/ui-rachana/UiLoading.svelte";
import UiFloatingToolbar from "@karatala/ui-rachana/UiFloatingToolbar.svelte";
```

The package has no runtime dependency except its Svelte 5 peer and no install/build hooks. The consumer compiles the Svelte source. UiTextInput reads existing text, field/control surface, accent and control-height CSS roles; UiLoading reads the accent-fill role; UiFloatingToolbar reads menu-surface and control-height roles. Supply the same theme roles in the application. No global theme or editor is installed by this package.

Source: `karatala/Komprohit`, revision `02e63ce9827dc1d267e1a13758901f83da87f72a`, files `src/frontend/ui/{UiTextInput,UiLoading,UiFloatingToolbar}.svelte`. All three source files are copied byte for byte. GPL v3 license text and original notices are retained.

- ✅ Extracted three independent controls with their existing props and styles.
- [ ] Deliver the shared commit and replace the application's local imports. Until then, this is an extracted implementation, not an application connection.
- [ ] Verify consumer resolution and behavior after connection. Existing application checks are not shared-package acceptance.

Other ready components follow in groups. UiButton/UiIcon need the application icon-catalog boundary; UiNumberStepper also needs narrow translation/Escape inputs. Those dependencies must be separated during transfer, without waiting for every UI variant to be compared.
