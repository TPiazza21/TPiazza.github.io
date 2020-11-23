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
        vis.departmentColors = {
            "Applied Mathematics": "#00aaad",
            "Applied Physics": "#cbdb2a",
            "Bioengineering": "#fcb315",
            "Computer Science": "#4e88c7",
            "Electrical Engineering": "#ffde2d",
            "Environmental Science & Engineering":  "#77ced9",
            "Materials Science & Mechanical Engineering": "#bb89ca",
            "Multiple": "Pink", // this is a bit of a cheat
            "Applied Computation": "Red" // this is a bit of a cheat
        };


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

        // depending on how you group them, do different label procedures
        // (in general, map some feature to a nice list of labels)
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
            // I want to display faculty office locations, but only for places with enough faculty there

            // I will filter this list for values with at least 4 people
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

            // filter locations if too few people there
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
                    // anything not easily classified (or if there are too few faculty there) is here
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


        vis.groupIdMap = {};
        vis.groupInstanceCounter = {};
        vis.groupFirstIdMap = {};

        // now I go through machinery of making nodes, where there is one central node per each group that tugs everything else
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

        // circles
        let circles = vis.svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(vis.data.nodes, (d) => d.name) // can I do a smooth transition?
            .enter().append("circle")
            .attr("r", vis.circleRadius)
            .style("fill", function(d, i) {
                // for special colors
                if (selectedFacultyDotGrouping == "teachingAreas") {
                    return vis.departmentColors[d.label];
                }
                else {
                    return vis.color(d.group);
                }
            });

        // there used to be rectangles all around

        let textG = vis.svg.append("g")
            .attr("class", "labels");

        let texts = textG
            .selectAll("text")
            .data(vis.data.nodes, (d) => d.name)
            .enter().append("text")
            .attr("class", "group-labels")
            .style("font-size", 12)
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) {
                return vis.labels[d.id];
            });


        let titleTexts = textG
            .selectAll(".title-labels")
            .data(vis.data.nodes, (d) => d.name)
            .enter().append("text")
            .attr("class", "title-labels")
            .attr("id", (d) => d.id+"_title-text")
            .on("mouseover", function(event, d) {
                // show the faculty name
                textG
                    .selectAll(".title-labels")
                    .data(vis.data.nodes, (d2) => d2.name)
                    .attr("opacity", (d2) => {
                        if (d.name == d2.name){
                            // if this is the one we hovered over, set it to 1.0
                            return 1.0;
                        }
                        else {
                            return 0.0;
                        }
                    });

                // make the group labels less opaque, so that we see titles better
                textG
                    .selectAll(".group-labels")
                    .data(vis.data.nodes, (d2) => d2.name)
                    .attr("opacity", (d2) => {
                        return 0.2;
                    });
            })
            .on("mouseout", function(event, d) {
                // hide the faculty name, show the group label
                textG
                    .selectAll(".title-labels")
                    .data(vis.data.nodes, (d2) => d2.name)
                    .attr("opacity",0.0);

                textG
                    .selectAll(".group-labels")
                    .data(vis.data.nodes, (d2) => d2.name)
                    .attr("opacity", (d2) => {
                        return 1.0;
                    });
            })
            .style("font-size", 12)
            .attr("dx", 12)
            .attr("dy", ".35em")
            .attr("opacity", 0.0)
            .text(function(d) {
                return d.name;
            });


        // I believe this controls movement
        function ticked() {
            circles
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
            texts
                .attr("x", function(d) { return d.x - 30; })
                .attr("y", function(d) { return d.y; });
            titleTexts
                .attr("x", function(d) { return d.x-40; })
                .attr("y", function(d) { return d.y; });

        }

        vis.simulation.nodes(vis.data.nodes).on("tick", ticked);

        //ties the circles together
        vis.simulation.force("link").links(vis.data.links);
    }

    killAll() {
        let vis = this;
        vis.svg.selectAll("circle").data(new Array()).exit().remove();
        vis.svg.selectAll("text").data(new Array()).exit().remove();
    }
}