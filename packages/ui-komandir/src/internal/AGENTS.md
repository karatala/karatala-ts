# Private rendering adapters

## Purpose

- Share the existing KoMandir picker and control behavior without importing the document-wide controls stylesheet into another variant.

## Ownership

- Button and SegmentedControl supply the native element and keyboard behavior used by their public wrappers and ColorPickerCore.
- ColorPickerCore owns the original KoMandir color draft, canvas, RGB/OKLCH controls and Apply/Cancel. Its required trigger/popup snippets adapt the host shell; it is not a standalone catalog control.

## Local Contracts

- Import no application source or controls.css here. Public wrappers retain their existing style entry; picker styles are confined to the picker form.
- Keep one picker state implementation. Preserve model selection across openings, reset the draft from the committed value, and publish only on Apply.
- Pointer opening starts at the form without scrolling to Hex. Keyboard opening can focus Hex. Keep the popup title/actions outside the one body scroller.

## Verification

- Check both public picker wrappers, cancellation, invalid Hex, RGB/OKLCH keys, nested Escape and pointer/keyboard focus through their live examples.
