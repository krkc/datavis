/**
 * This class builds a bar chart for display obesity data
 * @constructor
 */
function BarChart() {
    // Chart variables
    this.wWidth = 0;        /* Browser window width */
    this.wHeight = 0;       /* Browser window height */
    this.width = 0;         /* Chart width */
    this.height = 0;        /* Chart height */
    this.chart = null;      /* D3 Chart object */
    this.x = null;
    this.y = null;
    this.margin = {
        top: 30,
        bottom: 150,
        left: 50,
        right: 20
    };                      /* Chart margins */
    this.data = null;       /* D3 parsed CSV data */
    this.countryIndexSelected = 0;  /* Which country to display data for */
    this.ageGroupsLabelsMap = null; /* Map of data sorted by age group */
    this.ageGroupLabelIds = null;     /* Age group labels */
    this.ageGroupLabels = null;
    this.meansNestedByLocationAgeGroupId = null;    /* Nested data (i.e.: Location.AgeGroup.Sex) */
}

    /**
     * This method sets up the chart size dynamically based on the
     *  page dimensions
     *
     * @param countryIndex - Which country to display data for
     */
    BarChart.prototype.drawChart = function (countryIndex) {
        if (countryIndex) this.countryIndexSelected = countryIndex;
        var self = this;    /* To keep the right context in nested functions */

        this.wWidth = $(".container").width();
        this.wHeight = window.innerHeight * 0.75;

        this.width = this.wWidth - this.margin.left - this.margin.right;
        this.height = this.wHeight - this.margin.top - this.margin.bottom;

        if (this.chart !== null && this.chart !== undefined) {
            this.chart.remove()
        }

        this.chart = d3.select(".chart")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.chart.selectAll(".chart_heading").remove();

        this.x = d3.scale.ordinal()
            .rangeRoundBands([0,this.width],.1);

        this.y = d3.scale.linear()
            .range([this.height, 0]);

        var xAxis = d3.svg.axis()
            .scale(this.x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(this.y)
            .orient("left")
            .tickFormat(d3.format(".0%"));

        this.x.domain(this.ageGroupLabelIds);
        this.y.domain([0, d3.max(this.data, function(d) { return +d.prevalence; })]);

        // -- Draw heading -- //
        this.chart.append("text")
            .attr("class", "chart_heading")
            .attr("x", (this.width) / 2 - (this.margin.left / 2))
            .attr("y", 10)
            .text("Obesity Rate vs Age, " + this.meansNestedByLocationAgeGroupId[this.countryIndexSelected].key);

        // -- Draw axes & labels -- //

        // translate x-axis' vertical position
        this.chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start")
            .attr("x", 10)
            .attr("y", -1)
            .text(function(d, i) { return self.ageGroupLabels[i]; });
        this.chart
            .append("text")
            .attr("x", this.width / 2 - (this.margin.left / 2))
            .attr("y", this.height + 120)
            .style("text-anchor", "middle")
            .text("Age Groups");

        this.chart.append("g")
            .attr("class", "y axis")
            .call(yAxis);
        this.chart
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", -(this.height / 2))
            .style("text-anchor", "middle")
            .text("Obesity Prevalence");

        // Draw the bars representing the data
        this.drawData();
    };

    /**
     * This method draws the axes, labels, and bars for the chart
     *
     * @param countryIndex - Which country to display data for
     */
    BarChart.prototype.drawData = function (countryIndex) {
        if (countryIndex) this.countryIndexSelected = countryIndex;
        var self = this;    /* To keep the right context in nested functions */

        // -- Draw bars -- //

        // Bind .bar elements to data
        var bars = this.chart.selectAll(".bar")
            .data(this.meansNestedByLocationAgeGroupId[this.countryIndexSelected].values);
        // Back out to the parent node (g), shrink and remove any
        //  bars left from last draw.
        // fill-opacity value explained here:
        // https://github.com/mbostock/d3/wiki/Transitions#d3_interpolateNumber
        bars.exit()
            .transition()
            .duration(300)
            .attr("y", self.y(0))
            .attr("height", self.height - self.y(0))
            .style('fill-opacity', 1e-6)
            .remove();
        // Enter into the data yet to be bound and bind each to a rect
        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("y", self.y(0))
            .attr("height", self.height - self.y(0));
        // Define all .bar element transitions
        bars
            .transition()
            .duration(300)
            .ease("quad")
            .attr("x", function(d) { return self.x(+d.key); })
            .attr("y", function(d) { return self.y(+d.values); })
            .attr("height", function(d) { return self.height - +self.y(+d.values); })
            .attr("width", self.x.rangeBand());
    };
