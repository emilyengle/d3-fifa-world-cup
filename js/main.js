
// SVG drawing area
let margin = {top: 40, right: 40, bottom: 60, left: 60};
let width = 600 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
let svg = d3.select("#chart-area").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Date parser
let formatDate = d3.timeFormat("%Y");
let parseDate = d3.timeParse("%Y");
// Initialize data
loadData();
// FIFA world cup
let data;

const beginYearInput = document.getElementById('begin-year')
const endYearInput = document.getElementById('end-year')

// Event listener for select
document.getElementById('data-select').addEventListener('change', e => {
	console.log('Selected new attr: ', e.target.value)
	updateVisualization(e.target.value, parseDate(beginYearInput.value), parseDate(endYearInput.value))
})

document.getElementById('filter-chart').addEventListener('click', e => {
	console.log('Clicked filter: ', e.target.value)
	updateVisualization(document.getElementById('data-select').value, parseDate(beginYearInput.value), parseDate(endYearInput.value))
})

// Load CSV file
function loadData() {
	d3.csv("https://gist.githubusercontent.com/emilyengle/653579f8e79ce802add42bcd0ef40abb/raw/bda1c73363eca4821cd35c5a83e67aa23a893509/fifa-cup.csv", row => {
		row.YEAR = parseDate(row.YEAR);
		row.TEAMS = +row.TEAMS;
		row.MATCHES = +row.MATCHES;
		row.GOALS = +row.GOALS;
		row.AVERAGE_GOALS = +row.AVERAGE_GOALS;
		row.AVERAGE_ATTENDANCE = +row.AVERAGE_ATTENDANCE;
		return row
	}).then(csv => {

		// Store csv data in global variable
		data = csv;

		beginYearInput.value = formatDate(d3.min(data, function(d) { return d.YEAR; }))
		endYearInput.value = formatDate(d3.max(data, function(d) { return d.YEAR; }))

		// Draw the visualization for the first time
		updateVisualization("GOALS", d3.min(data, function(d) { return d.YEAR; }), d3.max(data, function(d) { return d.YEAR; }));
	});
}

// Render visualization
function updateVisualization(yAttributeToUse, minYear, maxYear) {
	console.log(data);

	const t = d3.transition()
    .duration(800)
    .ease(d3.easeLinear);

	// Remove existing line and axes to enable changing data
	svg.selectAll('.line').transition(t).remove()
	svg.selectAll('circle').transition(t).remove()
	svg.selectAll('.x-axis').transition(t).remove()
	svg.selectAll('.y-axis').transition(t).remove()

	// Filter data based on min and maxYear
	const filteredData = data.filter(d => d.YEAR >= minYear && d.YEAR <= maxYear)

	// Set up axes
	var xScale = d3.scaleTime()
        .domain([
            minYear,
          	maxYear
        ])
        .range([0, width]);
  var yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, function(d) { return d[yAttributeToUse] })])
      .range([height, 0]);

	var xAxis = d3.axisBottom().tickFormat(d3.timeFormat("%Y")).scale(xScale);
  var yAxis = d3.axisLeft().scale(yScale);

	svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
    svg.append("g")
				.transition(t)
        .attr("class", "axis y-axis")
        .call(yAxis);

	// Set up and append line
	var line = d3.line()
  	.x(function(d) { return xScale(d.YEAR);})
  	.y(function(d) { return yScale(d[yAttributeToUse]);})
		.curve(d3["curveLinear"])
	svg.append("path")
		.transition(t)
	  .attr("d", line(filteredData))
		.attr("class", "line")

	// Set up and append circles
	const circles = svg.append("g")
		.selectAll("circle")
    .data(filteredData)
    .enter()
    .append("circle")
		.transition(t)
    .attr("cx", function(d) {
        return xScale(d.YEAR)
    })
    .attr("cy", function(d) { return yScale(d[yAttributeToUse]) })
    .attr("r", function(d) { return 5 })
		.attr("fill", "black")
		.attr("id", function(d, i) { return i });

	svg.selectAll('circle').on("click", e => {
		showEdition(data[e.srcElement.id])
	})
}

// Show details for a specific FIFA World Cup
function showEdition(d){
	document.getElementById('edition-EDITION').innerText = d.EDITION
	document.getElementById('edition-WINNER').innerText = d.WINNER
	document.getElementById('edition-GOALS').innerText = d.GOALS
}
