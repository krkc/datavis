// Bootstrap dropdown menu action
$(document).ready(function(){
    $('.dropdown-toggle').dropdown()
});

// Page variables
var menuPopulated = false;

// Data Variables
var meanMap = {};
var countMap = {};


// Chart variables
var width = 960,
    height = 500;

var margin = {top: 20, right: 30, bottom: 50, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Parse data and begin visualization
var d3_dataset = d3.csv("/data/IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.CSV", filterRows, function (data) {
    var ageGroupsLabelsMap = d3.map(data, function(d) { return d.ageGroupId; });
    var ageGroupLabels = ageGroupsLabelsMap.values().map(function(d) { return d.ageGroupId; });

    var nestGen = d3.nest();
    var meansNestedByLocationAgeGroupId = nestGen
        .key(function(d) { return d.location; })
        .key(function(d) { return d.ageGroupId })
        .rollup(function(d) { return d3.mean(d, function(s) { return +s.prevalence; }); })
        .entries(data);

    // console.log(meansNestedByLocationAgeGroupId);
    // meansNestedByLocationAgeGroupId[0].values.forEach(function(d) { console.log(d);});

    if (!menuPopulated) {
        // Populate the dropdown menu
        d3.select("ul").selectAll(".scrollable-menu")
            .data(meansNestedByLocationAgeGroupId)
            .enter().append("li")
            .append("a")
            .attr("href", function(d, i) { return "javascript:refreshBars(" + i + ")" })
            .text(function(d) { return d.key; })
        menuPopulated = true;
    }


    // -- Visualize the data -- //
    var barWidth = width / ageGroupsLabelsMap.keys().length;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0,width],.1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    x.domain(ageGroupLabels);
    y.domain([0, d3.max(data, function(d) { return +d.prevalence; })]);

    // translate x-axis' vertical position
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .style("text-anchor", "middle")
        .text("Age Group");

    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -(height / 2))
        .style("text-anchor", "middle")
        .text("Obesity Prevalence");

    chart.selectAll(".bar")
        .data(meansNestedByLocationAgeGroupId[0].values)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(+d.key); })
        .attr("y", function(d) { return y(+d.values); })
        .attr("height", function(d) { return height - y(+d.values); })
        .attr("width", x.rangeBand());

});

function filterRows(d) {
    return { location: d.location_name, ageGroupId: d.age_group_id, ageGroup: d.age_group, prevalence: d.mean };
}

function refreshBars(countryIndex) {
    chart.selectAll("rect").remove();
    // Redraw data
    visualizeData(countryIndex);
}

function visualizeData(countryIndexToVisualize) {

}