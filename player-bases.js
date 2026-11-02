// Separate from the generated uNmINeD viewer so map exports do not replace it.
window.mountPlayerBases = function (viewer, config) {
    const panel = document.getElementById('player-bases');
    const collapse = document.getElementById('bases-collapse');
    const content = document.getElementById('bases-content');
    const chevron = document.getElementById('bases-chevron');
    function setCollapsed(collapsed) {
        content.hidden = collapsed;
        panel.classList.toggle('is-collapsed', collapsed);
        collapse.setAttribute('aria-expanded', String(!collapsed));
        chevron.textContent = collapsed ? '+' : '−';
    }
    try { setCollapsed(localStorage.getItem('coastal-season10-panel') === 'collapsed'); } catch {}
    collapse.addEventListener('click', () => {
        const collapsed = !content.hidden;
        setCollapsed(collapsed);
        try { localStorage.setItem('coastal-season10-panel', collapsed ? 'collapsed' : 'expanded'); } catch {}
    });
    const toggle = document.getElementById('bases-toggle');
    const refresh = document.getElementById('bases-refresh');
    const status = document.getElementById('bases-status');
    const count = document.getElementById('bases-count');
    const list = document.getElementById('bases-list');
    let bases = [];
    const layer = new ol.layer.Vector({source: new ol.source.Vector(), zIndex: 20});
    const radiusLayer = new ol.layer.Vector({source:new ol.source.Vector(),zIndex:8});
    radiusLayer.set('title','Build radii');
    viewer.olMap.addLayer(radiusLayer);
    const selectedRadii = new Set();
    const radiusKey = base => base.entryid || `${base.x},${base.z}:${base.name}`;
    const supportsRadius = base => ['Player Bases','Community'].includes(base.category);
    layer.set('title', 'Markers');
    viewer.olMap.addLayer(layer);
    try { toggle.checked = localStorage.getItem('coastal-season10-bases') !== 'hidden'; } catch {}
    layer.setVisible(toggle.checked);
    radiusLayer.setVisible(toggle.checked);
    toggle.addEventListener('change', () => {
        layer.setVisible(toggle.checked);
        radiusLayer.setVisible(toggle.checked);
        try { localStorage.setItem('coastal-season10-bases', toggle.checked ? 'shown' : 'hidden'); } catch {}
    });

    function showBases(rows) {
        const nextBases = rows.map(CoastalMarkerSheet.parse).filter(Boolean);
        const features = nextBases.map(base => {
            const feature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([base.x, base.z], viewer.dataProjection, viewer.viewProjection))
            });
            feature.set('base', base);
            feature.set('entryid', base.entryid);
            const style = new ol.style.Style({
                image: base.image ? new ol.style.Icon({src:base.image,anchor:base.imageAnchor,scale:base.imageScale}) : undefined,
                text: base.text ? new ol.style.Text({text:base.text,font:base.font,offsetX:base.offsetX,offsetY:base.offsetY,fill:new ol.style.Fill({color:base.textColor}),stroke:new ol.style.Stroke({color:base.strokeColor,width:2})}) : undefined
            });
            // Match OpenLayers minZoom semantics, independently for each row.
            feature.setStyle(() => viewer.olMap.getView().getZoom() > base.minmapzoom ? style : undefined);
            return feature;
        });
        bases = nextBases;
        layer.getSource().clear();
        layer.getSource().addFeatures(features);
        radiusLayer.getSource().clear();
        const validKeys = new Set(bases.filter(base => supportsRadius(base) && base.radius > 0).map(radiusKey));
        for (const key of selectedRadii) if (!validKeys.has(key)) selectedRadii.delete(key);
        count.textContent = String(bases.length);
        list.replaceChildren();
        const groups = new Map();
        for (const category of ['Player Bases', 'Shops', 'Portals', 'Community']) {
            const group = document.createElement('details');
            group.className = 'marker-group';
            group.open = true;
            const summary = document.createElement('summary');
            const members = bases.filter(base => base.category === category);
            summary.textContent = `${category} (${members.length})`;
            const items = document.createElement('ul');
            items.className = 'bases-list';
            items.setAttribute('aria-label', category);
            group.append(summary, items);
            if (!members.length) {
                const empty = document.createElement('p');
                empty.className = 'bases-help';
                empty.textContent = 'No markers in this group yet.';
                group.append(empty);
            }
            list.append(group);
            groups.set(category, items);
        }
        for (const base of bases) {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            const label = document.createElement('span');
            label.textContent = base.name;
            const coords = document.createElement('small');
            coords.textContent = `${base.x}, ${base.z}`;
            button.append(label, coords);
            button.addEventListener('click', () => {
                toggle.checked = true;
                toggle.dispatchEvent(new Event('change'));
                viewer.center([base.x, base.z]);
                const view = viewer.olMap.getView();
                if (view.getZoom() <= base.minmapzoom) view.setZoom(Math.min(view.getMaxZoom(), Math.floor(base.minmapzoom) + 1));
            });
            item.append(button);
            if (supportsRadius(base) && base.radius > 0) {
                const radiusLabel = document.createElement('label');
                radiusLabel.className = 'base-radius';
                const radiusToggle = document.createElement('input');
                radiusToggle.type = 'checkbox';
                radiusToggle.checked = selectedRadii.has(radiusKey(base));
                radiusToggle.setAttribute('aria-label', `Show ${base.name} radius`);
                radiusLabel.append(radiusToggle, document.createTextNode(`Show ${base.radius}-block radius`));
                item.append(radiusLabel);
                if (base.radius > 0) {
                    const center = ol.proj.transform([base.x,base.z],viewer.dataProjection,viewer.viewProjection);
                    const edge = ol.proj.transform([base.x+base.radius,base.z],viewer.dataProjection,viewer.viewProjection);
                    const circle = new ol.Feature({geometry:new ol.geom.Circle(center,Math.hypot(edge[0]-center[0],edge[1]-center[1]))});
                    circle.set('base',base);
                    const fillColor = ol.color.asArray(base.textColor).slice();
                    fillColor[3] = 0.06;
                    circle.setStyle([
                        new ol.style.Style({stroke:new ol.style.Stroke({color:'rgba(255,255,255,0.65)',width:5})}),
                        new ol.style.Style({stroke:new ol.style.Stroke({color:base.textColor,width:3}),fill:new ol.style.Fill({color:fillColor})})
                    ]);
                    if (radiusToggle.checked) radiusLayer.getSource().addFeature(circle);
                    radiusToggle.addEventListener('change',()=>{
                        if (radiusToggle.checked) {
                            selectedRadii.add(radiusKey(base));
                            radiusLayer.getSource().addFeature(circle);
                            toggle.checked = true;
                            toggle.dispatchEvent(new Event('change'));
                        } else {
                            selectedRadii.delete(radiusKey(base));
                            radiusLayer.getSource().removeFeature(circle);
                        }
                    });
                }
            }
            groups.get(base.category).append(item);
        }
        const skipped = rows.length - bases.length;
        status.textContent = bases.length ? `${bases.length} ${bases.length === 1 ? 'marker' : 'markers'} loaded.${skipped ? ` ${skipped} incomplete ${skipped === 1 ? 'row' : 'rows'} skipped.` : ''}` : 'No markers have been added yet.';
        // Canvas labels need to redraw once web fonts, including Font Awesome, arrive.
        if (document.fonts) {
            Promise.allSettled([...new Set(bases.filter(base => base.text).map(base => base.font))].map(font => Promise.resolve().then(() => document.fonts.load(font))))
                .then(() => layer.changed());
        }
    }

    async function load() {
        if (!config?.sheetId || !config?.tab) {
            status.textContent = 'Markers are not available yet.';
            refresh.disabled = true;
            return;
        }
        refresh.disabled = true;
        status.textContent = 'Loading markers…';
        try {
            const response = await fetch(`https://opensheet.elk.sh/${encodeURIComponent(config.sheetId)}/${encodeURIComponent(config.tab)}`, {cache:'no-store',signal:AbortSignal.timeout(15000)});
            if (!response.ok) throw new Error('Unable to load player bases');
            const rows = await response.json();
            if (!Array.isArray(rows)) throw new Error('Invalid player base data');
            showBases(rows);
        } catch {
            status.textContent = bases.length ? 'Could not refresh. Showing previously loaded markers; try again.' : 'Could not load markers. Please try Refresh.';
        } finally { refresh.disabled = false; }
    }
    refresh.addEventListener('click', load);
    load();
    return {layer, radiusLayer, reload:load};
};
