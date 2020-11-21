/* * * * * * * * * * * * * *
*      class groupDotsVis        *
* * * * * * * * * * * * * */

// https://bl.ocks.org/ocarneiro/42286298b683c490ff74cdbf3800241e

// TODO: implement

class groupDotsVis {
    constructor(parentElement, peopleInfo, coursesInfo){
        this.parentElement = parentElement;
        this.peopleInfo = peopleInfo;
        this.coursesInfo = coursesInfo;

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

        // eventually may narrow this down, but it's fine here
        vis.allFaculty = vis.peopleInfo.map((x) => x.Title);
        // I also want some big list of research areas... and teaching areas while we're at it
        let allResearchInterestsDup = vis.peopleInfo.map((x) => x["Research Interests"]).join("|").split("|");
        vis.allResearchInterests = [...new Set(allResearchInterestsDup)].filter((x) => x.length > 0);

        let allTeachingAreasDup = vis.peopleInfo.map((x) => x["Teaching Areas"]).join("|").split("|");
        vis.allTeachingAreas = [...new Set(allTeachingAreasDup)].filter((x) => x.length > 0);


        vis.color = d3.scaleOrdinal(d3.schemeCategory10);
        vis.circleRadius = 8;
        vis.groups = 10; // I don't know, will have to change
        vis.currentData = []; // what to put here?
        vis.labels = [];
        vis.nodes = [];

        // intrinsic properties of the adjacency matrix
        //vis.cellWidth = 2;
        //vis.yShift = 100;
        //vis.xShift = 240;

        //vis.cellScalar = 0.85;
        //vis.cellPadding = 1;


        // I will define cellWidth later, dynamically


        //vis.basicRelationData();
        //vis.createMatrixData();

        // decide whether or not to display text based on how many are here
        //vis.displayLabelsThreshold = 50;
        //vis.displayLabelsBoolean = (vis.displayFaculty.length <= vis.displayLabelsThreshold);

        // actually create the squares (and labels)
        //vis.wrangleData();

    }

    basicRelationData() {
        let vis = this;

        vis.departmentMap = {};
        vis.peopleInfo.forEach((x) => {
            vis.departmentMap[x["Title"]] = {'researchInterests': x["Research Interests"], 'teachingAreas': x["Teaching Areas"]};
        });

    }

    createMatrixData() {
        let vis = this;
        // this function will use some names of faculty (vis.displayFaculty), and some dataset, and creates data in the table

        let matrixLongList = [];

        vis.allResearchInterests.forEach((r) => {
            vis.researchInterestSortInfoDict[r].interestedFaculty = 0;
        });

        let xpos = 0;
        vis.displayFaculty.forEach((name) => {
            let facultyObj = {};
            facultyObj.name = name;
            facultyObj.researchInterests = [];
            let ypos = 0;
            let interestCounter = 0;
            vis.displayResearchInterests.forEach((r) => {
                let facultyResearchInterestObj = {};
                // keep track of the name
                facultyResearchInterestObj.name = name;
                facultyResearchInterestObj.researchInterest = r;
                facultyResearchInterestObj.isInterested = (vis.departmentMap[name].researchInterests.includes(r));
                if (facultyResearchInterestObj.isInterested) {
                    interestCounter = interestCounter + 1;
                    vis.researchInterestSortInfoDict[r].interestedFaculty = vis.researchInterestSortInfoDict[r].interestedFaculty + 1;
                }
                facultyResearchInterestObj.xpos = xpos;
                facultyResearchInterestObj.ypos = ypos;
                facultyResearchInterestObj.nameKey = name + ";" + r;
                facultyObj.researchInterests.push(facultyResearchInterestObj);
                matrixLongList.push(facultyResearchInterestObj);

                ypos = ypos+1;
            });

            // save this info so you can sort using it, later
            facultyObj.researchInterests = vis.departmentMap[name].researchInterests;
            facultyObj.teachingAreas = vis.departmentMap[name].teachingAreas;
            facultyObj.numResearchInterests = interestCounter;

            vis.facultySortInfoDict[name] = facultyObj;

            xpos = xpos+1;
        });

        vis.matrixLongList = matrixLongList;
    }

