// Bootstrap dropdown menu action
$(document).ready(function(){
    $('.dropdown-toggle').dropdown()
});

// Page variables
var menuPopulated = false;

// Chart variables
var ch = new BarChart();

// Parse data and begin visualization
var d3_dataset = d3.csv("/data/IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.CSV", filterRows, function (_data) {
    ch.data = _data;

    $("#splash").remove();
    ch.ageGroupsLabelsMap = d3.map(ch.data, function(d) { return d.ageGroup; });
    ch.ageGroupLabelIds = ch.ageGroupsLabelsMap.values().map(function(d) { return d.ageGroupId; });
    ch.ageGroupLabels = ch.ageGroupsLabelsMap.values().map(function(d) { return d.ageGroup; });
    
    var nestGen = d3.nest();
    ch.meansNestedByLocationAgeGroupId = nestGen
        .key(function(d) { return d.location; })
        .key(function(d) { return d.ageGroupId; })
        .rollup(function(d) { return d3.mean(d, function(s) { return +s.prevalence; }); })
        .entries(ch.data);

    // console.log(ch.meansNestedByLocationAgeGroupId);
    // ch.meansNestedByLocationAgeGroupId[0].values.forEach(function(d) { console.log(d);});

    if (!menuPopulated) {
        $(".dropdown-button").show();
        // Populate the dropdown menu
        d3.select("ul").selectAll(".scrollable-menu")
            .data(ch.meansNestedByLocationAgeGroupId)
            .enter().append("li")
            .append("a")
            .attr("href", function(d, i) { return "javascript:setCountry('" + i + "')" })
            .text(function(d) { return d.key; })
        menuPopulated = true;
    }

    // Get window size and create chart of that size
    ch.drawChart();
    drawLegend();
    $(window).resize(function() { ch.drawChart()});
});

function filterRows(d) {
    return { location: d.location_name, ageGroupId: d.age_group_id, ageGroup: d.age_group, sex: d.sex, prevalence: d.mean };
}


function setCountry(selectedIndex) {
    ch.drawData(selectedIndex);
}

function drawLegend() {

}