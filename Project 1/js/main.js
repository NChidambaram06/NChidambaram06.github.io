// console.log("Hello world");
d3.csv("data/national_health_data.csv")
  .then((data) => {
    // console.log("Data loading complete. Work with dataset. HI THERE");
    // console.log(data);

    //process the data - this is a forEach function.  You could also do a regular for loop....
    data.forEach((d) => {
      // //ARROW function - for each object in the array, pass it as a parameter to this function
      // d.cost = +d.cost; // convert string 'cost' to number
      // d.daysFromYrStart = computeDays(d.start); //note- I just created this field in each object in the array on the fly
      // let tokens = d.start.split("-");
      // d.year = +tokens[0];
      // console.log("poverty: ", d.poverty_perc);
      // console.log("edu: ", d.education_less_than_high_school_percent);
      // console.log("name: ", d.display_name);
      // d.poverty_perc = +d.poverty_perc;
      // d.education_less_than_high_school_percent =
      //   +d.education_less_than_high_school_percent;
    });

    // Create an instance (for example in main.js)
    let scatter2 = new Scatter2(
      {
        parentElement: "#scatter2",
        containerHeight: 500,
        containerWidth: window.innerWidth / 3 - 15,
        x_data: document.querySelector("#attribute_1").value,
        y_data: document.querySelector("#attribute_2").value,
      },
      data
    );

    // let scatter = new Scatter(
    //   {
    //     parentElement: "#scatter",
    //     containerHeight: 500,
    //     containerWidth: 750,
    //     x_data: document.querySelector("#attribute_1").value,
    //     y_data: document.querySelector("#attribute_2").value,
    //   },
    //   data
    // );

    let histogram = new HistogramCopy(
      {
        parentElement: "#histogram",
        containerHeight: 500,
        containerWidth: window.innerWidth / 3 - 15,
        x_data: document.querySelector("#attribute_1").value,
        tooltipPadding: 30,
      },
      data
    );

    let histogram2 = new HistogramCopy(
      {
        parentElement: "#histogram2",
        containerHeight: 500,
        containerWidth: window.innerWidth / 3 - 15,
        x_data: document.querySelector("#attribute_2").value,
        tooltipPadding: 30,
      },
      data
    );

    makeChoropleth(document.querySelector("#attribute_1").value);
    makeChoropleth(document.querySelector("#attribute_2").value);

    document
      .querySelector("#attribute_1")
      .addEventListener("change", updateVisualizations);
    document
      .querySelector("#attribute_2")
      .addEventListener("change", updateVisualizations);

    function updateVisualizations() {
      // scatter2.x_data = document.querySelector(".attribute_1").value;
      // scatter2.y_data = document.querySelector(".attribute_2").value;
      // scatter2.updateVis();

      // histogram = new HistogramCopy(
      //   {
      //     parentElement: "#histogram",
      //     containerHeight: 500,
      //     containerWidth: 750,
      //     x_data: document.querySelector("#attribute_1").value,
      //     tooltipPadding: 30,
      //   },
      //   data
      // );

      // histogram2 = new HistogramCopy(
      //   {
      //     parentElement: "#histogram2",
      //     containerHeight: 500,
      //     containerWidth: 750,
      //     x_data: document.querySelector("#attribute_2").value,
      //     tooltipPadding: 30,
      //   },
      //   data
      // );
      d3.selectAll("svg").remove();
      document.getElementById("row1").innerHTML = `<svg id="histogram"></svg>
      <svg id="scatter2"></svg>
      <svg id="histogram2"></svg>`;

      let scatter2 = new Scatter2(
        {
          parentElement: "#scatter2",
          containerHeight: 500,
          containerWidth: window.innerWidth / 3 - 15,
          x_data: document.querySelector("#attribute_1").value,
          y_data: document.querySelector("#attribute_2").value,
        },
        data
      );
      // console.log(scatter2);

      let histogram = new HistogramCopy(
        {
          parentElement: "#histogram",
          containerHeight: 500,
          containerWidth: window.innerWidth / 3 - 15,
          x_data: document.querySelector("#attribute_1").value,
          tooltipPadding: 30,
        },
        data
      );

      let histogram2 = new HistogramCopy(
        {
          parentElement: "#histogram2",
          containerHeight: 500,
          containerWidth: window.innerWidth / 3 - 15,
          x_data: document.querySelector("#attribute_2").value,
          tooltipPadding: 30,
        },
        data
      );

      updateChoropleth(document.querySelector("#attribute_1").value);
      updateChoropleth(document.querySelector("#attribute_2").value);
    }
  })
  .catch((error) => {
    console.error("Error loading the data: ", error);
  });

