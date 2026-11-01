# CoastalCraft Season 10 Map

uNmINeD map export for CoastalCraft Season 10: The Mighty Mesa Reborn.

Intended public address: https://coastalcraft.github.io/season-10/

## Publishing

Publish this folder as the root of the CoastalCraft/season-10 repository.
In repository Settings > Pages, select Deploy from a branch, then main and / (root).
The .nojekyll file serves this generated export without Jekyll processing.

## Updating the map

Export the updated Season 10 map into this folder, retaining .git, .nojekyll,
and this README. Review changes, commit, and push to main.
Keep relative asset paths so the viewer works under /season-10/.

The Season 9 repository is separate and does not need to be changed.

Keep the CoastalCraft home navigation when refreshing the generated index.html.

## Player bases layer

The separate OpenLayers vector layer reads the public Overworld tab of:
https://docs.google.com/spreadsheets/d/11xN9e9hXOsj0oBlrVYHxPFEJJoWAzfBPRR-5bOk4Hy8/edit

Source settings live in player-bases.config.js. The sheet's current text1, x, z
columns are supported; Name/Player/Text can also supply the marker label. Rows
need a nonblank label and numeric X/Z coordinates. Optional textColor sets the pin
color. Markers use labeled circles; Font Awesome glyphs and image fields are not
required. Select a list entry to center the map, toggle visibility, or press
Refresh to reload the sheet (the public feed may briefly cache changes).

When regenerating, retain player-bases.config.js, player-bases.js, player-bases.css,
and the panel, script/style imports, and mountPlayerBases call in index.html.
