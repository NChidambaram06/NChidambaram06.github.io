class HistogramCopy {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 40, right: 50, bottom: 10, left: 50 },
      tooltipPadding: _config.tooltipPadding || 15,
      x_data: _config.x_data,
    };

    this.data = _data;
    this.initVis();
  }

  initVis() {
    //setting up the chart- things that won't need to update on user actions

    // I recommend avoiding simply using the this keyword within complex class code
    // involving SVG elements because the scope of this will change and it will cause
    // undesirable side-effects. Instead, we recommend creating another variable at
    // the start of each function to store the this-accessor
    let vis = this;

    let sub_data = [];
    console.log("Let's draw a chart!!");
    for (let i = 0; i < this.data.length; i++) {
      sub_data.push({
        x_data: this.data[i][this.config.x_data],
        name: this.data[i]["display_name"],
        // y_data: this.data[i][this.config.y_data],
      });
    }
    vis.sub_data = sub_data;
    console.log(vis.sub_data);

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

    // // X axis: scale and draw:
    // vis.x = d3
    //   .scaleLinear()
    //   .domain([
    //     0,
    //     d3.max(sub_data, function (d) {
    //       return +d.x_data;
    //     }),
    //   ]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
    //   .range([0, vis.width]);
    // vis.svg
    //   .append("g")
    //   .attr("transform", "translate(0," + vis.height + ")")
    //   .call(d3.axisBottom(vis.x));

    // // set the parameters for the histogram
    // var histogram = d3
    //   .histogram()
    //   .value(function (d) {
    //     return d.x_data;
    //   }) // I need to give the vector of value
    //   .domain(vis.x.domain()) // then the domain of the graphic
    //   .thresholds(vis.x.ticks(70)); // then the numbers of bins

    // // And apply this function to data to get the bins
    // vis.bins = histogram(sub_data);

    // // Y axis: scale and draw:
    // vis.y = d3.scaleLinear().range([vis.height, 0]);
    // vis.y.domain([
    //   0,
    //   d3.max(vis.bins, function (d) {
    //     return d.length;
    //   }),
    // ]); // d3.hist has to be called before the Y axis obviously
    // vis.svg.append("g").call(d3.axisRight(vis.y));

    vis.updateVis(sub_data);
  }

  updateVis(sub_data) {
    let vis = this;
    vis.selectedBars = [];

    // X axis: scale and draw:
    vis.x = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(sub_data, function (d) {
          return +d.x_data;
        }),
      ]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, vis.width]);
    vis.svg
      .append("g")
      .attr("transform", "translate(0," + vis.height + ")")
      .call(d3.axisBottom(vis.x));

    // set the parameters for the histogram
    var histogram = d3
      .histogram()
      .value(function (d) {
        return d.x_data;
      }) // I need to give the vector of value
      .domain(vis.x.domain()) // then the domain of the graphic
      .thresholds(vis.x.ticks(70)); // then the numbers of bins

    // And apply this function to data to get the bins
    vis.bins = histogram(sub_data);

    // Y axis: scale and draw:
    vis.y = d3.scaleLinear().range([vis.height, 0]);
    vis.y.domain([
      0,
      d3.max(vis.bins, function (d) {
        return d.length;
      }),
    ]); // d3.hist has to be called before the Y axis obviously
    vis.svg.append("g").call(d3.axisRight(vis.y));

    vis.histogram = vis.svg
      .selectAll("rect")
      .data(vis.bins)
      .enter()
      .append("rect")
      .attr("x", 1)
      .attr("transform", function (d) {
        return "translate(" + vis.x(d.x0) + "," + vis.y(d.length) + ")";
      })
      .attr("width", function (d) {
        return vis.x(d.x1) - vis.x(d.x0) - 1;
      })
      .attr("height", function (d) {
        return vis.height - vis.y(d.length);
      })
      .style("fill", "#69b3a2")
      .on("click", function (event, d) {
        vis.selectedBars = vis.selectedBars.concat(d);
        console.log(vis.selectedBars);
      });

    // Add a clipPath: everything out of this area won't be drawn.
    vis.clip = vis.svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .attr("x", 0)
      .attr("y", 0);

    // Add brushing
    vis.brush = d3
      .brushX()
      .extent([
        [0, 0],
        [vis.width, vis.height],
      ])
      .on("end", updateChart);

    // Add the brush to the chart
    vis.svg.append("g").attr("class", "brush").call(vis.brush);

    // A function that set idleTimeout to null
    vis.idleTimeout;
    function idled() {
      vis.idleTimeout = null;
    }

    // A function that updates the chart for given boundaries
    function updateChart(result) {
      console.log(1);
      const extent = result.selection;
      console.log(2);

      // If no selection, back to initial coordinate.
      if (!extent) {
        console.log(3);
        if (!vis.idleTimeout) return (vis.idleTimeout = setTimeout(idled, 350));
        console.log(4);
        vis.x.domain([
          0,
          d3.max(sub_data, function (d) {
            return +d.x_data;
          }),
        ]);
        console.log(5);
      } else {
        console.log(6);
        // Update X axis domain based on selection
        // vis.x.domain([vis.x.invert(extent[0]), vis.x.invert(extent[1])]);
        vis.histogram.select(".brush").call(vis.brush.move, null);

        // Update axis and rectangle positions
        vis.svg.transition().duration(1000).call(d3.axisBottom(vis.x));
        vis.histogram
          .selectAll("rect")
          .transition()
          .duration(1000)
          .attr("x", 1)
          .attr("transform", function (d) {
            return "translate(" + vis.x(d.x0) + "," + vis.y(d.length) + ")";
          })
          .attr("width", function (d) {
            return vis.x(d.x1) - vis.x(d.x0) - 1;
          })
          .attr("height", function (d) {
            return vis.height - vis.y(d.length);
          });
      }
      console.log("selected: ", vis.selectedBars);
    }
  }

  renderVis() {}
}
