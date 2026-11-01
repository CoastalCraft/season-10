// Separate from the generated uNmINeD viewer so map exports do not replace it.
window.mountPlayerBases = function (viewer, config) {
    const panel = document.getElementById('player-bases');
    const toggle = document.getElementById('bases-toggle');
    const refresh = document.getElementById('bases-refresh');
    const status = document.getElementById('bases-status');
    const count = document.getElementById('bases-count');
    const list = document.getElementById('bases-list');
    let bases = [];
    const layer = new ol.layer.Vector({source: new ol.source.Vector(), zIndex: 20});
    layer.set('title', 'Player bases');
    viewer.olMap.addLayer(layer);
    try { toggle.checked = localStorage.getItem('coastal-season10-bases') !== 'hidden'; } catch {}
    layer.setVisible(toggle.checked);
    toggle.addEventListener('change', () => {
        layer.setVisible(toggle.checked);
        try { localStorage.setItem('coastal-season10-bases', toggle.checked ? 'shown' : 'hidden'); } catch {}
    });

    function parseRow(row) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
        const fields = Object.fromEntries(Object.entries(row).map(([key,value]) => [key.trim().toLowerCase(), value]));
        const name = [fields.name, fields.player, fields.text1, fields.text].map(value => String(value ?? '').trim()).find(Boolean);
        const rawX = String(fields.x ?? '').trim();
        const rawZ = String(fields.z ?? '').trim();
        if (!name || !rawX || !rawZ) return null;
        const x = Number(rawX), z = Number(rawZ);
        if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
        const color = /^#[0-9a-f]{6}$/i.test(String(fields.textcolor ?? '')) ? fields.textcolor : '#e06a3d';
        return {name, x, z, color};
    }

    function showBases(rows) {
        bases = rows.map(parseRow).filter(Boolean);
        const features = bases.map(base => {
            const feature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([base.x, base.z], viewer.dataProjection, viewer.viewProjection))
            });
            feature.set('base', base);
            feature.setStyle(new ol.style.Style({
                image: new ol.style.Circle({radius: 7, fill: new ol.style.Fill({color:base.color}), stroke: new ol.style.Stroke({color:'#fffef8',width:2})}),
                text: new ol.style.Text({text:base.name,offsetY:-20,font:'600 13px system-ui',fill:new ol.style.Fill({color:'#fffef8'}),stroke:new ol.style.Stroke({color:'#173b35',width:4})})
            }));
            return feature;
        });
        layer.getSource().clear();
        layer.getSource().addFeatures(features);
        count.textContent = String(bases.length);
        list.replaceChildren();
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
            });
            item.append(button);
            list.append(item);
        }
        const skipped = rows.length - bases.length;
        status.textContent = bases.length ? `${bases.length} player ${bases.length === 1 ? 'base' : 'bases'} loaded.${skipped ? ` ${skipped} incomplete ${skipped === 1 ? 'row' : 'rows'} skipped.` : ''}` : 'No player bases have been added yet.';
    }

    async function load() {
        if (!config?.sheetId || !config?.tab) {
            status.textContent = 'Player bases are not available yet.';
            refresh.disabled = true;
            return;
        }
        refresh.disabled = true;
        status.textContent = 'Loading player bases…';
        try {
            const response = await fetch(`https://opensheet.elk.sh/${encodeURIComponent(config.sheetId)}/${encodeURIComponent(config.tab)}`, {cache:'no-store',signal:AbortSignal.timeout(15000)});
            if (!response.ok) throw new Error('Unable to load player bases');
            const rows = await response.json();
            if (!Array.isArray(rows)) throw new Error('Invalid player base data');
            showBases(rows);
        } catch {
            status.textContent = bases.length ? 'Could not refresh. Showing previously loaded bases; try again.' : 'Could not load player bases. Please try Refresh.';
        } finally { refresh.disabled = false; }
    }
    refresh.addEventListener('click', load);
    load();
    return {layer, reload:load};
};
