// Function to load SVG content from a file and insert into the container
function loadSVG(url, container) {
  fetch(url)
      .then(response => response.text())
      .then(svgText => {
          container.innerHTML = svgText;
          const svg = container.querySelector("svg");
          const svgElement = d3.select(svg);
          const width = container.clientWidth;
          const height = container.clientHeight;

          svgElement.attr("viewBox", `0 0 ${width} ${height}`);
          svgElement.call(
              d3.zoom().on("zoom", (event) => {
                  svgElement.select("g").attr("transform", event.transform);
              })
          );
      })
      .catch(error => console.error("Error loading SVG:", error));
}

// Ensure the SVG container is available and load the SVG
document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById("svg-container");
  loadSVG("./files/new_1.svg", container);
});

// Add event listener for line selector
document.getElementById('line-selector').addEventListener('change', function() {
  const selectedClass = this.value;

  // path
  const paths = document.querySelectorAll('path');

 
  paths.forEach(path => {
      // remove
      path.classList.remove('blink', 'highlight');
      if (path.classList.contains(selectedClass)) {
          // blink
          path.classList.add('blink');
          // glow
          setTimeout(() => {
              path.classList.remove('blink');
              path.classList.add('highlight');
          }, 2000); // 1 s
      }
      path.style.display = "";
  });
});
