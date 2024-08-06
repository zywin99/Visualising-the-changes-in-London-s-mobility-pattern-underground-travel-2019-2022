const mapSvg = d3.select("#map")
    .attr("width", "85%")
    .attr("height", "85%");
const width = mapSvg.node().getBoundingClientRect().width;
const height = mapSvg.node().getBoundingClientRect().height;

// color
const color = d3.scaleOrdinal(d3.schemeCategory10);
const lineColors = {
    "Victoria": "#009fe0",
    "Central": "#e41f1f",
    "Northern": "#000000",
    "Jubilee": "#8f989e"
};

// projection
const projection = d3.geoMercator()
    .center([-0.1, 51.5]) 
    .scale(20000) 
    .translate([300, 300]);

// SVG
const path = d3.geoPath().projection(projection);

// zoom
const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', (event) => {
        mapSvg.selectAll('g').attr('transform', event.transform);
    });

mapSvg.call(zoom);


const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// JSON
d3.json("londonBoroughs.json").then(londonBoroughs => {
    const boroughs = topojson.feature(londonBoroughs, londonBoroughs.objects.boroughs);


    const boroughsLayer = mapSvg.append("g")
        .selectAll("path")
        .data(boroughs.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "borough");
});

// Line
d3.json("London Train Lines.json").then(trainLines => {
    const linesGroup = mapSvg.append("g").attr("class", "lines");

    function updateLines() {
        const selectedLines = [];
        if (document.getElementById("victoria").checked) selectedLines.push("#009fe0");
        if (document.getElementById("central").checked) selectedLines.push("#e41f1f");
        if (document.getElementById("northern").checked) selectedLines.push("#000000");
        if (document.getElementById("jubilee").checked) selectedLines.push("#8f989e");

        linesGroup.selectAll("path").remove();

        trainLines.features.forEach(feature => {
            const lineColor = feature.properties.stroke;
            if (selectedLines.includes(lineColor)) {
                linesGroup.append("path")
                    .attr("d", path(feature))
                    .style("stroke", lineColor)
                    .style("stroke-width", 1) 
                    .style("fill", "none");
            }
        });
    }

    d3.selectAll("input[type=checkbox]").on("change", updateLines);
    updateLines();
});

// station
d3.json("2022cluster_data.json").then(data => {

    const stationsGroup = mapSvg.append("g");

    const stationCircles = stationsGroup.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => projection([+d.Longitude, +d.Latitude])[0])
        .attr("cy", d => projection([+d.Longitude, +d.Latitude])[1])
        .attr("r", 2)
        .attr("class", "station")
        .style("fill", d => color(d.Cluster))
        .style("opacity", 0)  
        .on("mouseover", (event, d) => {
            if (d3.select(event.target).style("opacity") == 1) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.Station)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // unique Cluster
    const clusters = Array.from(new Set(data.map(d => d.Cluster)));

    // legend
    const legend = d3.select("#legend");

    clusters.forEach(cluster => {
        const button = legend.append("button")
            .attr("class", "legend-button")
            .style("background-color", color(cluster))
            .text(`Cluster ${cluster}`)
            .on("click", () => {
                
                const currentOpacity = stationCircles.filter(d => d.Cluster === cluster).style("opacity");
                const newOpacity = currentOpacity === "1" ? "0" : "1";
                stationCircles.filter(d => d.Cluster === cluster).style("opacity", newOpacity);
            });
    });
});
