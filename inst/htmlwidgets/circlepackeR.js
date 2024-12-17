HTMLWidgets.widget({

  name: 'circlepackeR',

  type: 'output',

  initialize: function(el, width, height) {
    return {};
  },

  renderValue: function(el, x, instance) {

    // remove previous elements, if any
    d3.select(el).selectAll('*').remove();

    var margin = 20,
        diameter = Math.min(el.getBoundingClientRect().width,
                            el.getBoundingClientRect().height);

    // Original color settings
    var color = d3.scale.linear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.layout.pack()
        .padding(2)
        .size([diameter - margin, diameter - margin])
        .value(function(d) { return d[x.options.size]; });

    // Create the main SVG
    var svg = d3.select(el).append("svg")
        .attr("width", diameter)
        .attr("height", diameter);

    // Add title if provided
    if (x.options.title) {
      svg.append("text")
        .attr("class", "circlepacker-title")
        .attr("text-anchor", "middle")
        .attr("x", diameter / 2)
        .attr("y", 20) // position near top
        .text(x.options.title);
    }

    // Add footer if provided
    if (x.options.footer) {
      svg.append("text")
        .attr("class", "circlepacker-footer")
        .attr("text-anchor", "middle")
        .attr("x", diameter / 2)
        .attr("y", diameter - 5) // position near bottom
        .text(x.options.footer);
    }

    var g = svg.append("g")
      .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    function createViz(root) {
      var focus = root,
          nodes = pack.nodes(root),
          view;

      var circle = g.selectAll("circle")
          .data(nodes)
        .enter().append("circle")
          .attr("class", function(d) {
            return d.parent ? (d.children ? "node" : "node node--leaf") : "node node--root";
          })
          .style("fill", function(d) { return d.children ? color(d.depth) : null; })
          .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

      var text = g.selectAll("text.label")
          .data(nodes)
        .enter().append("text")
          .attr("class", "label")
          .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
          .style("display", function(d) { return d.parent === root ? null : "none"; })
          .text(function(d) {
            return d[x.options.size] ? d.name + " (n=" + d[x.options.size] + ")" : d.name;
          });

      var node = g.selectAll("circle,text");

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

        transition.selectAll("text.label")
          .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
            .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
      }

      function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function(d) {
          return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
        });
        circle.attr("r", function(d) { return d.r * k; });
      }
    }

    createViz(x.data);
    d3.select(self.frameElement).style("height", diameter + "px");
  },

  resize: function(el, width, height, instance) {
    // Add resize logic if needed
  }
});
