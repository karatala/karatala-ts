# DOM input

## Contract

`releasePointerFocus(event: PointerEvent): void` takes the event's currentTarget. If it is an ambient HTMLElement, it schedules a frame on its owner window and blurs it only if it still has focus. It returns no disposer. Call it on the same pointer action used by the original consumer; it does not decide which application shortcuts should run.

`installHoverInput(ownerWindow: Window): () => void` saves the document root's `data-ui-hover` value and starts with `false`. Capture/passive pointerover, pointermove and pointerdown listeners enable hover for mouse and disable it for touch/pen. Other pointer types do not change the value. Window blur disables hover. Disposal removes all four listeners and restores the original attribute. Use one owner per document.

```ts
import { installHoverInput, releasePointerFocus } from "@karatala/dom-input";

const disposeHover = installHoverInput(window);
// Attach releasePointerFocus to the existing pointer-up action.
// Call disposeHover when this document's application owner is destroyed.
```

The consumer supplies DOM types and compiles the TypeScript source. No runtime package dependencies, native imports, storage, network calls or import-time actions exist. The ambient HTMLElement check is preserved; cross-realm focus is not a newly supported feature. The scheduled focus frame has no explicit cancellation. Overlapping hover owners are not supported.

## Source and license

Transferred without behavior changes from Rachana revision `fea615c72a42d074b35bfd68e3e0f6be934c8417`:

- `src/frontend/ui/pointer-focus.ts`
- `src/frontend/ui/hover-input.ts`
- `tests/frontend/ui/hover-input.test.ts` (only its implementation import changed)

Repository: https://github.com/karatala/Komprohit.git. The functions also match Shravanam revision `d49965fe0f74f2f7f5186ac876a17737c1789f62`, `src/pointer-input.ts`, apart from comments and whitespace. Source license text is retained in [LICENSE](LICENSE); the shared repository has the same GPL v3 text. Existing notices in copied files are preserved.

## Status

- ✅ Implementation and existing hover checks extracted.
- ✅ Source equality inspected; this is not a runtime test.
- [ ] Deliver the shared commit to upstream and connect Rachana/Shravanam.
- [ ] Install the locked test dependencies and run the transferred checks when authorized. `bun.lock` carries only the relevant resolutions from Rachana; package-manager validation is pending.
- [ ] Run the consumer focus and hover-style checks, followed by authorized browser/device checks. Do not infer those results from source equality.
