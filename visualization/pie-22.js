function updateSunburst(cluster) {
    d3.csv("pie_2022.csv").then(data => {
        // filter
        const filteredData = data.filter(d => d.Cluster == cluster);

        // Count
        const clusterCount = +filteredData[0].Count;

        
        const categories = ["Education", "Health", "Food", "Shopping", "Office Building", "Transport", "Entertainment", "Public Services"];
        const processedData = categories
            .map(category => ({
                Category: category,
                Count: +filteredData[0][category]
            }))
            .filter(d => d.Count > 0)
            .sort((a, b) => b.Count - a.Count);  

        const width = 600;
        const height = 600;
        const radius = Math.min(width, height) / 2 * 0.6;  // 60%

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // arc
        const arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        // pie
        const pie = d3.pie()
            .sort(null)
            .value(d => d.Count)
            .startAngle(0)
            .endAngle(2 * Math.PI)
            .padAngle(0.01)
            .value(d => Math.max(d.Count, 10 / 360 * 2 * Math.PI));  

       
        d3.select("#chart").selectAll("*").remove();

        const svg = d3.select("#chart")
            .attr("width", width + 200)  
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const g = svg.selectAll(".arc")
            .data(pie(processedData))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", d => color(d.data.Category));

        g.append("title")
            .text(d => `${d.data.Category}: ${d.data.Count}`);

        // legend
        const legend = svg.append("g")
            .attr("transform", `translate(${radius + 30},${-radius})`); 

        legend.selectAll("rect")
            .data(processedData)
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 25)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => color(d.Category));

        legend.selectAll("text")
            .data(processedData)
            .enter().append("text")
            .attr("x", 24)
            .attr("y", (d, i) => i * 25 + 9)
            .attr("dy", ".35em")
            .text(d => `${d.Category}: ${d.Count}`)
            .style("font-size", "12px")  
            .style("text-anchor", "start"); 

        // legend
        legend.append("text")
            .attr("x", 0)
            .attr("y", processedData.length * 25 + 9)
            .attr("dy", ".35em")
            .text(`Cluster Count: ${clusterCount}`)
            .style("font-size", "12px")
            .style("text-anchor", "start");
    });
}


updateSunburst(0);


d3.select("#cluster-select").on("change", function() {
    const selectedCluster = d3.select(this).property("value");
    updateSunburst(selectedCluster);
});
