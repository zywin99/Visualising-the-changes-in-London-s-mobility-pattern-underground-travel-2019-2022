// Initialize global variables
let outData, inData;

// Function to load CSV data and initialize the map and buttons
function loadDataAndInitialize() {
    d3.csv('2019+2022_out.csv').then(function(outCsv) {
        outData = outCsv;
        d3.csv('2019+2022_in.csv').then(function(inCsv) {
            inData = inCsv;
            initialize();
        });
    });
}

// Initial load
loadDataAndInitialize();

// Function to initialize the map and buttons
function initialize() {
    // Create unique options for the buttons
    const years = [...new Set([...outData.map(d => d.Year), ...inData.map(d => d.Year)])];
    const timePeriods = [...new Set([...outData.map(d => d.TimePeriod), ...inData.map(d => d.TimePeriod)])];
    const stations = [...new Set([...outData.map(d => d.OriginName), ...inData.map(d => d.DestinationName)])];

    // Populate the button groups
    populateButtonGroup('year', years);
    populateButtonGroup('timePeriod', timePeriods);
    populateButtonGroup('station', stations);

    // Initialize map
    const map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Function to populate button groups
    function populateButtonGroup(id, options) {
        const group = d3.select(`#${id}`);
        group.selectAll('button').remove(); // Clear previous buttons
        options.forEach(option => {
            group.append('button')
                .text(option)
                .on('click', function() {
                    d3.select(this).classed('selected', !d3.select(this).classed('selected'));
                    updateMap();
                });
        });
    }

    // Handle Type button clicks
    d3.selectAll('#type button').on('click', function() {
        d3.select(this).classed('selected', !d3.select(this).classed('selected'));
        updateMap();
    });

    function getSelectedOptions(id) {
        return Array.from(d3.select(`#${id}`).selectAll('.selected').nodes()).map(node => node.textContent);
    }

    function updateMap() {
        // Get selected values
        const selectedYears = getSelectedOptions('year');
        const selectedTimePeriods = getSelectedOptions('timePeriod');
        const selectedStations = getSelectedOptions('station');
        const selectedTypes = getSelectedOptions('type');

        // Clear existing map layers
        map.eachLayer(layer => {
            if (!!layer.toGeoJSON) {
                map.removeLayer(layer);
            }
        });

        // Re-add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Function to add data to map
        function addDataToMap(data, isOut) {
            // Filter data based on selections
            const filteredData = data.filter(d => selectedYears.includes(d.Year) && selectedTimePeriods.includes(d.TimePeriod) && (isOut ? selectedStations.includes(d.OriginName) : selectedStations.includes(d.DestinationName)));

            // Add station markers
            const stationSet = new Set(filteredData.map(d => isOut ? d.OriginName : d.DestinationName));
            stationSet.forEach(stationName => {
                const stationData = filteredData.find(d => isOut ? d.OriginName === stationName : d.DestinationName === stationName);
                const stationLat = isOut ? +stationData.OriginLat : +stationData.DestinationLat;
                const stationLon = isOut ? +stationData.OriginLon : +stationData.DestinationLon;
                L.marker([stationLat, stationLon], { icon: L.divIcon({ className: 'origin-marker' }) })
                  .addTo(map)
                  .bindPopup(stationName);
            });

            // Add destination markers and lines
            filteredData.forEach(d => {
                const originLat = +d.OriginLat;
                const originLon = +d.OriginLon;
                const destLat = +d.DestinationLat;
                const destLon = +d.DestinationLon;
                const flow = +d.Flow;
                const color = d.Year === '2019' ? 'blue' : 'purple';
                let opacity = 1.0;

                if (d.TimePeriod === 'AM PEAK') {
                    opacity = 0.4;
                } else if (d.TimePeriod === 'INTER PEAK') {
                    opacity = 0.5;
                }

                // Add marker for the other station
                const otherStationLat = isOut ? destLat : originLat;
                const otherStationLon = isOut ? destLon : originLon;
                L.marker([otherStationLat, otherStationLon], { icon: L.divIcon({ className: 'destination-marker' }) })
                  .addTo(map)
                  .bindPopup(isOut ? d.DestinationName : d.OriginName);

                const lineWidth = Math.min(flow / 1000, 9); // Adjust flow factor and max width (5) to your needs

                // Determine line direction and arrow end
                const fromLatLon = isOut ? [originLat, originLon] : [originLat, originLon];
                const toLatLon = isOut ? [destLat, destLon] : [destLat, destLon];

                const arrow = L.polyline([fromLatLon, toLatLon], {
                    color: color, // Set color based on year
                    weight: lineWidth,  // Use calculated line width
                    opacity: opacity,
                    className: 'flow-line'
                }).addTo(map);

                // Set arrow direction
                arrow._path.setAttribute('marker-end', `url(#arrowhead-${color}-${opacity})`);
            });
        }

        // Add data for selected types
        if (selectedTypes.includes('OUT')) {
            addDataToMap(outData, true);
        }
        if (selectedTypes.includes('IN')) {
            addDataToMap(inData, false);
        }

        // Add arrowhead definitions for both colors and opacities
        const svg = d3.select(map.getPanes().overlayPane).select('svg');
        const defs = svg.append('defs');
        const colors = ['blue', 'purple'];
        const opacities = [0.4, 0.5, 1.0];
        colors.forEach(color => {
            opacities.forEach(opacity => {
                defs.append('marker')
                    .attr('id', `arrowhead-${color}-${opacity}`)
                    .attr('markerWidth', 10)
                    .attr('markerHeight', 7)
                    .attr('refX', 10)
                    .attr('refY', 3.5)
                    .attr('orient', 'auto')
                    .attr('fill-opacity', opacity)
                    .append('polygon')
                    .attr('points', '0 0, 10 3.5, 0 7')
                    .attr('fill', color);
            });
        });
    }
}
