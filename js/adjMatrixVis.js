/* * * * * * * * * * * * * *
*      class matrixVis        *
* * * * * * * * * * * * * */


class adjMatrixVis {
    constructor(parentElement, peopleInfo, perPaperInfo){
        this.parentElement = parentElement;
        this.peopleInfo = peopleInfo;
        this.perPaperInfo = perPaperInfo;
        //this.businessMatrix = businessMatrix;
        //this.numFamilies = marriageMatrix.length;

        this.initVis();
    }

    initVis(){
        console.log("Init Vis of adjMatrixVis");
        let vis = this;

        vis.margin = {top: 20, right: 60, bottom: 60, left: 60};
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

        // intrinsic properties of the adjacency matrix
        vis.cellWidth = 2;
        vis.cellPadding = 1;
        vis.yShift = 50;
        vis.xShift = 100;

        vis.allFaculty = vis.peopleInfo.map((x) => x.Title);
        console.log(vis.allFaculty);

        // we may decide to filter this list for one reason or another, but for now use all
        vis.displayFaculty = vis.allFaculty;
        vis.displayPaperInfo = vis.perPaperInfo;
        // create vis.matrixData to use
        vis.createMatrixData();

        // put everything in row objects, so they can move later
        vis.rows = vis.svg
            .selectAll(".matrix-row").data(vis.matrixData, (d) => d.name)
            .enter()
            .append("g")
            .attr("transform",(d,i) => "translate(0," + ((vis.cellPadding + vis.cellWidth) * i + vis.yShift) + ")")
            .attr("class","matrix-row");

        // see how the row labels appear?
        vis.rows
            .append("text")
            .attr("x", vis.xShift)
            .attr("y", vis.cellWidth/2)
            .attr("text-anchor","end")
            .text(d=>d.name);

        // populate the triangles
        vis.relationSquares = vis.rows
            .selectAll(".matrix-relation-squares")
            .data(d=>d.relations, (d)=>d.name2) // I may want to be picky about how I ID these things...
            .enter()
            .append("rect")
            .attr("class","matrix-triangle-marriage")
            .attr("fill", function(d) {
                // I may want to toggle opacity, for example
                if (d.valueLen > 0) {
                    return "purple";
                } else {
                    return "gray";
                }
            })
            .attr("opacity", function(d) {
                if (d.valueLen > 0) {
                    return 1.0;
                }
                else {
                    return 0.0;
                }
            })
            .attr("x", (d,i) => (vis.cellPadding + vis.cellWidth) * i + vis.xShift)
            .attr("width", vis.cellWidth)
            .attr("height", vis.cellWidth);

        /*
        vis.columnLabels = vis.svg
            .selectAll(".matrix-column-label")
            .data(vis.allFamilyData, (d) => d["name"])
            .enter()
            .append("text")
            .attr("text-anchor","start")
            .attr("x", (d,i) => ((vis.cellPadding + vis.cellWidth) * i + vis.xShift + vis.cellWidth))
            .attr("y",vis.yShift)
            .attr("transform", (d,i) => "rotate(270," + ((vis.cellPadding + vis.cellWidth) * i + vis.xShift + vis.cellWidth) +  "," + vis.yShift + ")")
            .attr("class","matrix-column-label")
            .text(d=>d.name);

         */

        /*
        vis.svg
            .append("rect")
            .attr("x", ((vis.cellPadding + vis.cellWidth) * vis.numFamilies + vis.xShift + vis.cellWidth))
            .attr("y", ((vis.cellPadding + vis.cellWidth) * (vis.numFamilies-2) + vis.yShift + vis.cellWidth))
            .attr("width", vis.cellWidth)
            .attr("height", vis.cellWidth)
            .attr("fill", "purple");

        vis.svg.append("text")
            .attr("x", ((vis.cellPadding + vis.cellWidth) * (vis.numFamilies+2) + vis.xShift + vis.cellWidth))
            .attr("y", ((vis.cellPadding + vis.cellWidth) * (vis.numFamilies-2) + vis.yShift + vis.cellWidth))
            .text("Marriage");

        vis.svg
            .append("rect")
            .attr("x", ((vis.cellPadding + vis.cellWidth) * (vis.numFamilies+7) + vis.xShift + vis.cellWidth))
            .attr("y", ((vis.cellPadding + vis.cellWidth) * (vis.numFamilies-2) + vis.yShift + vis.cellWidth))
            .attr("width", vis.cellWidth)
            .attr("height", vis.cellWidth)
            .attr("fill", "orange");

        vis.svg.append("text")
            .attr("x", ((vis.cellPadding + vis.cellWidth) * (vis.numFamilies+9) + vis.xShift + vis.cellWidth))
            .attr("y", ((vis.cellPadding + vis.cellWidth) * (vis.numFamilies-2) + vis.yShift + vis.cellWidth))
            .text("Business");

         */

    }

    updateVis(){
        // TODO: implement the changing/sorting/filtering
        console.log(selectedFacultyAdjSort);
        /*
        let vis = this;

        // sort vis.allFamilyData
        vis.allFamilyData.sort((a,b) => b[selectedSort] - a[selectedSort]);
        if (selectedSort == "index") {
            vis.allFamilyData.sort((a,b) => a[selectedSort] - b[selectedSort]);
        }
        console.log(vis.allFamilyData);
        // then move the values around
        vis.rows = vis.svg
            .selectAll(".matrix-row").data(vis.allFamilyData, (d) => d["name"])
            .transition()
            .duration(750)
            .attr("transform",(d,i) => "translate(0," + ((vis.cellPadding + vis.cellWidth) * i + vis.yShift) + ")")
            .attr("class","matrix-row");

         */
    }

    createMatrixData() {
        let vis = this;
        // this function will use some names of faculty (vis.displayFaculty), and some dataset, and create an adjacency matrix to use

        // using publication data
        //vis.displayFaculty
        //vis.displayPaperInfo

        let facultyPapersDict = {};
        vis.displayFaculty.forEach((name) => {
            facultyPapersDict[name] = {};
            vis.displayFaculty.forEach((name2) => {
                // create a mapping where we store a list of common papers between the two authors
                // then, we can extract info (namely, the length of this list
                facultyPapersDict[name][name2] = [];
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
                            facultyPapersDict[name][name2].push(paper);
                        }
                    });
                }
            });
        });

        // now create a list of objects, each object containing a list of objects, each of those objects with papers and names of two authors
        let facultyListOfLists = [];
        vis.displayFaculty.forEach((name) => {
            let facultyObj = {};
            facultyObj.name = name;
            facultyObj.relations = [];
            vis.displayFaculty.forEach((name2) => {
                let facultyPairObj = {};
                facultyPairObj.name1 = name;
                facultyPairObj.name2 = name2;
                facultyPairObj.values = facultyPapersDict[name][name2];
                facultyPairObj.valueLen = facultyPapersDict[name][name2].length;
                facultyObj.relations.push(facultyPairObj);
            });
            facultyListOfLists.push(facultyObj);
        });

        vis.matrixData = facultyListOfLists;
        console.log(vis.matrixData);
    }
}