HTMLWidgets.widget({

  name: 'circlepackeR',

  type: 'output',

  initialize: function(el, width, height) {
    return {};
  },

  renderValue: function(el, x, instance) {

    // remove previous in case of dynamic/Shiny
    d3.select(el).selectAll('*').remove();

    // If a title is defined, add it above the visualization
    if (x.options.title) {
      d3.select(el).append("div")
        .attr("class", "circlepacker-title")
        .style("text-align", "center")
        .style("font-weight", "bold")
        .style("margin-bottom", "10px")
        .text(x.options.title);
    }

    var margin = 20,
    diameter = Math.min(el.getBoundingClientRect().width,
                        el.getBoundingClientRect().height);

    var color = d3.scale.linear()
        .domain([-1, 5])
        .range([x.options.color_min, x.options.color_max])
        .interpolate(d3.interpolateHcl);

    var pack = d3.layout.pack()
        .padding(2)
        .size([diameter - margin, diameter - margin])
        .value(function(d) { return d[x.options.size]; });

    var svg = d3.select(el).append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
      .append("g")
        .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    function createViz(root) {
      var focus = root,
          nodes = pack.nodes(root),
          view;

      var circle = svg.selectAll("circle")
          .data(nodes)
        .enter().append("circle")
          .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
          .style("fill", function(d) { return d.children ? color(d.depth) : null; })
          .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

      var text = svg.selectAll("text")
          .data(nodes)
        .enter().append("text")
          .attr("class", "label")
          // Make the text bold
          .style("font-weight", "bold")
          .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
          .style("display", function(d) { return d.parent === root ? null : "none"; })
          .text(function(d) {
            // Include the count in (n=X) format if available
            return d[x.options.size] ? d.name + " (n=" + d[x.options.size] + ")" : d.name;
          });

      var node = svg.selectAll("circle,text");

      d3.select(el)
          .on("click", function() { zoom(root); });

      zoomTo([root.x, root.y, root.r * 2 + margin]);

      function zoom(d) {
        var focus0 = focus; focus = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function() {
              var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
              return function(t) { zoomTo(i(t)); };
            });

        transition.selectAll("text")
          .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
            .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
      }

      function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function(d) { return d.r * k; });
      }
    }

    createViz(x.data);

    // Add footer if provided
    if (x.options.footer) {
      d3.select(el).append("div")
        .attr("class", "circlepacker-footer")
        .style("text-align", "center")
        .style("margin-top", "10px")
        .text(x.options.footer);
    }

    d3.select(self.frameElement).style("height", diameter + "px");
  },

  resize: function(el, width, height, instance) {
    // Add resize logic if needed
  }
});