function makeChoropleth(attribute) {
  Promise.all([
    d3.json("data/counties-10m.json"),
    d3.csv("data/national_health_data.csv"),
  ])
    .then((data) => {
      const geoData = data[0];
      const countyPopulationData = data[1];

      // Combine both datasets by adding the population density to the TopoJSON file
      // console.log(geoData);
      geoData.objects.counties.geometries.forEach((d) => {
        // console.log(d);
        for (let i = 0; i < countyPopulationData.length; i++) {
          if (d.id === countyPopulationData[i].cnty_fips) {
            switch (attribute) {
              case "poverty_perc":
                d.properties.pop = +countyPopulationData[i].poverty_perc;
                break;
              case "median_household_income":
                d.properties.pop =
                  +countyPopulationData[i].median_household_income;
                break;
              case "education_less_than_high_school_percent":
                d.properties.pop =
                  +countyPopulationData[i]
                    .education_less_than_high_school_percent;
                break;
              case "air_quality":
                d.properties.pop = +countyPopulationData[i].air_quality;
                break;
              case "park_access":
                d.properties.pop = +countyPopulationData[i].park_access;
                break;
              case "percent_inactive":
                d.properties.pop = +countyPopulationData[i].percent_inactive;
                break;
              case "percent_smoking":
                d.properties.pop = +countyPopulationData[i].percent_smoking;
                break;
              case "urban_rural_status":
                switch (countyPopulationData[i].urban_rural_status) {
                  case "Rural":
                    d.properties.pop = +100;
                  case "Suburban":
                    d.properties.pop = +200;
                  case "Small City":
                    d.properties.pop = +300;
                  case "Urban":
                    d.properties.pop = +400;
                }
                break;
              case "elderly_percentage":
                d.properties.pop = +countyPopulationData[i].elderly_percentage;
                break;
              case "number_of_hospitals":
                d.properties.pop = +countyPopulationData[i].number_of_hospitals;
                break;
              case "number_of_primary_care_physicians":
                d.properties.pop =
                  +countyPopulationData[i].number_of_primary_care_physicians;
                break;
              case "percent_no_heath_insurance":
                d.properties.pop =
                  +countyPopulationData[i].percent_no_heath_insurance;
                break;
              case "percent_high_blood_pressure":
                d.properties.pop =
                  +countyPopulationData[i].percent_high_blood_pressure;
                break;
              case "percent_coronary_heart_disease":
                d.properties.pop =
                  +countyPopulationData[i].percent_coronary_heart_disease;
                break;
              case "percent_stroke":
                d.properties.pop = +countyPopulationData[i].percent_stroke;
                break;
              case "percent_high_cholesterol":
                d.properties.pop =
                  +countyPopulationData[i].percent_high_cholesterol;
                break;
            }
          }
        }
      });
      console.log("geodata", geoData);

      const choroplethMap = new ChoroplethMap(
        {
          parentElement: ".viz",
          containerWidth: window.innerWidth / 2 - 20,
        },
        geoData
      );
    })
    .catch((error) => console.error(error));
}