    sortAndFilterValues() {
        let vis = this;

        // filter FIRST

        // filtering the faculty
        if (vis.allResearchInterests.includes(selectedFacultyTableFilter)) {
            let filteredFaculty = vis.allFaculty.filter(name => vis.departmentMap[name].researchInterests.includes(selectedFacultyTableFilter));
            vis.displayFaculty = filteredFaculty;
            vis.xShift = 240;
            vis.cellScalar = 0.85;
        } else if (vis.allTeachingAreas.includes(selectedFacultyTableFilter)) {
            let filteredFaculty = vis.allFaculty.filter(name => vis.departmentMap[name].teachingAreas.includes(selectedFacultyTableFilter));
            vis.displayFaculty = filteredFaculty;
            vis.xShift = 240;
            vis.cellScalar = 0.85;
        }
        else if (selectedFacultyTableFilter == "All") {
            vis.displayFaculty = vis.allFaculty;
            vis.xShift = 50;
            vis.cellScalar = 0.6;
        }

        // once you've filtered the faculty, filter out research areas that are unnecessary
        let allRelevantResearchInterestStr = vis.displayFaculty.map((name) => vis.departmentMap[name].researchInterests).join("|");
        let relevantResearchInterests = vis.allResearchInterests.filter((r) => allRelevantResearchInterestStr.includes(r));
        vis.displayResearchInterests = relevantResearchInterests;

        // just so the data is still fresh
        vis.createMatrixData();

        // THEN sort

        // sorting of faculty
        let stringFacultyInclusionSorts = ["name", "teachingAreas"];
        if (stringFacultyInclusionSorts.includes(selectedFacultyTableFacultySort)) {
            // compare strings
            vis.displayFaculty.sort(function(a, b){return vis.facultySortInfoDict[a][selectedFacultyTableFacultySort].localeCompare(vis.facultySortInfoDict[b][selectedFacultyTableFacultySort])});
        }
        else {
            // compare numbers (counts)
            vis.displayFaculty.sort(function(a, b){return vis.facultySortInfoDict[b][selectedFacultyTableFacultySort] - vis.facultySortInfoDict[a][selectedFacultyTableFacultySort]});
        }

        // sorting of research areas
        let stringResearchInclusionSorts = ["researchInterest"];
        if (stringResearchInclusionSorts.includes(selectedFacultyTableResearchSort)) {
            vis.displayResearchInterests.sort(function(a, b){return vis.researchInterestSortInfoDict[a][selectedFacultyTableResearchSort].localeCompare(vis.researchInterestSortInfoDict[b][selectedFacultyTableResearchSort])});
        }
        else {
            vis.displayResearchInterests.sort(function(a, b){return vis.researchInterestSortInfoDict[b][selectedFacultyTableResearchSort] - vis.researchInterestSortInfoDict[a][selectedFacultyTableResearchSort]});
        }

        // update the cell widths so it scales, and maybe update whether or not text is shown
        let tempScaleShift = vis.cellScalar * d3.min([((vis.width - vis.xShift) / vis.displayFaculty.length), ((vis.height - vis.yShift) / vis.displayResearchInterests.length)]);
        vis.cellWidth = d3.max([tempScaleShift,3]);
        vis.displayLabelsBoolean = (vis.displayFaculty.length <= vis.displayLabelsThreshold);

    }

    wrangleData() {
        let vis = this;

        vis.sortAndFilterValues();
        vis.createMatrixData();

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        let trans = d3.transition()
            .duration(800);

        let relationSquares = vis.svg
            .selectAll(".matrix-relation-squares")
            .data(vis.matrixLongList, (d) => d.nameKey);

        relationSquares.exit() // EXIT
            .style("opacity", 0.0)
            .transition(trans)
            .remove();

        relationSquares
            .enter() // ENTER
            .append("rect")
            .attr("class","matrix-relation-squares")
            .on("click", function(event, d) {
                // maybe do more with this later
                console.log("Clicking!");
                console.log(d);
                console.log(vis.departmentMap[d.name]);
            })
            .merge(relationSquares) // ENTER + UPDATE
            .transition(trans)
            .attr("fill", function(d) {
                if (d.isInterested) {
                    return "purple";
                } else {
                    return "gray";
                }
            })
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean || d.isInterested){
                    return 1.0;
                }
                else {
                    return 0.5;
                }
            })
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * d.xpos + vis.xShift)
            .attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * d.ypos + vis.yShift)
            .attr("width", vis.cellWidth)
            .attr("height", vis.cellWidth);

        // rows are for research interests
        let rowLabels = vis.svg
            .selectAll(".matrix-row-labels")
            .data(vis.displayResearchInterests);

        rowLabels.exit() // EXIT
            .style("opacity", 0.0)
            .transition(trans)
            .remove();

        rowLabels
            .enter() // ENTER
            .append("text")
            .attr("class","matrix-row-labels")
            .merge(rowLabels)
            .transition(trans) // ENTER + UPDATE
            .attr("text-anchor","end")
            .attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * (i+1) + vis.yShift)
            .attr("x", vis.xShift-5)
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .text(d => d);

        // column labels are for the faculty

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
            .text((d) => d);
    }

    killAll() {
        let vis = this;
        vis.svg.selectAll("circle").data(new Array()).exit().remove();
        vis.svg.selectAll("rect").data(new Array()).exit().remove();
        vis.svg.selectAll("text").data(new Array()).exit().remove();
    }



}