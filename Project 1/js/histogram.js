class Histogram {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 40, right: 50, bottom: 10, left: 50 },
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

    // Initialize linear and ordinal scales (input domain and output range)
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

    // vis.rScale = d3
    //   .scaleLinear()
    //   .domain(d3.extent(vis.data, (d) => d.cost))
    //   .range([5, 100]);

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

    //Add circles for each event in the data
    vis.chart
      .selectAll("circle")
      .data(vis.data)
      .enter()
      .append("circle")
      .attr("fill", "#4682B4")
      //   .attr("opacity", 0.8)
      //   .attr("stroke", "gray")
      //   .attr("stroke-width", 2)
      .attr("r", 1.5)
      .attr("cy", (d) => vis.yScale(d.education_less_than_high_school_percent))
      .attr("cx", (d) => vis.xScale(d.poverty_perc));

    //updateVis(); //call updateVis() at the end - we aren't using this yet.
  }

  updateVis() {
    renderVis();
  }

  renderVis() {}
}
