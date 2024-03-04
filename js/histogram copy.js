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
      .style("fill", "#69b3a2");

    // // Add a clipPath: everything out of this area won't be drawn.
    // vis.clip = vis.svg
    //   .append("defs")
    //   .append("svg:clipPath")
    //   .attr("id", "clip")
    //   .append("svg:rect")
    //   .attr("width", vis.width)
    //   .attr("height", vis.height)
    //   .attr("x", 0)
    //   .attr("y", 0);

    // // Add brushing
    // vis.brush = d3
    //   .brushX() // Add the brush feature using the d3.brush function
    //   .extent([
    //     [0, 0],
    //     [vis.width, vis.height],
    //   ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    //   .on("end", updateChart); // Each time the brush selection changes, trigger the 'updateChart' function

    // // Add the brushing
    // vis.histogram.append("g").attr("class", "brush").call(vis.brush);

    // // A function that set idleTimeOut to null
    // vis.idleTimeout;
    // function idled() {
    //   vis.idleTimeout = null;
    // }

    // // A function that update the chart for given boundaries
    // function updateChart() {
    //   extent = d3.event.selection;

    //   // If no selection, back to initial coordinate. Otherwise, update X axis domain
    //   if (!extent) {
    //     if (!vis.idleTimeout) return (vis.idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
    //     vis.x.domain([4, 8]);
    //   } else {
    //     vis.x.domain([x.invert(extent[0]), vis.x.invert(extent[1])]);
    //     vis.histogram.select(".brush").call(vis.brush.move, null); // This remove the grey brush area as soon as the selection has been done
    //   }

    // Update axis and circle position
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

  renderVis() {}
}

// class FocusContextVis {
//   /**
//    * Class constructor with basic chart configuration
//    * @param {Object}
//    * @param {Array}
//    */
//   constructor(_config, _data) {
//     this.config = {
//       parentElement: _config.parentElement,
//       width: 800,
//       height: 240,
//       contextHeight: 50,
//       margin: { top: 10, right: 10, bottom: 100, left: 45 },
//       contextMargin: { top: 280, right: 10, bottom: 20, left: 45 },
//     };
//     this.data = _data;
//     this.initVis();
//   }

//   /**
//    * Initialize scales/axes and append static chart elements
//    */
//   initVis() {
//     let vis = this;
//     console.log(vis.data);

//     const containerWidth =
//       vis.config.width + vis.config.margin.left + vis.config.margin.right;
//     const containerHeight =
//       vis.config.height + vis.config.margin.top + vis.config.margin.bottom;

//     vis.xScaleFocus = d3.scaleTime().range([0, vis.config.width]);

//     vis.xScaleContext = d3.scaleTime().range([0, vis.config.width]);

//     vis.yScaleFocus = d3.scaleLinear().range([vis.config.height, 0]).nice();

//     vis.yScaleContext = d3
//       .scaleLinear()
//       .range([vis.config.contextHeight, 0])
//       .nice();

//     // Initialize axes
//     vis.xAxisFocus = d3.axisBottom(vis.xScaleFocus).tickSizeOuter(0);
//     vis.xAxisContext = d3.axisBottom(vis.xScaleContext).tickSizeOuter(0);
//     vis.yAxisFocus = d3.axisLeft(vis.yScaleFocus);

//     // Define size of SVG drawing area
//     vis.svg = d3
//       .select(vis.config.parentElement)
//       .attr("width", containerWidth)
//       .attr("height", containerHeight);

//     // Append focus group with x- and y-axes
//     vis.focus = vis.svg
//       .append("g")
//       .attr(
//         "transform",
//         `translate(${vis.config.margin.left},${vis.config.margin.top})`
//       );

//     vis.focus
//       .append("defs")
//       .append("clipPath")
//       .attr("id", "clip")
//       .append("rect")
//       .attr("width", vis.config.width)
//       .attr("height", vis.config.height);

//     vis.focusLinePath = vis.focus.append("path").attr("class", "chart-line");

//     vis.xAxisFocusG = vis.focus
//       .append("g")
//       .attr("class", "axis x-axis")
//       .attr("transform", `translate(0,${vis.config.height})`);

//     vis.yAxisFocusG = vis.focus.append("g").attr("class", "axis y-axis");

//     vis.tooltipTrackingArea = vis.focus
//       .append("rect")
//       .attr("width", vis.config.width)
//       .attr("height", vis.config.height)
//       .attr("fill", "none")
//       .attr("pointer-events", "all");

//     // Empty tooltip group (hidden by default)
//     vis.tooltip = vis.focus
//       .append("g")
//       .attr("class", "tooltip")
//       .style("display", "none");

//     vis.tooltip.append("circle").attr("r", 4);

//     vis.tooltip.append("text");