function updateChoropleth(attribute) {
  Promise.all([
    d3.json("data/counties-10m.json"),
    d3.csv("data/national_health_data.csv"),
  ])
    .then((data) => {
      const geoData = data[0];
      const countyPopulationData = data[1];

      // Combine both datasets by adding the population density to the TopoJSON file
      // console.log(geoData);
      geoData.objects.counties.geometries.forEach((d) => {
        // console.log(d);
        for (let i = 0; i < countyPopulationData.length; i++) {
          if (d.id === countyPopulationData[i].cnty_fips) {
            switch (attribute) {
              case "poverty_perc":
                d.properties.pop = +countyPopulationData[i].poverty_perc;
                break;
              case "median_household_income":
                d.properties.pop =
                  +countyPopulationData[i].median_household_income;
                break;
              case "education_less_than_high_school_percent":
                d.properties.pop =
                  +countyPopulationData[i]
                    .education_less_than_high_school_percent;
                break;
              case "air_quality":
                d.properties.pop = +countyPopulationData[i].air_quality;
                break;
              case "park_access":
                d.properties.pop = +countyPopulationData[i].park_access;
                break;
              case "percent_inactive":
                d.properties.pop = +countyPopulationData[i].percent_inactive;
                break;
              case "percent_smoking":
                d.properties.pop = +countyPopulationData[i].percent_smoking;
                break;
              case "urban_rural_status":
                switch (countyPopulationData[i].urban_rural_status) {
                  case "Rural":
                    d.properties.pop = +100;
                  case "Suburban":
                    d.properties.pop = +200;
                  case "Small City":
                    d.properties.pop = +300;
                  case "Urban":
                    d.properties.pop = +400;
                }
                break;
              case "elderly_percentage":
                d.properties.pop = +countyPopulationData[i].elderly_percentage;
                break;
              case "number_of_hospitals":
                d.properties.pop = +countyPopulationData[i].number_of_hospitals;
                break;
              case "number_of_primary_care_physicians":
                d.properties.pop =
                  +countyPopulationData[i].number_of_primary_care_physicians;
                break;
              case "percent_no_heath_insurance":
                d.properties.pop =
                  +countyPopulationData[i].percent_no_heath_insurance;
                break;
              case "percent_high_blood_pressure":
                d.properties.pop =
                  +countyPopulationData[i].percent_high_blood_pressure;
                break;
              case "percent_coronary_heart_disease":
                d.properties.pop =
                  +countyPopulationData[i].percent_coronary_heart_disease;
                break;
              case "percent_stroke":
                d.properties.pop = +countyPopulationData[i].percent_stroke;
                break;
              case "percent_high_cholesterol":
                d.properties.pop =
                  +countyPopulationData[i].percent_high_cholesterol;
                break;
            }
          }
        }
      });
      console.log("geodata", geoData);

      // document.getElementById(".choroDiv").innerHTML = `<div class="viz"></div>

      //   <svg height="5" width="5" xmlns="http://www.w3.org/2000/svg" version="1.1">
      //     <defs>
      //       <pattern
      //         id="lightstripe"
      //         patternUnits="userSpaceOnUse"
      //         width="5"
      //         height="5"
      //       >
      //         <image
      //           xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc1JyBoZWlnaHQ9JzUnPgogIDxyZWN0IHdpZHRoPSc1JyBoZWlnaHQ9JzUnIGZpbGw9J3doaXRlJy8+CiAgPHBhdGggZD0nTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVonIHN0cm9rZT0nIzg4OCcgc3Ryb2tlLXdpZHRoPScxJy8+Cjwvc3ZnPg=="
      //           x="0"
      //           y="0"
      //           width="5"
      //           height="5"
      //         ></image>
      //       </pattern>
      //     </defs>
      //   </svg>`;

      choroplethMap = new ChoroplethMap(
        {
          parentElement: ".viz",
          containerWidth: window.innerWidth / 2 - 20,
        },
        geoData
      );
    })
    .catch((error) => console.error(error));
}
