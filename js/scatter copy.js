class Scatter2 {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 40, right: 50, bottom: 10, left: 50 },
      tooltipPadding: _config.tooltipPadding || 15,
      x_data: _config.x_data,
      y_data: _config.y_data,
    };

    this.data = _data;

    this.initVis();
  }

  initVis() {
    //setting up the chart- things that won't need to update on user actions
    let sub_data = [];
    console.log("Let's draw a chart!!");
    for (let i = 0; i < this.data.length; i++) {
      sub_data.push({
        x_data: this.data[i][this.config.x_data],
        y_data: this.data[i][this.config.y_data],
        name: this.data[i]["display_name"],
      });
    }
    console.log(sub_data);

    // I recommend avoiding simply using the this keyword within complex class code
    // involving SVG elements because the scope of this will change and it will cause
    // undesirable side-effects. Instead, we recommend creating another variable at
    // the start of each function to store the this-accessor
    let vis = this;

    // Width and height as the inner dimensions of the chart area- as before
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Define 'svg' as a child-element (g) from the drawing area and include spaces
    // Add <svg> element (drawing space)
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left}, ${vis.config.margin.top})`
      );

    vis.updateVis(sub_data); //call updateVis() at the end - we aren't using this yet.
  }

  updateVis(sub_data) {
    let vis = this;

    vis.xScale = d3
      .scaleLinear()
      .domain([0, d3.max(sub_data, (d) => d.x_data)])
      .range([0, vis.width]);

    vis.yScale = d3
      .scaleLinear()
      .domain([
        d3.max(sub_data, (d) => d.y_data),
        d3.min(sub_data, (d) => d.y_data),
      ])
      .range([0, vis.height]);

    // Initialize axes
    vis.xAxis = d3.axisTop(vis.xScale);
    vis.yAxis = d3.axisLeft(vis.yScale);

    // Draw the axis
    vis.xAxisGroup = vis.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis.height})`)
      .call(vis.xAxis);

    vis.yAxisGroup = vis.chart
      .append("g")
      .attr("class", "axis y-axis")
      .call(vis.yAxis);

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = vis.chart
      .append("defs")
      .append("vis.chart:clipPath")
      .attr("id", "clip")
      .append("vis.chart:rect")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .attr("x", 0)
      .attr("y", 0);

    // Add brushing
    var brush = d3
      .brushX() // Add the brush feature using the d3.brush function
      .extent([
        [0, 0],
        [vis.width, vis.height],
      ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", (result) => updateChart(result)); // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the scatter variable: where both the circles and the brush take place
    vis.circles = vis.chart.append("g").attr("clip-path", "url(#clip)");

    vis.circles
      .selectAll("circle")
      .data(sub_data)
      // .enter()
      // .append("circle")
      .join("circle")
      .attr("fill", "purple")
      .attr("opacity", 0.5)
      // .attr("stroke", "gray")
      // .attr("stroke-width", 2)
      .attr("r", 2)
      .attr("cy", (d) => vis.yScale(d.y_data))
      .attr("cx", (d) => vis.xScale(d.x_data));

    vis.circles.append("g").attr("class", "brush").call(brush);

    // Add brushing

    // A function that set idleTimeOut to null
    var idleTimeout;
    function idled() {
      idleTimeout = null;
    }

    // A function that update the chart for given boundaries
    function updateChart(result) {
      console.log(result);
      let extent = result.selection;

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if (!extent) {
        if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
        vis.xScale.domain([0, d3.max(sub_data, (d) => d.x_data)]);
      } else {
        vis.xScale.domain([
          vis.xScale.invert(extent[0]),
          vis.xScale.invert(extent[1]),
        ]);
        vis.circles.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and circle position
      // vis.xAxis.transition().duration(1000).call(d3.axisBottom(vis.xScale));
      vis.xAxis.call(d3.axisBottom(vis.xScale));
      vis.circles
        .selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cy", (d) => vis.yScale(d.y_data))
        .attr("cx", (d) => vis.xScale(d.x_data));
    }
  }

  renderVis() {}
}

// export default Scatter2;
