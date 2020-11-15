class NetworkGraph {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    // TODO - add faculty pictures to nodes?
    // TODO - interactivity with network graph
    initVis() {
        // Most code adapted from
        // https://www.d3-graph-gallery.com/graph/network_basic.html

        let vis = this;
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")

        vis.simulation = d3.forceSimulation(vis.data.nodes)                 // Force algorithm is applied to data.nodes
            .force("link", d3.forceLink()                               // This force provides links between nodes
                .id(function(d) { return d.id; })                     // This provide  the id of a node
                .links(vis.data.links)                                    // and this the list of links
            )
            .force("charge", d3.forceManyBody().strength(-1))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
            .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))     // This force attracts nodes to the center of the svg area
            .on("end", ticked);

        // Initialize the links
        vis.link = vis.svg
            .selectAll("line")
            .data(vis.data.links)
            .enter()
            .append("line")
            .style("stroke", "#aaa")

        // Initialize the nodes
        vis.node = vis.svg
            .selectAll("circle")
            .data(vis.data.nodes)
            .enter()
            .append("circle")
            .attr("r", 5)
            .style("fill", "#69b3a2")

        function ticked() {
            vis.link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            vis.node
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }

    }
}