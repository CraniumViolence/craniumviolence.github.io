(function(global) {
    'use strict';
    var SVG_NS = 'http:
    var SIZE = 125; 
    var RADIUS = SIZE / 2; 
    var CENTRE = SIZE / 2; 
    var DOT_RADIUS = 4; 
    var CENTRE_DOT_RADIUS = 3.5; 
    var CIRCLE_COLOUR = '#665C38';
    var CENTRE_DOT_COLOUR = '#8080FF';
    var SHADOW_DX = 2;
    var SHADOW_DY = 2;
    var SHADOW_BLUR = 0.5;
    var SHADOW_COLOUR = '#000000';
    var SHADOW_OPACITY = 0.75;
    var HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
    var idCounter = 0; 
	
    function svgEl(name, attrs) {
        var el = document.createElementNS(SVG_NS, name);
        for (var key in attrs) {
            if (Object.prototype.hasOwnProperty.call(attrs, key)) {
                el.setAttribute(key, attrs[key]);
            }
        }
        return el;
    }
	
    function round(n) {
        return Math.round(n * 100) / 100;
    }
    
    function parseDots(raw) {
        var parts = raw.split(',').map(function(p) {
            return p.trim();
        });
        var dots = [];
        if (parts.length === 1 && parts[0] === '') return dots;
        if (parts.length % 3 !== 0) {
            console.warn('atlas: data-dots should contain groups of 3 values; ignoring incomplete trailing group.', raw);
        }
        for (var i = 0; i + 2 < parts.length; i += 3) {
            var degrees = parts[i] === '' ? NaN : Number(parts[i]);
            var distance = parts[i + 1] === '' ? NaN : Number(parts[i + 1]);
            var colour = parts[i + 2];
            var valid =
                isFinite(degrees) && degrees >= 0 && degrees <= 360 &&
                isFinite(distance) && distance >= 0 && distance <= 100 &&
                HEX_RE.test(colour);
            if (!valid) {
                console.warn('atlas: skipping invalid dot "' + parts.slice(i, i + 3).join(',') + '"');
                continue;
            }
            dots.push({
                degrees: degrees,
                distance: distance,
                colour: colour
            });
        }
        return dots;
    }
	
    function buildAtlas(dots, rawDots) {
        var svg = svgEl('svg', {
            xmlns: SVG_NS,
            width: SIZE,
            height: SIZE,
            viewBox: '0 0 ' + SIZE + ' ' + SIZE,
            'class': 'atlas',
            'data-dots': rawDots,
            
            style: 'overflow: visible'
        });
        var filterId = 'atlas-shadow-' + (idCounter++);
        var defs = svgEl('defs', {});
        var filter = svgEl('filter', {
            id: filterId
        });
        filter.appendChild(svgEl('feDropShadow', {
            dx: SHADOW_DX,
            dy: SHADOW_DY,
            stdDeviation: SHADOW_BLUR,
            'flood-color': SHADOW_COLOUR,
            'flood-opacity': SHADOW_OPACITY
        }));
        defs.appendChild(filter);
        svg.appendChild(defs);
        svg.appendChild(svgEl('circle', {
            cx: CENTRE,
            cy: CENTRE,
            r: RADIUS,
            fill: CIRCLE_COLOUR,
            filter: 'url(#' + filterId + ')'
        }));
        svg.appendChild(svgEl('circle', {
            cx: CENTRE,
            cy: CENTRE,
            r: CENTRE_DOT_RADIUS,
            fill: CENTRE_DOT_COLOUR
        }));
        dots.forEach(function(dot) {
            var angle = dot.degrees * Math.PI / 180;
            
            var offset = (dot.distance / 100) * (RADIUS - DOT_RADIUS);
            
            var x = CENTRE + offset * Math.sin(angle);
            var y = CENTRE - offset * Math.cos(angle);
            svg.appendChild(svgEl('circle', {
                cx: round(x),
                cy: round(y),
                r: DOT_RADIUS,
                fill: dot.colour
            }));
        });
        return svg;
    }
	
    function renderAtlas(root) {
        var scope = root || document;
        var elements = scope.querySelectorAll('div.atlas[data-dots]');
        Array.prototype.forEach.call(elements, function(el) {
            var raw = el.getAttribute('data-dots') || '';
            var svg = buildAtlas(parseDots(raw), raw);
            el.parentNode.replaceChild(svg, el);
        });
        return elements.length;
    }
	
    global.renderAtlas = renderAtlas;
})(window);