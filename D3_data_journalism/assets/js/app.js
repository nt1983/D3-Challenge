var svgWidth = 1000;
var svgHeight = 550;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis="healthcare";
var xLabel = ["poverty", "age", "income"];   
var yLabel = ["obesity", "smokes", "healthcare"];

// function used for updating x-scale var upon click on axis label
function xScale(weightdata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(weightdata, d => d[chosenXAxis]) * 0.8,
      d3.max(weightdata, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// Function used for updating text in circles group with a transition to new text.
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circletextGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis])); 
  return circletextGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "In Poverty (%)";
  }
  else if (chosenXAxis==="income"){
    var xlabel = "Household Incom (Median)";
  }
  else {var xlabel="Age (Median)";}

  if (chosenYAxis==="obese") {
    var ylabel="Obese (%)";
  }
  else if (chosenYAxis==="smokes") {
    var ylabel="Smokes (%)";
  }
  else {var ylabel="Lacks Healthcare (%)";}

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([90, -60])
    .html(function(d) {
      if (chosenXAxis==="age"){
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
      }
      else if (chosenXAxis!== "poverty" && chosenXAxis!=="age") {
      return (`${d.state}<br>${label}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
      }
      else {return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);}
    });

    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
    }).on("mouseout",function(data,index){
    toolTip.hide(data)
    });
    return circlesGroup;
  }

  d3.csv("\data\data.csv").then(function(healthdata, err) {
    if (err) throw err;
    
  // parse data
  hairData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income= +data.income;
    data.smokes= +data.smokes;
    data.obesity= +data.obesity;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthdata, chosenXAxis);
  var yLinearScale = xScale(healthdata, chosenYAxis);

  // Create x & y scale function
  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(hairData, d => d.num_hits)])
  //   .range([height, 0]);

   // Create initial axis functions
   var bottomAxis = d3.axisBottom(xLinearScale);
   var leftAxis = d3.axisLeft(yLinearScale);

   // append x axis
  var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .attr("transform", `translate(${width}, 0)`)
  .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthdata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", "0.75");

    // Create group for x-axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
  var healthcareLabel=labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left)*2)
    .attr("y", 0 - (height +15))
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    var smokeLabel=labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left)*2)
    .attr("y", 0 - (height +30))
    .attr("value", "smokes")
    .classed("active", true)
    .text("Smokes (%)");

    var obeseLabel=labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left)*2)
    .attr("y", 0 - (height +45))
    .attr("value", "obesity")
    .classed("active", true)
    .text("Obese (%)");

 
      // Add State text to circles, offset to y
      var circletextGroup = chartGroup.selectAll()
      .data(healthData)
      .enter()
      .append("text")
      .text(d => (d.abbr))
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .style("font-size", "11px")
      .style("text-anchor", "middle")
      .style('fill', 'black');

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      console.log(value);
      if (value === "poverty" || value==="age" || value==="income") {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // updates x scale for new data
        xLinearScale = xScale(healthdata, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "pverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis==="age"){
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else {
          povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
        }
      }
      if (value === "poverty" || value==="age" || value==="income") {
        
        
      } 
    });
}).catch(function(error) {
  console.log(error);
});
