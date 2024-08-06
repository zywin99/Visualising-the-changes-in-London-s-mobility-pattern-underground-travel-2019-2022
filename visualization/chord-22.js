// Load the data
d3.json("chord_data_22.json").then(function(data) {
    var matrix_am_peak = data.matrix_am_peak;
    var matrix_inter_peak = data.matrix_inter_peak;
    var matrix_pm_peak = data.matrix_pm_peak;
    var node_data = data.nodes;

    var width = 600,  // Adjusted to 75% of the original size
        height = 600,  // Adjusted to 75% of the original size
        outerRadius = Math.min(width, height) * 0.4 - 50,
        innerRadius = outerRadius - 20;

    var chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var ribbon = d3.ribbon()
        .radius(innerRadius);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    function drawChart(matrix, id) {
        d3.select("#chart").html(""); // Clear the existing chart
        var svg = d3.select("#chart").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .datum(chord(matrix));

        var group = svg.append("g")
            .selectAll("g")
            .data(function(chords) { return chords.groups; })
            .enter().append("g");

        group.append("path")
            .style("fill", function(d) { return color(d.index); })
            .style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
            .attr("d", arc);

        group.append("text")
            .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", function(d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                    + "translate(" + (innerRadius + 26) + ")"
                    + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .attr("class", "group-label")
            .text(function(d) { return "Cluster " + node_data[d.index].name; });

        svg.append("g")
            .attr("fill-opacity", 0.67)
            .selectAll("path")
            .data(function(chords) { return chords; })
            .enter().append("path")
            .style("fill", function(d) { return color(d.target.index); })
            .style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); })
            .attr("d", ribbon);
    }

    // Initial chart draw
    drawChart(matrix_am_peak, "AM Peak");

    // Add event listener to the dropdown
    d3.select("#time-period").on("change", function() {
        var selectedMatrix = d3.select(this).property("value");
        var matrix;
        if (selectedMatrix === "AM Peak") {
            matrix = matrix_am_peak;
        } else if (selectedMatrix === "Midday") {
            matrix = matrix_inter_peak;
        } else if (selectedMatrix === "PM Peak") {
            matrix = matrix_pm_peak;
        }
        drawChart(matrix, selectedMatrix);
    });
});
