// Establishing the SVG parameters required for data visualisation
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

// Creating an SVG group that can be appended to the HTML document

// Declaring the SVG variable and setting the dimensions for the graphics
var svg = d3
    .select("#scatter") // The ID tag in the html document
    .append("svg")
    .attr("width", svgWidth) // Dimensions of the SVG have been established
    .attr("height", svgHeight); // As above

// Appending all the elements together in the SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Establishing the Initial x and y axis
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

/*------------------------------------ FUNCTIONS ------------------------------------ */
function xScale(healthData, chosenXAxis) {
    // Establishing the x axis scales (when different data are selected, the axis will change automatically)

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8, d3.max(healthData, d => d[chosenXAxis]) * 1.2])
        .range([0,width])

    return xLinearScale;
}

function yScale(healthData, chosenYAxis) {
    // As with the previous function, the y axis scales will be set up automatically when a different parameter is selected
    
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) - 1, d3.max(healthData, d => d[chosenYAxis]) + 1])
        .range([0,width])

    return yLinearScale;
}

// Animating the transition of the axis when a new variable is selected
function renderXaxis(newXScale, xAxis) {

    // assigning the bottom axis labels
    var bottomAxis = d3.axisBottom(newXScale);

    //Animating the transition
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;

}

function renderYaxis(newYScale, yAxis) {

    // assigning the bottom axis labels
    var leftAxis = d3.axisLeft(newYScale);

    //Animating the transition
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;

}

/*The next function will allow the circles, which represent the scatter plot, to transition when the axes
are changed */

function renderXCircles(circlesGroup, newXScale, chosenXAxis){

    // Animating the transition of the circles
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    
    return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis){

    // Animating the transition of the circles
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
    return circlesGroup;
}

function renderXText(circlesGroup, newXScale, chosenXAxis) {

    // Animating the transition of the text
    circlesGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));
    
    return circlesGroup;
}

function renderYText(circlesGroup, newYScale, chosenYAxis) {

    // animating the text transition
    circlesGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]));
    
    return circlesGroup;
}

// This function will update the circles with new information when the mouse hovers over the datapoints
function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
    
    var xlabel;

    if (chosenXAxis === 'poverty'){

        xlabel = "Poverty(%)";
    }

    else if (chosenXAxis === 'income') {

        xlabel = "Median Income";
    }

    else {

        xlabel === "Median Age";
    }

    var ylabel;

    if (chosenYAxis === 'healthcare') {

        ylabel = "Access to Healthcare";
    }

    else if (chosenYAxis === "smokes") {
        
        ylabel = "Median Smoking Rate";
    }

    else {

        label = "Obesity Rates";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([50,-75])
        .html(function(d){

            return (`${d.state}<br><hr>${xlabel}<br><hr>${d[chosenXAxis]}<br><hr>${ylabel}<br><hr>${d[chosenYAxis]}`)

        })
    
    circlesGroup.call(toolTip);

    // Event Change when mouse hovers over the data point
    circlesGroup.on("mouseover", function(stateData) {
        toolTip.show(stateData);
        
    })
    .on("mouseout", function(stateData) {
        toolTip.hide(stateData);
    })

    return circlesGroup;
}

/* Reading into the CSV data to plot the initial values */
d3.csv("assets/data/data.csv").then(function(healthData){

    console.log(healthData);

    //Iterating over the datasets

    healthData.forEach(function(data){
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    /* Setting the initial scales for the plot and calling on the previous created xScale 
    and yScale functions */

    var xLinearScale = xScale(healthData, chosenXAxis); // The original chosenXAxis is poverty
    var yLinearScale = yScale(healthData, chosenYAxis); // The original chosenYAxis is healthcare

    // Setting up the initial axis parameters
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Adding the x and y axis to the chartgroup variable created earlier
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(bottomAxis);
    
    var yAxis = chartGroup.append("g")
        .call(leftAxis);
    
    // Creating a scatter plot with the circle shapes
    var groupedCircles = chartGroup.selectAll("g")
        .data(healthData)
        .enter()
        .append("g")
    
    var XYCircles = groupedCircles.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .classed("stateCircle", true);
    
    // Adding the state abbreviations to the text
    var stateAbbrevTxT = groupedCircles.append("text")
        .text(d => d.abbr) // state abbreviations are added to the circle
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]))
        .classed("stateText", true)
    
    // Creating two groups of three x and y axis labels so that user can toggle between the six
    var groupXLabels = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height})`);
    
    // Selected groups in the x-axis are poverty, income and age
    var povertyLabel = groupXLabels.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "poverty")// <-- This will obtain the value relating to poverty rates
        .text("Poverty Rates")
        .classed("active", true);

    var ageLabel = groupXLabels.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "age")// <-- This will obtain the value relating to age rates
        .text("Median Age")
        .classed("inactive", true);

    var incomeLabel = groupXLabels.append("text")
        .attr("x", 0)
        .attr("y", 80)
        .attr("value", "income")// <-- This will obtain the value relating to income 
        .text("Poverty Rates")
        .classed("active", true);
    
    // Selected Groups for the y-axis are healthcare, obesity and smoking

    var groupYLabels = chartGroup.append("g");

    var healthcareLabel = groupYLabels.append("text")
        .attr("transform", `rotate(-90)`) // This will rotate the labels and fit along the y axis
        .attr("x", -(height/2)) // The negative sign and dividing by two ensures that the labels are halfway from the top
        .attr("y", -40)
        .attr("value", "healthcare")
        .text("% with no Healthcare")
        .classed("active", true);

    var smokesLabel = groupYLabels.append("text")
        .attr("transform", `rotate(-90)`) // This will rotate the labels and fit along the y axis
        .attr("x", -(height/2)) // The negative sign and dividing by two ensures that the labels are halfway from the top
        .attr("y", -60)
        .attr("value", "smokes")
        .text("% of Smokers")
        .classed("inactive", true);
    
    var obesityLabel = groupYLabels.append("text")
        .attr("transform", `rotate(-90)`) // This will rotate the labels and fit along the y axis
        .attr("x", -(height/2)) // The negative sign and dividing by two ensures that the labels are halfway from the top
        .attr("y", -80)
        .attr("value", "obesity")
        .text("% of Obese people")
        .classed("inactive", true);
    
    // Setting up the initial tooltips
    groupedCircles = updateToolTip(groupedCircles, chosenXAxis, chosenYAxis);

    // Event changes in a user clicks on age or income on the x axis from the initial data set for poverty
    
    



})