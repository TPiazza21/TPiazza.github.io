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
            .style("stroke", d=> {if(d.type == "news") {return "blue"} else {return "red"}})

        // Initialize the nodes
        vis.node = vis.svg
            .selectAll("circle")
            .data(vis.data.nodes)
            .enter()
            .append("circle")
            .attr("r", 5)
            .style("fill", d=> d.image)
            .on("click",
            (event, d) => vis.wrangleData(d)
            )

        vis.node.append("image")
            .attr("href",  function(d) { return d.image;})
            // .attr("x", function(d) { return -25;})
            // .attr("y", function(d) { return -25;})
            .attr("height", 50)
            .attr("width", 50);

        vis.text = vis.svg.selectAll("text")
            .data(vis.data.nodes)
            .enter()
            .append("text");

        vis.node.append("title")
            .text(function(d) { return d.name; });

        function ticked() {
            vis.link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            vis.node
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            vis.text.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
        }

    }

    wrangleData(d) {
        let vis = this;
        vis.displayLinks = vis.data.links.filter(
            link => link.source.id == d.id || link.target.id == d.id
        )
        let sources = vis.displayLinks.map(d=> d.source.id)
        let targets = vis.displayLinks.map(d => d.target.id)
        let combined = sources.concat(targets)
        vis.displayNodes = vis.data.nodes.filter(
            node => combined.includes(node.id)
        )
        vis.updateVis()
    }

    updateVis() {
        let vis = this;
        $("line").remove();
        $("circle").remove();
        vis.simulation = d3.forceSimulation(vis.displayNodes)                 // Force algorithm is applied to data.nodes
            .force("link", d3.forceLink()                               // This force provides links between nodes
                .id(function(d) { return d.id; })                     // This provide  the id of a node
                .links(vis.displayLinks)                                    // and this the list of links
            )
            .force("charge", d3.forceManyBody().strength(-1))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
            .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))     // This force attracts nodes to the center of the svg area
            .on("end", ticked);

        // Initialize the links
        vis.link = vis.svg
            .selectAll("line")
            .data(vis.displayLinks)
            .enter()
            .append("line")
            .style("stroke", d => {if(d.type == "news") {return "blue"} else {return "red"}})

        // Initialize the nodes
        vis.node = vis.svg
            .selectAll("circle")
            .data(vis.displayNodes)
            .enter()
            .append("circle")
            .attr("r", 10)
            .style("fill", d=> d.image)

        vis.text = vis.svg.selectAll("text")
            .data(vis.data.nodes)
            .enter()
            .append("text");

        vis.node.append("title")
            .text(function(d) { return d.name; });

        function ticked() {
            vis.link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            vis.node
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
            vis.text
                .attr("x", function(d) {return d.x;})
                .attr("y", function(d) {return d.y;});
        }
    }
}