/* * * * * * * * * * * * * *
*      class matrixVis        *
* * * * * * * * * * * * * */


class adjMatrixVis {
    constructor(parentElement, peopleInfo, perPaperInfo){
        this.parentElement = parentElement;
        this.peopleInfo = peopleInfo;
        this.perPaperInfo = perPaperInfo;

        this.initVis();
    }

    initVis(){
        console.log("Init Vis of adjMatrixVis");
        let vis = this;

        vis.margin = {top: 40, right: 60, bottom: 60, left: 60};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.minDim = d3.min([vis.width, vis.height]);
        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title matrix-title')
            .append('text')
            .text("Relationship Matrix")
            .attr('transform', `translate(${vis.width / 2}, 0)`)
            .attr('text-anchor', 'middle');

        vis.allFaculty = vis.peopleInfo.map((x) => x.Title);

        // intrinsic properties of the adjacency matrix
        //vis.cellWidth = 2;
        vis.yShift = 60;
        vis.xShift = 100;
        vis.cellScalar = 0.5;
        vis.cellWidth = d3.max([vis.cellScalar * ((vis.minDim - d3.max([vis.xShift, vis.yShift])) / vis.allFaculty.length),2]);
        vis.cellPadding = 1;



        console.log(vis.allFaculty);

        // we may decide to filter this list for one reason or another, but for now use all
        vis.displayFaculty = vis.allFaculty;
        vis.displayPaperInfo = vis.perPaperInfo;
        // create vis.matrixData to use
        vis.basicRelationData();
        vis.createMatrixData();

        // decide whether or not to display text based on how many are here
        vis.displayLabelsThreshold = 40;
        vis.displayLabelsBoolean = (vis.displayFaculty.length <= vis.displayLabelsThreshold);


        // put everything in row objects, so they can move later
        /*
        vis.relationSquares = vis.svg
            .selectAll(".matrix-relation-squares")
            .data(vis.matrixLongList, (d) => d.nameKey)
            .enter()
            .append("rect")
            .attr("class","matrix-relation-squares")
            .attr("fill", function(d) {
                if (d.valueLen > 0) {
                    // at some point I may want color scales...
                    return "purple";
                } else {
                    return "gray";
                }
            })
            .attr("opacity", function(d) {
                // display if we have small enough graph, or if values are important
                if(vis.displayLabelsBoolean || d.valueLen > 0){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * d.xpos + vis.xShift)
            .attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * d.ypos + vis.yShift)
            .attr("width", vis.cellWidth)
            .attr("height", vis.cellWidth);

        // row labels
        vis.svg
            .selectAll(".matrix-row-labels")
            .data(vis.displayFaculty)
            .enter()
            .append("text")
            .attr("class","matrix-row-labels")
            .attr("text-anchor","end")
            .attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * (i+1) + vis.yShift)
            .attr("x", vis.xShift-5)
            .attr("opacity", function(d) {
                if(vis.displayLabelsBoolean){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .text(d => d);

        // column labels
        vis.columnLabels = vis.svg
            .selectAll(".matrix-column-labels")
            .data(vis.displayFaculty)
            .enter()
            .append("text")
            .attr("class","matrix-column-labels")
            .attr("text-anchor","start")
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * (i+1) + vis.xShift)
            .attr("y",vis.yShift-5)
            .attr("transform", (d,i) => "rotate(270," + ((vis.cellPadding + vis.cellWidth) * (i+1) + vis.xShift) +  "," + vis.yShift + ")")
            .attr("opacity", function(d) {
                if(vis.displayLabelsBoolean){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .text(d=>d);

         */

        vis.tooltipDiv = vis.svg.append("div")
            .attr("class", "tooltip-adjacency-matrix")
            .style("opacity", 0);

        vis.updateVis();

    }

    basicRelationData() {
        console.log("At basicRelationData!");
        // create n by n dictionary, mapping pairs to their papers
        let vis = this;

        vis.departmentMap = {};
        vis.peopleInfo.forEach((x) => {
            vis.departmentMap[x["Title"]] = {'researchInterest': x["Research Interests"], 'teachingArea': x["Teaching Areas"]};
        });

        console.log("department map");
        console.log(vis.departmentMap);

        vis.facultyPapersDict = {};
        vis.displayFaculty.forEach((name) => {
            vis.facultyPapersDict[name] = {};
            vis.displayFaculty.forEach((name2) => {
                // create a mapping where we store a list of common papers between the two authors
                // then, we can extract info (namely, the length of this list
                vis.facultyPapersDict[name][name2] = [];
            });
        });

        vis.displayPaperInfo.forEach((paper) => {
            vis.displayFaculty.forEach((name) => {
                // the fact that it's a string... might need to be changed at some point
                if(paper[name] == "1") {
                    vis.displayFaculty.forEach((name2) => {
                        // note that name and name2 could be the same, which is fine
                        if(paper[name2] == "1") {
                            // we will be most interested in the LENGTH of this list
                            // but we may want to display a list of abstracts, titles, etc.
                            vis.facultyPapersDict[name][name2].push(paper);
                        }
                    });
                }
            });
        });
        console.log("Finished up vis.facultyPapersDict creation");

    }

