HTMLWidgets.widget({

  name: 'circlepackeR',

  type: 'output',

  initialize: function(el, width, height) {

    return {
      // TODO: add instance fields as required
    }

  },

  renderValue: function(el, x, instance) {

    var diameter = 960,
    format = d3.format(",d");

    var pack = d3.layout.pack()
        .size([diameter - 4, diameter - 4])
        .value(function(d) { return d.size; });

    var svg = d3.select("body").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
      .append("g")
        .attr("transform", "translate(2,2)");

//    d3.json(x.path, function(error, root) {
//      if (error) throw error;

//    JSON.parse(x.data, function(error, root) {
//      if (error) throw error;

    var root = JSON.parse(x.data)

    function makeCircles(root) {

      var node = svg.datum(root).selectAll(".node")
          .data(pack.nodes)
        .enter().append("g")
          .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      node.append("title")
          .text(function(d) { return d.name + (d.children ? "" : ": " + format(d.size)); });

      node.append("circle")
          .attr("r", function(d) { return d.r; });

      node.filter(function(d) { return !d.children; }).append("text")
          .attr("dy", ".3em")
          .style("text-anchor", "middle")
          .text(function(d) { return d.name.substring(0, d.r / 3); });
    }
//    );

    makeCircles(root)

    d3.select(self.frameElement).style("height", diameter + "px");

  },

  resize: function(el, width, height, instance) {

  }

});
