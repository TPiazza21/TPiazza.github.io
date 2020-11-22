/* * * * * * * * * * * * * *
*      class groupDotsVis        *
* * * * * * * * * * * * * */

// https://bl.ocks.org/ocarneiro/42286298b683c490ff74cdbf3800241e

class groupDotsVis {
    constructor(parentElement, peopleInfo, coursesInfo, latestPeopleInfo){
        this.parentElement = parentElement;
        this.peopleInfo = peopleInfo;
        this.coursesInfo = coursesInfo;
        this.latestPeopleInfo = latestPeopleInfo;

        this.initVis();
    }


    initVis(){
        let vis = this;

        vis.margin = {top: 40, right: 60, bottom: 60, left: 60};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        //vis.minDim = d3.min([vis.width, vis.height]);
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append("text").text("This is in progress. See https://bl.ocks.org/ocarneiro/42286298b683c490ff74cdbf3800241e to know what I'm trying to do").attr("x",50).attr("y",50);

        vis.latestAllFaculty = vis.latestPeopleInfo.map((x) => x.Title);
        vis.allFaculty = vis.peopleInfo.map((x) => x.Title).filter((x) => vis.latestAllFaculty.includes(x));

        // I also want some big list of research areas... and teaching areas while we're at it
        let allResearchInterestsDup = vis.peopleInfo.map((x) => x["Research Interests"]).join("|").split("|");
        vis.allResearchInterests = [...new Set(allResearchInterestsDup)].filter((x) => x.length > 0);

        let allTeachingAreasDup = vis.peopleInfo.map((x) => x["Teaching Areas"]).join("|").split("|");
        vis.allTeachingAreas = [...new Set(allTeachingAreasDup)].filter((x) => x.length > 0);


        vis.departmentMap = {};
        vis.peopleInfo.forEach((x) => {
            vis.departmentMap[x["Title"]] = {'researchInterests': x["Research Interests"], 'teachingAreas': x["Teaching Areas"]};
        });

        vis.officeMap = {};
        vis.peopleInfo.forEach((x) => {
            vis.officeMap[x["Title"]] = x["Office"];
        })

        vis.color = d3.scaleOrdinal(d3.schemeCategory10);
        vis.circleRadius = 15;
        vis.displayFaculty = vis.allFaculty;

        vis.circleDiv = vis.svg.append("g").attr("class","nodes");


        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;
        vis.killAll();


        // I will want to modify this, at some point
        vis.jsonData = [40, 3, 5, 10, 2, 1];
        vis.labels = ["Survey","Field Research", "Case Study",
            "Lab Experiment", "Secondary Data",
            "Content Analysis"
        ];

        if (selectedFacultyDotGrouping == "teachingAreas") {
            function smartTeachingAreaMap(teachingAreaString) {
                if (teachingAreaString.includes("|")) {
                    return "Multiple";
                }
                else {
                    return teachingAreaString;
                }
            }
            vis.nodeLabels = vis.displayFaculty.map((x) => smartTeachingAreaMap(vis.departmentMap[x]["teachingAreas"]));
            vis.labels = [...new Set(vis.nodeLabels)];
        } else if (selectedFacultyDotGrouping == "officeBuilding") {
            let interestingOfficeLocations = ["LISE","Hoffman","Pierce","Maxwell Dworkin",
                "Geo", "Mallinckrodt", "Northwest", "MCZ", "Cruft", "Lyman"];

            let locationCount = {};
            interestingOfficeLocations.forEach((loc) => {
                locationCount[loc] = 0;
            });

            vis.displayFaculty.forEach((name) => {
                let foundIt = false;
                for(let i = 0; i < interestingOfficeLocations.length; i++) {
                    if(vis.officeMap[name].includes(interestingOfficeLocations[i])) {
                        locationCount[interestingOfficeLocations[i]] = locationCount[interestingOfficeLocations[i]] + 1;
                        i += 2 * interestingOfficeLocations.length;
                        foundIt = true;
                    }
                }
            });

            let updatedInterestingOfficeLocations = interestingOfficeLocations.filter((loc) => locationCount[loc]>3);

            let locationLabels = [];
            vis.displayFaculty.forEach((name) => {
                let foundIt = false;
                let locStr = "";
                for(let i = 0; i < updatedInterestingOfficeLocations.length; i++) {
                    if(vis.officeMap[name].includes(updatedInterestingOfficeLocations[i])) {
                        foundIt = true;
                        locStr = updatedInterestingOfficeLocations[i];
                        // break out of for loop
                        i += 2 * updatedInterestingOfficeLocations.length;
                    }
                }
                if (foundIt == false) {
                    locStr = "Miscellaneous";
                }

                if (locStr == "Geo") {
                    locStr = "Geological Museum";
                }
                locationLabels.push(locStr);
            });

            vis.nodeLabels = locationLabels;
            vis.labels = [...new Set(vis.nodeLabels)];
        }

        vis.groups = vis.labels.length;

        // I just need to create nodes, which is a list of {id, group} objects. Maybe they can contain more than just that?
        vis.groupIdMap = {};
        vis.groupInstanceCounter = {};
        vis.groupFirstIdMap = {};
        for(let i = 0; i<vis.groups; i++) {
            vis.groupIdMap[vis.labels[i]] = i;
            vis.groupInstanceCounter[vis.labels[i]] = 0;
        }

        let i = 0;
        let nodeObjects = [];
            vis.displayFaculty.forEach((name) => {
            let nodeObj = {};
            nodeObj.name = name;
            nodeObj.label = vis.nodeLabels[i];
            nodeObj.groupInstanceCount = vis.groupInstanceCounter[nodeObj.label];
            if (vis.groupInstanceCounter[nodeObj.label] == 0) {

                vis.groupInstanceCounter[nodeObj.label] = vis.groupInstanceCounter[nodeObj.label] + 1;
            }

            nodeObjects.push(nodeObj);
            i = i + 1;
        });

        i = 0;
        nodeObjects.sort((a,b) => a.groupInstanceCount - b.groupInstanceCount);
        let newNodeObjects = [];
        nodeObjects.forEach((nodeObj) => {
            nodeObj.id = i;
            if (nodeObj.groupInstanceCount == 0) {
                vis.groupFirstIdMap[nodeObj.label] = nodeObj.id;
            }
            nodeObj.group = vis.groupFirstIdMap[nodeObj.label];

            newNodeObjects.push(nodeObj);
            i = i + 1;
        });


        vis.nodes = newNodeObjects;
        // keep track of which were the first ids, so you know which one to display for labels/rectangles
        vis.groupFirstIds = vis.labels.map((l) => vis.groupFirstIdMap[l]);




        //vis.groups = vis.labels.length;
        //vis.currentData = vis.jsonData;

        //vis.nodes = vis.nodeGen(vis.currentData, vis.labels);
        vis.range = vis.nodes.length;

        vis.data = {
            nodes:vis.nodes,
            links:vis.nodes.map(function(i) {
                return {
                    source: i.group, //vis.groupFirstIdMap[i.group],
                    target: i.id
                };
            })};

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        let trans = d3.transition()
            .duration(800);

        vis.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.index })
                .distance(20)) // .distance(20))
            .force("collide",d3.forceCollide(vis.circleRadius + 2)) // originally just vis.circleRadius
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
            .force("y", d3.forceY(0))
            .force("x", d3.forceX(0));

        /*
        let columnLabels = vis.svg
            .selectAll(".matrix-column-labels")
            .data(vis.displayFaculty);

        columnLabels.exit() // EXIT
            .style("opacity", 0.0)
            .transition(trans)
            .remove();

        columnLabels
            .enter() // ENTER
            .append("text")
            .attr("class","matrix-column-labels")
            .merge(columnLabels)
            .transition(trans) // ENTER + UPDATE
            .attr("text-anchor","start")
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * (i+1) + vis.xShift)
            .attr("y", vis.yShift-5)
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .attr("transform", (d,i) => "rotate(270," + ((vis.cellPadding + vis.cellWidth) * (i+1) + vis.xShift) +  "," + vis.yShift + ")")
            .text(d => d);

         */


        /*
        let circles = vis.circleDiv
            .selectAll(".node-circles")
            .data(vis.data.nodes, (d) => d.name);

        circles.exit() // EXIT
            .style("opacity", 0.0)
            .transition(trans)
            .remove();

        circles.enter().append("circle")
            .attr("class", "node-circles")
            .attr("r", vis.circleRadius)
            .style("fill", function(d, i) { return vis.color(d.group); });
         */

        // circles
        let circles = vis.svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(vis.data.nodes, (d) => d.name) // can I do a smooth transition?
            .enter().append("circle")
            .attr("r", vis.circleRadius)
            .style("fill", function(d, i) { return vis.color(d.group); });

        let rects = vis.svg.append("g")
            .attr("class", "rects")
            .selectAll("rect")
            .data(vis.data.nodes)
            .enter().append("rect")
            .on("click", function(event, d) {
                // show info on the "sticky note"?
                console.log(d);
                console.log(vis.departmentMap[d.name]);
            })
            .attr("fill", "white")
            .attr("fill-opacity", 0.4)
            .attr("width", 75)
            .attr("height", 25);

        let texts = vis.svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(vis.data.nodes)
            .enter().append("text")
            .style("font-size", 12)
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) { return vis.labels[d.id] });


        function ticked() {
            circles
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
            texts
                .attr("x", function(d) { return d.x - 30; })
                .attr("y", function(d) { return d.y; });

            rects
                .attr("x", function(d) { return d.x - 30; })
                .attr("y", function(d) { return d.y - 12; })
                .attr("fill-opacity", function(d) {
                    let opacity = 0.0;
                    // previous condition: d.id < vis.labels.length
                    if (vis.groupFirstIds.includes(d.id)) {
                        // only if this is a label node. Maybe it doesn't have to be in this particular structure
                        opacity = 0.4
                    }
                    return opacity;
                });

        }

        vis.simulation.nodes(vis.data.nodes).on("tick", ticked);

        //ties the circles together
        vis.simulation.force("link").links(vis.data.links);
    }

    killAll() {
        let vis = this;
        vis.svg.selectAll("circle").data(new Array()).exit().remove();
        vis.svg.selectAll("rect").data(new Array()).exit().remove();
        vis.svg.selectAll("text").data(new Array()).exit().remove();
    }
}