//     // Append context group with x- and y-axes
//     vis.context = vis.svg
//       .append("g")
//       .attr(
//         "transform",
//         `translate(${vis.config.contextMargin.left},${vis.config.contextMargin.top})`
//       );

//     vis.contextAreaPath = vis.context
//       .append("path")
//       .attr("class", "chart-area");

//     vis.xAxisContextG = vis.context
//       .append("g")
//       .attr("class", "axis x-axis")
//       .attr("transform", `translate(0,${vis.config.contextHeight})`);

//     vis.brushG = vis.context.append("g").attr("class", "brush x-brush");

//     // Initialize brush component
//     vis.brush = d3
//       .brushX()
//       .extent([
//         [0, 0],
//         [vis.config.width, vis.config.contextHeight],
//       ])
//       .on("brush", function ({ selection }) {
//         if (selection) vis.brushed(selection);
//       })
//       .on("end", function ({ selection }) {
//         if (!selection) vis.brushed(null);
//       });
//   }

//   /**
//    * Prepare the data and scales before we render it.
//    */
//   updateVis() {
//     let vis = this;

//     vis.xValue = (d) => d.date;
//     vis.yValue = (d) => d.close;

//     // Initialize line and area generators
//     vis.line = d3
//       .line()
//       .x((d) => vis.xScaleFocus(vis.xValue(d)))
//       .y((d) => vis.yScaleFocus(vis.yValue(d)));

//     vis.area = d3
//       .area()
//       .x((d) => vis.xScaleContext(vis.xValue(d)))
//       .y1((d) => vis.yScaleContext(vis.yValue(d)))
//       .y0(vis.config.contextHeight);

//     // Set the scale input domains
//     vis.xScaleFocus.domain(d3.extent(vis.data, vis.xValue));
//     vis.yScaleFocus.domain(d3.extent(vis.data, vis.yValue));
//     vis.xScaleContext.domain(vis.xScaleFocus.domain());
//     vis.yScaleContext.domain(vis.yScaleFocus.domain());

//     vis.bisectDate = d3.bisector(vis.xValue).left;

//     vis.renderVis();
//   }

//   /**
//    * This function contains the D3 code for binding data to visual elements
//    */
//   renderVis() {
//     let vis = this;

//     vis.focusLinePath.datum(vis.data).attr("d", vis.line);

//     vis.contextAreaPath.datum(vis.data).attr("d", vis.area);

//     vis.tooltipTrackingArea
//       .on("mouseenter", () => {
//         vis.tooltip.style("display", "block");
//       })
//       .on("mouseleave", () => {
//         vis.tooltip.style("display", "none");
//       })
//       .on("mousemove", function (event) {
//         // Get date that corresponds to current mouse x-coordinate
//         const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
//         const date = vis.xScaleFocus.invert(xPos);

//         // Find nearest data point
//         const index = vis.bisectDate(vis.data, date, 1);
//         const a = vis.data[index - 1];
//         const b = vis.data[index];
//         const d = b && date - a.date > b.date - date ? b : a;

//         // Update tooltip
//         vis.tooltip
//           .select("circle")
//           .attr(
//             "transform",
//             `translate(${vis.xScaleFocus(d.date)},${vis.yScaleFocus(d.close)})`
//           );

//         vis.tooltip
//           .select("text")
//           .attr(
//             "transform",
//             `translate(${vis.xScaleFocus(d.date)},${
//               vis.yScaleFocus(d.close) - 15
//             })`
//           )
//           .text(Math.round(d.close));
//       });

//     // Update the axes
//     vis.xAxisFocusG.call(vis.xAxisFocus);
//     vis.yAxisFocusG.call(vis.yAxisFocus);
//     vis.xAxisContextG.call(vis.xAxisContext);

//     // Update the brush and define a default position
//     const defaultBrushSelection = [
//       vis.xScaleFocus(new Date("2019-01-01")),
//       vis.xScaleContext.range()[1],
//     ];
//     vis.brushG.call(vis.brush).call(vis.brush.move, defaultBrushSelection);
//   }

//   /**
//    * React to brush events
//    */
//   brushed(selection) {
//     let vis = this;

//     // Check if the brush is still active or if it has been removed
//     if (selection) {
//       // Convert given pixel coordinates (range: [x0,x1]) into a time period (domain: [Date, Date])
//       const selectedDomain = selection.map(
//         vis.xScaleContext.invert,
//         vis.xScaleContext
//       );

//       // Update x-scale of the focus view accordingly
//       vis.xScaleFocus.domain(selectedDomain);
//     } else {
//       // Reset x-scale of the focus view (full time period)
//       vis.xScaleFocus.domain(vis.xScaleContext.domain());
//     }

//     // Redraw line and update x-axis labels in focus view
//     vis.focusLinePath.attr("d", vis.line);
//     vis.xAxisFocusG.call(vis.xAxisFocus);
//   }
// }
