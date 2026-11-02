window.mountSpawnTown = function (viewer) {
    const center = ol.proj.transform([0, 0], viewer.dataProjection, viewer.viewProjection);
    const edge = ol.proj.transform([500, 0], viewer.dataProjection, viewer.viewProjection);
    const radius = Math.hypot(edge[0] - center[0], edge[1] - center[1]);
    const boundary = new ol.Feature({geometry:new ol.geom.Circle(center, radius)});
    boundary.setStyle(new ol.style.Style({
        stroke:new ol.style.Stroke({color:'#f2c45a',width:3,lineDash:[10,6]}),
        fill:new ol.style.Fill({color:'rgba(242,196,90,0.045)'})
    }));
    const label = new ol.Feature({geometry:new ol.geom.Point(ol.proj.transform([0,-500],viewer.dataProjection,viewer.viewProjection))});
    label.setStyle(new ol.style.Style({text:new ol.style.Text({
        text:'Spawn Town · 500-block radius',font:'600 14px system-ui',offsetY:-14,
        fill:new ol.style.Fill({color:'#f2c45a'}),stroke:new ol.style.Stroke({color:'#173b35',width:4})
    })}));
    const layer = new ol.layer.Vector({source:new ol.source.Vector({features:[boundary,label]}),zIndex:10});
    layer.set('title','Spawn Town');
    viewer.olMap.addLayer(layer);
    const toggle = document.getElementById('spawn-town-toggle');
    try { toggle.checked = localStorage.getItem('coastal-season10-town') !== 'hidden'; } catch {}
    layer.setVisible(toggle.checked);
    toggle.addEventListener('change',()=>{
        layer.setVisible(toggle.checked);
        try { localStorage.setItem('coastal-season10-town',toggle.checked?'shown':'hidden'); } catch {}
    });
    return layer;
};
