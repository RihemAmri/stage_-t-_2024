document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/sales");
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const salesData = await response.json();
    console.log(salesData);
    const products = salesData.map((item) => item.product);
    const sales = salesData.map((item) => item.sales);

    let currentChartIndex = 0;
    const chartTypes = ["bar", "line", "doughnut", "pie"];
    drawChart(chartTypes[currentChartIndex], products, sales);

    document.getElementById("prevChart").addEventListener("click", () => {
      if (currentChartIndex > 0) {
        currentChartIndex--;
        updateChart();
      }
    });

    document.getElementById("nextChart").addEventListener("click", () => {
      if (currentChartIndex < chartTypes.length - 1) {
        currentChartIndex++;
        updateChart();
      }
    });

    function updateChart() {
      const chartType = chartTypes[currentChartIndex];
      drawChart(chartType, products, sales);
    }

    function drawChart(type, products, sales) {
      d3.select("#chartContainer").selectAll(".chart").remove();

      if (type === "bar") {
        drawBarChart(products, sales);
      } else if (type === "line") {
        drawLineChart(products, sales);
      } else if (type === "doughnut") {
        drawDoughnutChart(products, sales);
      } else if (type === "pie") {
        drawPieChart(products, sales);
      }
    }

    function drawBarChart(products, sales) {
      const margin = { top: 50, right: 50, bottom: 50, left: 50 };
      const width = 300 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const svg = d3
        .select("#chartContainer")
        .append("div")
        .attr("class", "chart")
        .append("svg")
        .attr("width", 300)
        .attr("height", 300)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand().domain(products).range([0, width]).padding(0.1);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(sales)])
        .range([height, 0]);

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      svg.append("g").call(d3.axisLeft(y));

      // Définir une fonction pour choisir la couleur en alternance
      const color = (d, i) => (i % 2 === 0 ? "#0CB9CD" : "#2ca02c"); // Bleu pour indices pairs, vert pour indices impairs

      svg
        .selectAll(".bar")
        .data(products)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d))
        .attr("width", x.bandwidth())
        .attr("y", (d) => y(sales[products.indexOf(d)]))
        .attr("height", (d) => height - y(sales[products.indexOf(d)]))
        .style("fill", (d, i) => color(d, i)) // Appliquer la couleur en alternance
        .style("opacity", 0.7) // Opacité à 70%
        .on("mouseover", function (event, d) {
          const salesValue = sales[products.indexOf(d)];
          const tooltip = d3.select("#tooltip");
          tooltip
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`)
            .style("display", "block")
            .html(`<strong>${d}</strong><br>Sales: ${salesValue}`);
        })
        .on("mouseout", function () {
          d3.select("#tooltip").style("display", "none");
        });
    }

    function drawLineChart(products, sales) {
      const margin = { top: 50, right: 50, bottom: 50, left: 50 };
      const width = 300 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const svg = d3
        .select("#chartContainer")
        .append("div")
        .attr("class", "chart")
        .append("svg")
        .attr("width", 300)
        .attr("height", 300)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand().domain(products).range([0, width]).padding(0.1);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(sales)])
        .range([height, 0]);

      const line = d3
        .line()
        .x((d) => x(d))
        .y((d) => y(sales[products.indexOf(d)]));

      svg
        .append("path")
        .datum(products)
        .attr("fill", "none")
        .attr("stroke", "#b347a5")
        .attr("stroke-width", 1.5)
        .attr("d", line)
        .on("mouseover", function (event, d) {
          const salesValue = sales[products.indexOf(d)];
          const tooltip = d3.select("#tooltip");
          tooltip
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`)
            .style("display", "block")
            .html(`<strong>${d}</strong><br>Sales: ${salesValue}`);
        })
        .on("mouseout", function () {
          d3.select("#tooltip").style("display", "none");
        });

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
      svg.append("g").call(d3.axisLeft(y));
    }

    function drawDoughnutChart(products, sales) {
      const width = 300;
      const height = 300;
      const radius = Math.min(width, height) / 2;

      const svg = d3
        .select("#chartContainer")
        .append("div")
        .attr("class", "chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
      const colorScale = d3
        .scaleLinear()
        .domain([0, products.length - 1])
        .range(["#5F85D8", "#FDBCF9"]);

      const pie = d3.pie().value((d) => sales[products.indexOf(d)]);
      const data_ready = pie(products);
      const arc = d3
        .arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius);

      svg
        .selectAll("path")
        .data(data_ready)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => colorScale(i))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function (event, d) {
          const salesValue = sales[products.indexOf(d.data)];
          const tooltip = d3.select("#tooltip");
          tooltip
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`)
            .style("display", "block")
            .html(`<strong>${d.data}</strong><br>Sales: ${salesValue}`);
        })
        .on("mouseout", function () {
          d3.select("#tooltip").style("display", "none");
        });

      svg
        .selectAll("text")
        .data(data_ready)
        .enter()
        .append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text((d) => d.data);

      const legend = svg
        .append("g")
        .attr("transform", `translate(${width - 120}, 20)`)
        .selectAll(".legend")
        .data(products)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

      legend
        .append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d, i) => colorScale(i));

      legend
        .append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text((d) => d);

      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("transform", `translate(${width / 2}, ${height + 30})`)
        .text("Sales Distribution");
    }

    function drawPieChart(products, sales) {
      const width = 300;
      const height = 300;
      const radius = Math.min(width, height) / 2;

      const svg = d3
        .select("#chartContainer")
        .append("div")
        .attr("class", "chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
      const colorScale = d3
        .scaleLinear()
        .domain([0, products.length - 1])
        .range(["#5F85D8", "#FDBCF9"]);

      const pie = d3.pie().value((d) => sales[products.indexOf(d)]);
      const data_ready = pie(products);
      const arc = d3.arc().innerRadius(0).outerRadius(radius);
      const arcs = svg
        .selectAll("path")
        .data(data_ready)
        .enter()
        .append("g")
        .attr("class", "arc");

      arcs
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => colorScale(i))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function (event, d) {
          const salesValue = sales[products.indexOf(d.data)];
          const tooltip = d3.select("#tooltip");
          tooltip
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`)
            .style("display", "block")
            .html(`<strong>${d.data}</strong><br>Sales: ${salesValue}`);
        })
        .on("mouseout", function () {
          d3.select("#tooltip").style("display", "none");
        });

      arcs
        .append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("class", "pie-label")
        .text((d) => {
          const percentage = (
            ((d.endAngle - d.startAngle) / (2 * Math.PI)) *
            100
          ).toFixed(0);
          return `${d.data} (${percentage}%)`;
        });

      svg
        .selectAll(".pie-label")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black");
      const legendContainer = d3
        .select("#legendContainer")
        .append("div")
        .attr("class", "legend-container");

      const legend = legendContainer
        .selectAll(".legend")
        .data(products)
        .enter()
        .append("div")
        .attr("class", "legend");

      legend
        .append("div")
        .attr("class", "legend-color")
        .style("background-color", (d, i) => colorScale(i));

      legend
        .append("div")
        .attr("class", "legend-text")
        .text((d) => d);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});
