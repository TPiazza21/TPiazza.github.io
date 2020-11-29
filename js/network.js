class NetworkGraph {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    // TODO - add faculty pictures to nodes?
    // TODO - interactivity with network graph
    initVis() {

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

        vis.defs = vis.svg.append("defs");

        // vis.defs
        //     .data(vis.data.nodes)
        //     .enter()
        //     .append('pattern')
        //     .attr("id", d=>"image"+ d.id )
        //     .attr("width", 1)
        //     .attr("height", 1)
        //     .append("image")
        //     .attr("href", d=> d.image)
        //     .attr("width", 100)
        //     .attr("height", 150);

        // Most code adapted from
        // https://www.d3-graph-gallery.com/graph/network_basic.html

        vis.simulation = d3.forceSimulation(vis.data.nodes)                 // Force algorithm is applied to data.nodes
            .force("link", d3.forceLink()                               // This force provides links between nodes
                .id(function(d) { return d.id; })                     // This provide  the id of a node
                .links(vis.data.links)                                    // and this the list of links
            )
            .force("forceX", d3.forceX().strength(.1).x(vis.width/2))
            .force("forceY", d3.forceY().strength(.1).y(vis.height/2))
            .force("charge", d3.forceManyBody().strength(-40))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
            .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))     // This force attracts nodes to the center of the svg area
            .on("end", ticked);

        // Initialize the links
        vis.link = vis.svg
            .selectAll(".network-line")
            .data(vis.data.links)
            .enter()
            .append("line")
            .attr("class", "network-line")
            .style("stroke", d=>
            {if(d.type == "news") {return "blue"}
            else if(d.type=="research") {return "red"}
            else if(d.type=="center") {return "purple"}
            else if(d.type=="initiative") {return "orange"}
            else if(d.type=="school") {return "grey"}
            else {return "yellow"};
            })

        // Initialize nodes
        vis.node = vis.svg
            .selectAll(".network-node")
            .data(vis.data.nodes)
            .enter()
            .append("circle")
            .attr("class", "network-node")
            .attr("r", 5)
            .on('click', connectedNodes);

        vis.node.append("title")
            .text(d => d.name);


        function ticked() {
            vis.link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            vis.node
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        }

        // from http://coppelia.io/2014/07/an-a-to-z-of-extra-features-for-the-d3-force-layout/
        //Toggle stores whether the highlighting is on
        var toggle = 0;
        //Create an array logging what is connected to what
        var linkedByIndex = {};
        var i;
        for (i = 0; i < vis.data.nodes.length; i++) {
            linkedByIndex[i + "," + i] = 1;
        };
        vis.data.links.forEach(function (d) {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
        });
        //This function looks up whether a pair are neighbours
        function neighboring(a, b) {
            return linkedByIndex[a.index + "," + b.index];
        }
        function connectedNodes() {
            if (toggle == 0) {
                //Reduce the opacity of all but the neighbouring nodes
                let d = d3.select(this).node().__data__;
                vis.node.style("opacity", function (o) {
                    return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
                });
                vis.link.style("opacity", function (o) {
                    return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
                });
                //Reduce the op
                toggle = 1;
            } else {
                //Put them back to opacity=1
                vis.node.style("opacity", 1);
                vis.link.style("opacity", 1);
                toggle = 0;
            }
        }
    }
  }