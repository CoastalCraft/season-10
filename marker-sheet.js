// Normalize spreadsheet strings without evaluating content or parsing whole labels as JSON.
window.CoastalMarkerSheet = (() => {
    function decode(value) {
        return String(value ?? '').replace(/\\u([\da-f]{4})|\\([nrt"\\])/gi, (match, unicode, escaped) =>
            unicode ? String.fromCharCode(parseInt(unicode, 16)) : ({n:'\n',r:'\r',t:'\t','"':'"','\\':'\\'}[escaped] ?? match));
    }
    function number(value, fallback) {
        if (value == null || String(value).trim() === '') return fallback;
        const result = Number(value);
        return Number.isFinite(result) ? result : fallback;
    }
    function anchor(value) {
        let parts = value;
        if (!Array.isArray(parts)) {
            const text = String(value ?? '').trim();
            try { parts = JSON.parse(text); } catch { parts = text.replace(/^\[|\]$/g, '').split(','); }
        }
        return Array.isArray(parts) && parts.length === 2 && parts.every(v => String(v).trim() !== '' && Number.isFinite(Number(v))) ? parts.map(Number) : [0.5, 0.5];
    }
    function color(value, fallback) {
        const text = String(value ?? '').trim();
        return text && CSS.supports('color', text) ? text : fallback;
    }
    function parse(row) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
        const f = Object.fromEntries(Object.entries(row).map(([key,value]) => [key.trim().toLowerCase(), value]));
        const x = number(f.x, null), z = number(f.z, null);
        if (x === null || z === null) return null;
        const first = [f.text1, f.name, f.player, f.text].find(value => String(value ?? '').trim());
        const lines = [decode(first), decode(f.text2), decode(f.text3)].filter(Boolean);
        let image;
        if (String(f.image ?? '').trim()) {
            try {
                const url = new URL(String(f.image).trim(), document.baseURI);
                if (['http:', 'https:'].includes(url.protocol)) image = url.href;
            } catch {}
        }
        if (!lines.length && !image) return null;
        return {
            entryid: String(f.entryid ?? ''), x, z,
            name: lines.filter(line => /[\p{L}\p{N}]/u.test(line)).join(' ') || `Marker ${f.entryid || `${x}, ${z}`}`,
            text: lines.join('\n'), image,
            imageAnchor: anchor(f.imageanchor), imageScale: Math.max(0, number(f.imagescale, 1)),
            minmapzoom: number(f.minmapzoom, -Infinity),
            textColor: color(f.textcolor, '#ffffff'), strokeColor: color(f.strokecolor, '#173b35'),
            offsetX: number(f.offsetx, 0), offsetY: number(f.offsety, 0),
            font: String(f.font ?? '').trim() || '600 13px system-ui'
        };
    }
    return {parse, decode};
})();
