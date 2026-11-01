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

When regenerating, retain player-bases.config.js, player-bases.js, player-bases.css, marker-sheet.js,
and the panel, script/style imports, and mountPlayerBases call in index.html.

### Season 9 spreadsheet compatibility

text1/text2/text3 are decoded (including literal Unicode escapes for Font Awesome)
and joined with newlines. font, textColor, strokeColor (2px outline), offsetX and
offsetY style the text. image, imageAnchor ([x,y] or x,y), and imageScale style an
optional image. entryid is retained as marker metadata. Blank numeric style
fields use defaults; incomplete or invalid coordinate rows are skipped.

minmapzoom is the minimum **OpenLayers view zoom**, matching Season 9's units,
not the -3..3 tile-folder numbers. Each marker is visible strictly above its own
threshold. Sidebar selection zooms in when needed, up to the map's maximum zoom.
Unlike Season 9, the last row no longer controls the entire layer's visibility.
Font Awesome 6.2.1 is loaded for the existing Free-font icon codes. Image URLs
may be relative to the map or use HTTP(S). Rows can be text-only or image-only.
