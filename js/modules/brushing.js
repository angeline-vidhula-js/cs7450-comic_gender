export const name = 'brushing';

export function brushing(data) {
    
    let brushed_div = document.createDocumentFragment();

    let margin = {top: 10, right: 30, bottom: 35, left: 50},
        width = 1350 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let margin2 = {top: 0, right: 30, bottom: 10, left: 50},
        width2 = 1350 - margin2.left - margin2.right,
        height2 = 120 - margin2.top - margin2.bottom;
        
    let svg = d3.select(brushed_div)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    let svg2 = d3.select(brushed_div)
        .append("svg")
        .attr("width", width2 + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom)


    let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    let g2 = svg2.append("g").attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);
    
    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.Male ;} )])
        .range([ height, 0 ]);

    var y2 = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.Male ;} )])
        .range([ height2, 0 ]);
        
    var z = d3.scaleOrdinal()
        .range(["blue", "fuchsia"]);

    var keys = data.columns.slice(1);
    let brush = d3.brushX()
        .extent([[25, 0], [width2 - margin2.right, height2]])
        .on("end", brushend);
     
        
    x0.domain(data.map(function(d) { return d.Year; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]);
    y2.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]);

    g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("class","bar")
        .attr("transform", function(d) { return "translate(" + x0(d.Year) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) { return height - y(d.value);  })
        .attr("fill", function(d) { return z(d.key); });

    g2.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("class","bar")
        .attr("transform", function(d) { return "translate(" + x0(d.Year) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) { return y2(d.value); })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) { return height2 - y2(d.value);  })
        .attr("fill", function(d) { return z(d.key); });

    g2.call(brush);
    g.exit().remove()

    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.bottom - margin.top - 14) + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 20)
        .attr("dy", 3)
        .attr("dx", -10)
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");
    svg.append("g")
        .attr("class", "yAxis")
        .call(d3.axisLeft(y));

    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(30," + i * 20 + ")"; });
        
    legend.append("rect")
        .attr("x", width - 17)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", z)
        .attr("stroke", z)
        .attr("stroke-width",2)
        .on("click",function(e, d) {updateKeys(d) });
  
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });

    var filtered = [];

    function updateKeys(d) {
        if (filtered.indexOf(d) == -1) {
            filtered.push(d); 
            if(filtered.length == keys.length) filtered = [];
        }
        else {
            filtered.splice(filtered.indexOf(d), 1);
        }
        var newKeys = [];
        keys.forEach(function(d) {
          if (filtered.indexOf(d) == -1 ) {
            newKeys.push(d);
          }
        })
        x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]);
        svg.select(".y")
            .transition()
            .call(d3.axisLeft(y).ticks(null, "s"))
            .duration(500);
     
        var bars = svg.selectAll(".bar").selectAll("rect")
          .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
        
        bars.filter(function(d) {
                return filtered.indexOf(d.key) > -1;
            })
            .transition()
            .attr("x", function(d) {
                return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width"))/2;  
            })
            .attr("height",0)
            .attr("width",0)     
            .attr("y", function(d) { return height; })
            .duration(500);
   
        bars.filter(function(d) {
            return filtered.indexOf(d.key) == -1;
          })
            .transition()
            .attr("x", function(d) { return x1(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("fill", function(d) { return z(d.key); })
            .duration(500);
 
        legend.selectAll("rect")
            .transition()
            .attr("fill",function(d) {
                if (filtered.length) {
                if (filtered.indexOf(d) == -1) {
                    return z(d); 
                }
                else {
                    return "white"; 
                }
                }
                else {
                return z(d); 
                }
            })
            .duration(100);     
    }

    function brushend(e) {
        var selected = [],
            start,
            end,
            brushExtent = e.selection,
            nData = [...data];
        selected  = x0.domain()
            .filter(function(d) {
                if ((brushExtent[0] <= x0(d)) && (x0(d) <= brushExtent[1])) {
                    if(!start)  start = d;
                    end = (parseInt(d) - 1).toString();
                    return true;
                }
            });

         nData = nData.filter(function (v, k) {
            return (selected.indexOf(v.Year) != -1) ;
        });
        
        var ux0 = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1);
        
        var ux1 = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.05);

        var uy = d3.scaleLinear()
            .domain([0, d3.max(nData, function(d) { return +d.Male ;} )])
            .range([ height, 0 ]);


        
        ux0.domain(nData.map(function(d) { return d.Year; }));
        ux1.domain(keys).range([0, ux0.bandwidth()]);
        uy.domain([0, d3.max(nData, function(d) { return +d.Male ;} )])
        svg.selectAll(".yAxis")
            .call(d3.axisLeft(uy));
        svg.selectAll(".xAxis")
            .call(d3.axisBottom(ux0))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 20)
            .attr("dy", 3)
            .attr("dx", -10)
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");
        svg.select(".y")
            .transition()
            .call(d3.axisLeft(uy))
            .duration(500);
       
            
        var bars = svg.selectAll(".bar").selectAll("rect")
          .data(function(d) { 
              return keys.map(function(key) { return {key: key, value: d[key], Year: d.Year}; }); 
            })
        
        bars.filter(function(d, i) {
                return (selected.indexOf(d.Year) == -1) ;
            })
            .transition()
            .attr("x", function(d) {
                return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width"))/2;  
            })
            .attr("height",0)
            .attr("width",0)     
            .attr("y", function(d) { return height; })
            .duration(500);
   
        bars.filter(function(d, i) {
            return (selected.indexOf(d.Year) != -1) ;
          })
            .transition()
            // .attr("x", function(d) {
            //     return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width"));  
            // })
            .attr("x", function(d, i) {
                var style = window.getComputedStyle(this.parentNode);
                var matrix = new WebKitCSSMatrix(style.transform);
                if (d.key == "Female") return ux0(d.Year) - matrix.m41 + ux1.bandwidth(); 
                return ux0(d.Year) - matrix.m41; 
            })
            .attr("y", function(d) { return uy(d.value); })
            .attr("height", function(d) { return height - uy(d.value); })
            .attr("width", ux1.bandwidth())
            .attr("fill", function(d) { return z(d.key); })
            .duration(500);

         
    }
    return brushed_div;
}