    createMatrixData() {
        let vis = this;
        // this function will use some names of faculty (vis.displayFaculty), and some dataset, and create an adjacency matrix to use


        // now create a list of objects, each object containing a list of objects, each of those objects with papers and names of two authors
        let facultyListOfLists = [];
        let matrixLongList = [];
        let xpos = 0;
        vis.displayFaculty.forEach((name) => {

            let facultyObj = {};
            facultyObj.name = name;
            facultyObj.relations = [];
            let ypos = 0;
            vis.displayFaculty.forEach((name2) => {
                let facultyPairObj = {};
                facultyPairObj.name1 = name;
                facultyPairObj.name2 = name2;
                facultyPairObj.values = vis.facultyPapersDict[name][name2];
                facultyPairObj.valueLen = vis.facultyPapersDict[name][name2].length;
                facultyPairObj.xpos = xpos;
                facultyPairObj.ypos = ypos;
                facultyPairObj.nameKey = name + ";" + name2;
                facultyObj.relations.push(facultyPairObj);
                matrixLongList.push(facultyPairObj);
                ypos = ypos+1;
            });
            facultyObj.researchInterest = vis.departmentMap[name].researchInterest;
            facultyObj.teachingArea = vis.departmentMap[name].teachingArea;
            facultyListOfLists.push(facultyObj);
            xpos = xpos+1;
        });

        vis.matrixData = facultyListOfLists;
        vis.matrixLongList = matrixLongList;
        console.log(vis.matrixData);
    }

    sortAndFilterValues() {
        let vis = this;
        console.log(selectedFacultyAdjSort);

        // ok, it has a new value of selectedFacultyAdjSort
        vis.displayFaculty = [];

        // here is where we sort and filter, because we updated the visualization for a reason
        vis.matrixData.sort(function(a, b){return a[selectedFacultyAdjSort].localeCompare(b[selectedFacultyAdjSort])});
        vis.matrixData.forEach((x) => vis.displayFaculty.push(x.name));

        // then for filtering

        // eventually make this list bigger. You might filter by different things, so have different behavior
        let researchInterestList = ["Artificial Intelligence"];
        if (researchInterestList.includes(selectedFacultyAdjFilter)) {
            let filteredFaculty = vis.displayFaculty.filter(name => vis.departmentMap[name].researchInterest.includes(selectedFacultyAdjFilter));
            vis.displayFaculty = filteredFaculty;
        }
        // this is the case where we JUST clicked on filtering back
        else if (newFilterBack) {
            // in the original order. Maybe reset the buttons too
            vis.displayFaculty = vis.allFaculty;
            newFilterBack = false;
        }

        vis.cellWidth = d3.max([vis.cellScalar * ((vis.minDim - d3.max([vis.xShift, vis.yShift])) / vis.displayFaculty.length),2])
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

        //vis.sortAndFilterValues();
        //vis.createMatrixData();
        //console.log("New matrix data here");
        //console.log(vis.matrixData);

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
            //.selectAll(".matrix-relation-squares")
            //.data(vis.matrixLongList, (d) => d.nameKey)
            .enter() // ENTER
            .append("rect")
            .attr("class","matrix-relation-squares")
            .merge(relationSquares) // ENTER + UPDATE
            .transition(trans)
            .attr("fill", function(d) {
                // I may want to toggle opacity, for example
                if (d.valueLen > 0) {
                    return "purple";
                } else {
                    return "gray";
                }
            })
            .attr("opacity", function(d) {
                if (vis.displayLabelsBoolean || d.valueLen > 0){
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * d.xpos + vis.xShift)
            .attr("y", (d,i) => (vis.cellPadding + vis.cellWidth) * d.ypos + vis.yShift)
            .attr("width", vis.cellWidth)
            .attr("height", vis.cellWidth);

        let rowLabels = vis.svg
            .selectAll(".matrix-row-labels")
            .data(vis.displayFaculty);

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

        // same for column labels
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

    }

    mouseoverFunction(event, d) {
        // tooltip from https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
        let xpos = d3.pointer(event)[0];
        let ypos = d3.pointer(event)[1];
        // show tooltip
        vis.tooltipDiv
            .style("left", (xpos + 20) + vis.margin.left + "px")
            .style("top", (ypos + 20) + vis.margin.top + "px")
            .transition()
            .duration(200)
            .style("opacity", .9);

        // display interesting facts
        vis.tooltipDiv.html(d.nameKey);
    }
}