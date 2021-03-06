export const name = 'hBar';


export function hBar(data) {
    function customYAxis(g) {
        g.call(d3.axisLeft(y0));
        g.select(".domain").remove();
        g.selectAll(".tick line").attr("stroke", "#777").attr("opacity", "0");
        g.selectAll(".tick text").attr("dy", -25).attr("class", "label").attr("font-size","1.5em")
            .attr("font-family", "subHeading")
    }

    let hBar_div = document.createDocumentFragment();


    let radius = 8,
        margin = {top: 70, right: 60, bottom: 20, left: 50},
        width_power = 1000 - margin.left - margin.right,
        height_power = 1950 - margin.top ,
        y = d3.scaleBand().range([10, height_power]),
        y0 = d3.scaleOrdinal(),
        x = d3.scaleLinear().rangeRound([0, width_power]);

    
    y0.domain(data.map(function(d) {
        return d.category;
    }));
    y.domain(data.map(function(d) {
        return d.power;
    }));  

    data.forEach(function(d) {
        d.diff = +d.diff;
        d.per_males = +d.per_males;
        d.per_females = +d.per_females;
    });

    var svg = d3.select(hBar_div).append("svg")
        .attr("width", width_power + margin.left + margin.right)
        .attr("height", height_power + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

    let y0Range = [0];
    let padBetween = 69, pad = 0.25;
    let barHeight = (height_power * 0.65) / data.length;
    let categoryG = d3.rollup(data, v=> {

        var barSpace = ((barHeight + pad) * v.length);
        y0Range.push(y0Range[y0Range.length - 1] + barSpace + padBetween);
        return d3.scaleBand()
            .domain(v.map(function(c) {
                return c.power
            }))
            .rangeRound([0, barSpace], pad);
        }, d => d.category);

    y0.range(y0Range);

    x.domain([-8, 8]);

    let axisX = d3.axisTop(x)
        .tickFormat(function(d) {
            return (Math.abs(d));
        })
        .tickSize(-1900)
    
    svg.append("g")
        .attr("class", "tk-atlas x axis")
        .attr("transform", "translate(0, -50)")
        .call(axisX)
        .selectAll("text")
        .style("text-anchor", "middle");

    svg.append("g")
        .attr("class", "y axis")
        .attr("class", "tk-atlas")
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + x(0) + ",0)")
        .call(customYAxis);

    // var linesBetween = svg.selectAll("lines.between")
    //     .data(data)
    //     .enter()
    //     .append("line");
    var linesBetween = svg.selectAll("lines.hBar")
        .data(data)
        .enter().append("line")
        .attr("class", "power_bar")
        .style("stroke", function(d, i) {
            if (d.diff >= 0) {
                //return colors.male
                return " #1357BE";
            } else return "#F012BE";//colors.female;
        })
        .attr("x1", function(d){
            if (d.diff <= 0) {
                return x(d.diff) - 5
            } else {
                return width_power/2
            }
        })
        .attr("x2", function(d){
            if (d.diff <= 0) {
                return width_power/2
            } else {
                return x(d.diff) + 5
            }
        })
        .attr("y1", function(d){
            return y0(d.category) + categoryG.get(d.category)(d.power);
        })
        .attr("y2", function(d){
            return y0(d.category) + categoryG.get(d.category)(d.power);
        })
        .on('mouseover', function(e, d) {
            var section = d3.select(this);
            section.style("opacity", 0.6)
            d3.select('#tooltip')
                .style("left", (e.pageX + 5) + "px")
                .style("top", (e.pageY - 28) + "px")
                .html("<p class='diff_bold'>Difference: </p><p class='difference'>" + Math.abs(parseFloat(d.diff)).toFixed(1) + "%</p><p class='diff_bold'>Males: </p><p class='difference'>" + Math.abs(parseFloat(d.per_males)).toFixed(1) + "%</p><p class='diff_bold'>Females: </p><p class='difference'>" + Math.abs(parseFloat(d.per_females)).toFixed(1) + "%</p>");
            d3.select('#tooltip').classed('hidden', false);
        })
        .on("click", function(d) {
            $("#textInsert_powers").html(d.definition)
            $("#titleInsert_powers").html(d.power);
        })
        .on('mouseout', function() {
            var section = d3.select(this);
            section.style("opacity", '1')
            d3.select('#tooltip').classed('hidden', true);
        });

    linesBetween.attr("class", "hBar");
    var genDots = svg.selectAll(".genDot")
        .data(data);

    genDots.enter().append("circle")
        .attr("class", "genDot")
        .attr("r", function(d) {
            return d.gen_name === 'lady' ? radius * 1.35 : radius
        })
        .attr("cx", function(d) {
            if (d.diff <= 0) {
                return x(d.diff) - 5
            } else {
                return x(d.diff) + 5
            }
        })
        .attr("cy", function(d) {
            return y0(d.category) + categoryG.get(d.category)(d.power);
        })
        .style("opacity", 1)
        .style("fill", function(d) {
            if (d.diff >= 0) {
                //return colors.male
                return " #1357BE";
            } else return "#F012BE";//colors.female;
            // if (d.gen_name === "lady") {
            //     return "#F012BE"
            // } else if (d.gender == 1) {
            //     return colors.male
            // } else {
            //     //return colors.female
            // }
        })
        // .classed("is-active", function(d) {
        //     return d.gen_name === 'lady'
        // })
        .on('mouseover', function(e, d) {
            d3.select('#tooltip')
                .style("left", (e.pageX + 5) + "px")
                .style("top", (e.pageY - 28) + "px")
                .html("<p class='diff_bold'>Difference: </p><p class='difference'>" + Math.abs(parseFloat(d.diff)).toFixed(1) + "%</p><p class='diff_bold'>Males: </p><p class='difference'>" + Math.abs(parseFloat(d.per_males)).toFixed(1) + "%</p><p class='diff_bold'>Females: </p><p class='difference'>" + Math.abs(parseFloat(d.per_females)).toFixed(1) + "%</p>");
            d3.select('#tooltip').classed('hidden', false);
        })
        .on("click", function(e, d) {
            d3.select("#titleInsert").text(d.category);
            d3.select("#textInsert").text(d.power);
            d3.select("#textInsert_names").text(d.definition);
            // d3.selectAll(".genDot")
            //     .style("fill", function(d) {
            //         if (d.gender == 1) {
            //             return colors.male
            //         } else {
            //             return colors.female
            //         }
            //     })
            //     .classed('is-active', false)
            //     .attr('r', radius)
    
            // d3.select(this)
            //     .classed('is-active', true)
            //     .transition()
            //     .attr('r', radius * 1.35)
        })
        .on('mouseout', function() {
            // var section = d3.select(this);
            // section.style("opacity", '1')
            d3.select('#tooltip').classed('hidden', true);
        });
    var ls = svg.selectAll(".labels")
        .data(data)
        .enter().append("g");

    // bg text 
    ls.append("text")
        .attr("class", "bar__label bar__label--bg tk-atlas")
        .text(function(d) {
            return (d.power);
        })
        .attr('text-anchor', function(d) {
            if (d.diff <= 0) {
                return 'end'
            } else {
                return 'start'
            }
        })
        .attr("font-size","0.9em")
        .attr("font-family", "body")
        .style("text-transform", "uppercase")
        .style("fill", function(d) {
            if (d.diff >= 0) {
                //return colors.male
                return " #1357BE";
            } else return "#F012BE";
        })
        .attr("x", function(d) {
            if (d.diff <= 0) {
                return x(d.diff) - 17
            } else {
                return x(d.diff) + 17
            }
        })
        .attr("y", function(d) {
            return y0(d.category) + categoryG.get(d.category)(d.power) + 5;

        })
        .on('mouseover', function(d) {
            // d3.select('#tooltip')
            //     .style("left", (d3.event.pageX + 5) + "px")
            //     .style("top", (d3.event.pageY - 28) + "px")
            //     .html("<p class='difference'>Difference: " + Math.abs(d.diff).toFixed(2) + "</p><p class='gender'><span>Males:</span> <span class='number'>" + Math.abs(d.per_males).toFixed(2) + "%</span></p><p class='gender'><span>Females:</span> <span class='number'>" + Math.abs(d.per_females).toFixed(2) + "%</span></p>");
            // d3.select('#tooltip').classed('hidden', false);
        })
        .on("click", function(d) {
            // $("#titleInsert").html(d.definition)
            // $("#textInsert").html("")
            // $("#textInsert_names").html(d.power);
        })
        .on('mouseout', function() {
            // d3.select('#tooltip').classed('hidden', true);
        });
    // const annotation_object = [{
    //     note: {
    //         title: "Objectâ€”ified",
    //         label: "Though Wonder Woman has her lasso, and Stargirl has a cosmic staff, it's generally the male characters that like their stuff. Think Thor and his hammer, or Iron Man and his suit.",
    //         wrap: 180
    //     },
    //     y: y('Gadgets') + padBetween - 15,
    //     x: 100,

    // }]

    // const makeAnnotation_object = d3.annotation()
    //     .editMode(false)
    //     .type(d3.annotationLabel)
    //     .annotations(annotation_object)
    // svg.append("g")
    //     .attr("id", "object_anno")
    //     .attr("class", "annotation-group")
    //     .attr("class", "tk-atlas")
    //     .attr("font-size", 12)
    //     .call(makeAnnotation_object)
    // const annotation_mind = [{
    //     note: {
    //         title: "Mind your powers",
    //         label: "There is a clear trend here: Female characters are more often given non-physical, thought-induced abilities.",
    //         wrap: 130
    //     },
    //     y: y('Empathy') + 10 + padBetween * 5,
    //     x: 450,

    // }]

    // const makeAnnotation_mind = d3.annotation()
    //     .editMode(false)
    //     .type(d3.annotationLabel)
    //     .annotations(annotation_mind)
    // svg.append("g")
    //     .attr("id", "mind_anno")
    //     .attr("class", "annotation-group")
    //     .attr("class", "tk-atlas")
    //     .attr("font-size", 12)
    //     .call(makeAnnotation_mind)
    
    return hBar_div;
}