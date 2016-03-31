// Bootstrap dropdown menu action
$(document).ready(function(){
    $('.dropdown-toggle').dropdown()
});

// Page variables
var menuPopulated = false;
var countryIndexSelected = 0;

// Data Variables
var data;
var ageGroupsLabelsMap;
var ageGroupLabels;
var meansNestedByLocationAgeGroupId;


// Chart variables
var wWidth, wHeight, width, height, chart,
    margin = {top: 20, right: 20, bottom: 50, left: 50};

// Parse data and begin visualization
var d3_dataset = d3.csv("/data/IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.CSV", filterRows, function (_data) {
    data = _data;
    ageGroupsLabelsMap = d3.map(data, function(d) { return d.ageGroupId; });
    ageGroupLabels = ageGroupsLabelsMap.values().map(function(d) { return d.ageGroupId; });

    var nestGen = d3.nest();
    meansNestedByLocationAgeGroupId = nestGen
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
            .attr("href", function(d, i) { return "javascript:setCountry(" + i + ")" })
            .text(function(d) { return d.key; })
        menuPopulated = true;
    }

    // Get window size and create chart of that size
    drawChart(0);
    $(window).resize(drawChart);
});

function filterRows(d) {
    return { location: d.location_name, ageGroupId: d.age_group_id, ageGroup: d.age_group, prevalence: d.mean };
}


// -- datavis Functions -- //


function drawChart() {
    wWidth = $(".container").width();
    wHeight = window.innerHeight * 0.75;

    width = wWidth - margin.left - margin.right;
    height = wHeight - margin.top - margin.bottom;

    if (chart) {
        chart.remove()
    }

    chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    drawData(0);
}

function setCountry(selectedIndex) {
    countryIndexSelected = selectedIndex;
    drawData();
}

function drawData() {

    chart.selectAll("rect, .chart_heading").remove();

    chart.append("text")
        .attr("class", "chart_heading")
        .attr("x", (width) / 2)
        .attr("y", 10)
        .text("Obesity Rate vs Age, " + meansNestedByLocationAgeGroupId[countryIndexSelected].key)

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
        .data(meansNestedByLocationAgeGroupId[countryIndexSelected].values)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(+d.key); })
        .attr("y", function(d) { return y(+d.values); })
        .attr("height", function(d) { return height - y(+d.values); })
        .attr("width", x.rangeBand());
}