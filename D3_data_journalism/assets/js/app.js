var svgWidth = 960;
var svgHeight = 500;

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
//var xLabel = ["poverty", "age", "income"];   
//var yLabel = ["obesity", "smokes", "healthcare"];

// function used for updating x-scale var upon click on axis label
function xScale(weightdata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(weightdata, d => d[chosenXAxis]) * 0.8,
      d3.max(weightdata, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);
  return xLinearScale;
}

// function used for updating x-scale var upon click on axis label
function yScale(weightdata, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(weightdata, d => d[chosenYAxis]) * 0.8,
      d3.max(weightdata, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);
  return yLinearScale;
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
    var xlabel = "Poverty ";
  }
  else if (chosenXAxis==="income"){
    var xlabel = "Median Income ";
  }
  else {var xlabel="Age ";}

  if (chosenYAxis==="obesity") {
    var ylabel="Obesity ";
  }
  else if (chosenYAxis==="smokes") {
    var ylabel="Smokes ";
  }
  else {var ylabel="Lacks Healthcare ";}

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .style("background", "black")
    .style("color", "white")
    .offset([80, -60])
    .html(function(d) {
      console.log(chosenXAxis, xlabel, chosenYAxis, ylabel);
      if (chosenXAxis==="age"){
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
      }
      else if (chosenXAxis!== "poverty" && chosenXAxis!=="age") {
      return (`${d.state}<br>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
      }
      else {return (`${d.state}<br>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);}
    });

    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function(data) {
    d3.select(this).transition().duration(1000).style("stroke", "black");
    toolTip.show(data,this);
    }).on("mouseout",function(data,index){
      d3.select(this).transition().duration(1000).style("stroke", "none");
    toolTip.hide(data)
    });
    return circlesGroup;
  }

  d3.csv("assets/data/data.csv").then(function(healthdata, err) {
    if (err) throw err;
    
  // parse data
  healthdata.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income= +data.income;
    data.smokes= +data.smokes;
    data.obesity= +data.obesity;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthdata, chosenXAxis);
  var yLinearScale = yScale(healthdata, chosenYAxis);

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
  .classed("y-axis", true).call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthdata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("fill", "lightblue")
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
    .attr("y", 0 - (height +40))
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    var smokeLabel=labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left)*2)
    .attr("y", 0 - (height +60))
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");

    var obeseLabel=labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left)*2)
    .attr("y", 0 - (height +80))
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obese (%)");

 
      // Add State text to circles, offset to y
      var circletextGroup = chartGroup.selectAll()
      .data(healthdata)
      .enter()
      .append("text")
      .text(d => (d.abbr))
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .style("font-size", "8px")
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
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // Update circles text with new values.
        circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // changes classes to bold text
        if (chosenXAxis === "poverty") {
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
      if (value === "healthcare" || value==="smokes" || value==="obesity") {
        chosenYAxis = value;
        // Update y scale for new data.
        yLinearScale = yScale(healthdata, chosenYAxis);

        // Updates y axis with transition.
        yAxis = renderYAxes(yLinearScale, yAxis);

        // Update circles with new x values.
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // Update tool tips with new info.
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // Update circles text with new values.
        circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        
        // Changes classes to bold text.
        if (chosenYAxis === "healthcare") {

          healthcareLabel
              .classed("active", true)
              .classed("inactive", false);


          smokeLabel
              .classed("active", false)
              .classed("inactive", true);

          obeseLabel
              .classed("active", false)
              .classed("inactive", true);
            }
          else if (chosenYAxis==="smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);


          smokeLabel
              .classed("active", true)
              .classed("inactive", false);

          obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        else {
          healthcareLabel
              .classed("active", false)
              .classed("inactive", true);


          smokeLabel
              .classed("active", false)
              .classed("inactive", true);

          obeseLabel
              .classed("active", true)
              .classed("inactive", false);
        }
      } 
    });
}).catch(function(error) {
  console.log(error);
});
