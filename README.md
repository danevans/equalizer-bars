# Equalizer Bars

This creates a custom element `<equalizer-bars>` which renders a set of vertical bars that randomly animate up and down like the icon that various audio playing apps display. Those apps usually display a looping animation. This web component randomizes the values that are being changed and the speed at which they change.

Clicking the bars start or stop them animating.

Bars can be dynamically added or removed by changing the value of the `count` attribute.

The color of the bars can be set via the CSS variable `--bar-color`.

Internally each equalizer bars web component manages its own animation state and cleans up any callbacks when it is removed from the DOM.
