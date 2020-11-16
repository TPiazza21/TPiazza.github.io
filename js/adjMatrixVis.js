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
        vis.cellWidth = 18;
        vis.cellPadding = 5;
        vis.yShift = 100;
        vis.xShift = 100;

        vis.allFamilyData = [];
        vis.allFamilyDict = {};

        /*
        // collect data in one structure
        for(let i = 0; i < vis.numFamilies; i++) {
            let family = {};
            family["index"] = i;
            family["name"] = vis.familyInfo[i]["Family"];
            family["businessValues"] = vis.businessMatrix[i];
            family["businessTies"] = vis.businessMatrix[i].reduce((a,b) => a + b);
            family["marriageValues"] = vis.marriageMatrix[i];
            family["marriageTies"] = vis.marriageMatrix[i].reduce((a,b) => a + b);
            family["allRelations"] = family["businessTies"] + family["marriageTies"];
            // I might want to handle this with the NA values...
            if (vis.familyInfo[i]["Priorates"] == "NA") {
                family["numberPriorates"] = 0;
            } else {
                family["numberPriorates"] = +vis.familyInfo[i]["Priorates"];
            }
            family["wealth"] = +vis.familyInfo[i]["Wealth"];
            vis.allFamilyData.push(family);
            vis.allFamilyDict[i] = family;
        }

        // put everything in row objects, so they can move later
        vis.rows = vis.svg
            .selectAll(".matrix-row").data(vis.allFamilyData, (d) => d["name"])
            .enter()
            .append("g")
            .attr("transform",(d,i) => "translate(0," + ((vis.cellPadding + vis.cellWidth) * i + vis.yShift) + ")")
            .attr("class","matrix-row");

        vis.rows
            .append("text")
            .attr("x", vis.xShift)
            .attr("y", vis.cellWidth/2)
            .attr("text-anchor","end")
            .text(d=>d.name);

        // populate the triangles
        vis.marriageTriangles = vis.rows
            .selectAll(".matrix-triangle-marriage")
            .data(d=>d["marriageValues"])
            .enter()
            .append("path")
            .attr("class","matrix-triangle-marriage")
            .attr("fill", function(d) {
                if (d == 0) {
                    return "grey";
                } else {
                    return "purple";
                }
            })
            .attr("d", function(d,i) {
                let x = (vis.cellPadding + vis.cellWidth) * i + vis.xShift;
                let y = 0;
                return 'M ' + x +' '+ y + ' l ' + vis.cellWidth + ' 0 l 0 ' + vis.cellWidth + ' z';
            });

        vis.businessTriangles = vis.rows
            .selectAll(".matrix-triangle-business")
            .data(d=>d["businessValues"])
            .enter()
            .append("path")
            .attr("class","matrix-triangle-business")
            .attr("fill", function(d) {
                if (d == 0) {
                    return "grey";
                } else {
                    return "orange";
                }
            })
            .attr("d", function(d,i) {
                let x = (vis.cellPadding + vis.cellWidth) * i + vis.xShift;
                let y = 0;
                return 'M ' + x +' '+ y + ' l 0 ' + vis.cellWidth + ' l ' + vis.cellWidth + ' 0 z';
            });

        // these might just be static
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

        console.log("Display data is ",vis.allFamilyData);

         */
    }


    updateVis(){
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
}