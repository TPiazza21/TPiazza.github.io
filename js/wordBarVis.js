/* * * * * * * * * * * * * *
*      class wordBarVis        *
* * * * * * * * * * * * * */


class wordBarVis {
    constructor(parentElement){
        this.parentElement = parentElement;
        //this.peopleInfo = peopleInfo;
        //this.perPaperInfo = perPaperInfo;
        //this.latestPeopleInfo = latestPeopleInfo;

        //this.initVis();
        //console.log("at wordBarVis");
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 40, right: 60, bottom: 60, left: 60};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // actually create the squares (and labels, maybe)
        //vis.wrangleData()
        //vis.updateVis();

    }

    wrangleData() {
        let vis = this;


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
                // show info on the "sticky note"
                vis.clickFacts(d);
            })
            .merge(relationSquares) // ENTER + UPDATE
            .transition(trans)
            .attr("fill", function(d) {
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
                    return 0.5;
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


}