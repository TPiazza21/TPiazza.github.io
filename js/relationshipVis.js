/* * * * * * * * * * * * * *
*      class RelationshipVis     *
* * * * * * * * * * * * * */

class RelationshipVis {

    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;

        this.initVis()
    }

    find(text) {
        let vis = this;

        let i;
        for (i = 0; i < vis.Nodes.length; i += 1) {
            if (vis.Nodes[i].name === text) {
                return vis.Nodes[i];
            }
        }
        return null;
    }

    repress(stat){
        let vis = this;
        vis.Nodes.forEach(function(d){
            d3.select("#" + d.id).classed("repressNode", stat);
        })

        vis.links.forEach(function(d){
            d3.select("#" + d.id).classed("repressLink", stat);
        })
    }

    mouse_action(val, stat, direction) {
        let vis = this;

        d3.select("#" + val.id).classed("active", stat);

        vis.links.forEach(function (d) {
            if (direction == "root") {
                if (d.source.id === val.id) {
                    d3.select("#" + d.id).classed("activelink", stat); // change link color
                    d3.select("#" + d.id).classed("link", !stat); // change link color
                    if (d.target.lvl < val.lvl)
                        vis.mouse_action(d.target, stat, "left");
                    else if (d.target.lvl > val.lvl)
                        vis.mouse_action(d.target, stat, "right");
                }
                if (d.target.id === val.id) {
                    d3.select("#" + d.id).classed("activelink", stat); // change link color
                    d3.select("#" + d.id).classed("link", !stat); // change link color
                    if (direction == "root") {
                        if(d.source.lvl < val.lvl)
                            vis.mouse_action(d.source, stat, "left");
                        else if (d.source.lvl > val.lvl)
                            vis.mouse_action(d.source, stat, "right");
                    }
                }
            }else if (direction == "left") {
                if (d.source.id === val.id && d.target.lvl < val.lvl) {
                    d3.select("#" + d.id).classed("activelink", stat); // change link color
                    d3.select("#" + d.id).classed("link", !stat); // change link color

                    vis.mouse_action(d.target, stat, direction);
                }
                if (d.target.id === val.id && d.source.lvl < val.lvl) {
                    d3.select("#" + d.id).classed("activelink", stat); // change link color
                    d3.select("#" + d.id).classed("link", !stat); // change link color
                    vis.mouse_action(d.source, stat, direction);
                }
            }else if (direction == "right") {
                if (d.source.id === val.id && d.target.lvl > val.lvl) {
                    d3.select("#" + d.id).classed("activelink", stat); // change link color
                    d3.select("#" + d.id).classed("link", !stat); // change link color
                    vis.mouse_action(d.target, stat, direction);
                }
                if (d.target.id === val.id && d.source.lvl > val.lvl) {
                    d3.select("#" + d.id).classed("activelink", stat); // change link color
                    d3.select("#" + d.id).classed("link", !stat); // change link color
                    vis.mouse_action(d.source, stat, direction);
                }
            }
        });
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g");

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        vis.Nodes = [];
        vis.links = [];

        let listFaculty = [];
        let listTeachingAreas = [];
        let listCenters = [];

        vis.data[0].forEach(function(faculty, index){
            let title = faculty['Title'];
            let teachingAreas = faculty['Teaching Areas'].split('|');
            let researchInterests = faculty['Research Interests'].split('|');

            if(teachingAreas.length === 1 && teachingAreas[0] === ""){return;}
            if(researchInterests.length === 1 && researchInterests[0] === ""){return;}

            listFaculty.push(title);

            vis.Nodes.push({
                "lvl": 1,
                "name": title
            })

            teachingAreas.forEach(function(area){
                if(!listTeachingAreas.includes(area)){
                    listTeachingAreas.push(area);

                    vis.Nodes.push({
                        "lvl": 0,
                        "name": area
                    })
                }

                vis.links.push({
                    "source": title,
                    "target": area
                })
            })
        });

        vis.data[1].forEach(function(row, index){
            let title = row['Title'];
            let center = row['Center'];

            if(!listFaculty.includes(title)){return;}

            if(!listCenters.includes(center)) {
                listCenters.push(center);

                vis.Nodes.push({
                    "lvl": 2,
                    "name": center
                })
            }

            vis.links.push({
                "source": title,
                "target": center
            })
        });

        vis.Nodes.sort(function(a,b){
            if (a.lvl === b.lvl){
                return a.name.localeCompare(b.name);
            }
            return a.lvl - b.lvl;
        });

        listTeachingAreas.sort(function(a,b){ return a.localeCompare(b) });
        listFaculty.sort(function(a,b){ return a.localeCompare(b) });
        listCenters.sort(function(a,b){ return a.localeCompare(b) });

        vis.colors = ["#e41a1c","#377eb8","#4daf4a","#984ea3","#f781bf"];
        vis.colorAreas = d3.scaleOrdinal().domain(listTeachingAreas).range(vis.colors)
        vis.colorCenters = d3.scaleOrdinal().domain(listCenters).range(vis.colors)

        vis.areaCount = listTeachingAreas.length;
        vis.facultyCount = listFaculty.length;
        vis.centerCount = listCenters.length;

        //vis.displayData = {"Nodes": vis.Nodes, "links": vis.links};

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.diagonal = function link(d) {
            return "M" + d.source.y + "," + d.source.x
                + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
                + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
                + " " + d.target.y + "," + d.target.x;
        };
        /*
        vis.diagonal = function link(d) {
            return "M" + d.source.y + "," + d.source.x
                + "L" + d.target.y + "," + d.target.x;
        };
         */

        let count = [];
        vis.Nodes.forEach(function (d) {
            count[d.lvl] = 0;
        });
        vis.lvlCount = count.length;

        vis.boxWidth = 250;
        vis.boxHeight = 12;
        vis.gap = {width: (vis.width-3*vis.boxWidth)/2, height: 0.5};

        vis.boxHeightArea = (vis.height - vis.areaCount*vis.gap.height) / vis.areaCount;
        vis.boxHeightCenter = (vis.height - vis.centerCount*vis.gap.height) / vis.centerCount;

        vis.Nodes.forEach(function (d, i) {
            if(d.lvl === 0){
                d.x = d.lvl * (vis.boxWidth + vis.gap.width);
                d.y = (vis.boxHeightArea + vis.gap.height) * count[d.lvl];
                d.id = "n" + i;
                count[d.lvl] += 1;
            }else if(d.lvl === 2){
                d.x = d.lvl * (vis.boxWidth + vis.gap.width);
                d.y = (vis.boxHeightCenter + vis.gap.height) * count[d.lvl];
                d.id = "n" + i;
                count[d.lvl] += 1;
            }else{
                d.x = d.lvl * (vis.boxWidth + vis.gap.width);
                d.y = (vis.boxHeight + vis.gap.height) * count[d.lvl];
                d.id = "n" + i;
                count[d.lvl] += 1;
            }
        });

        vis.links.forEach(function (d) {
            d.id = "l" + vis.find(d.source).id + vis.find(d.target).id;
            d.source = vis.find(d.source);
            d.target = vis.find(d.target);
        });

        vis.svg.append("g")
            .attr("class", "nodes");

        let node = vis.svg.select(".nodes")
            .selectAll("g")
            .data(vis.Nodes)
            .enter()
            .append("g")
            .attr("class", "unit");

        node.append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("id", function (d) { return d.id; })
            .attr("width", vis.boxWidth)
            .attr("height", function(d) {
                if(d.lvl === 0){ return vis.boxHeightArea; }
                if(d.lvl === 2){ return vis.boxHeightCenter; }
                else{ return vis.boxHeight; }
            })
            .attr("fill", function(d){
                if(d.lvl === 0){ return vis.colorAreas(d.name); }
                else if(d.lvl === 2){ return vis.colorCenters(d.name); }
                else{ return "#CCC"; }
            })
            .attr("class", "node")
            .attr("rx", 6)
            .attr("ry", 6)
            .on("mouseover", function () {
                vis.repress(true);
                vis.mouse_action(d3.select(this).datum(), true, "root");
            })
            .on("mouseout", function () {
                vis.repress(false);
                vis.mouse_action(d3.select(this).datum(), false, "root");
            });

        node.append("text")
            .attr("class", "label")
            .attr("x", function (d) { return d.x + 14; })
            .attr("y", function (d) {
                if(d.lvl === 0){
                    return d.y + vis.boxHeightArea/2;
                }else if(d.lvl ===2){
                    return d.y + vis.boxHeightCenter/2;
                }else{
                    return d.y + vis.boxHeight-3;
                }
            })
            .text(function (d) { return d.name; });

        console.log(vis.links)
        vis.links.forEach(function (li) {
            vis.svg.append("path", "g")
                .attr("class", "link")
                .attr("id", li.id)
                .attr("d", function () {
                    let oTarget;
                    let oSource;

                    if(li.target.lvl === 0){
                        oTarget = {
                            x: li.target.y + 0.5 * vis.boxHeightArea,
                            y: li.target.x
                        };
                        oSource = {
                            x: li.source.y + 0.5 * vis.boxHeight,
                            y: li.source.x
                        };

                        if (oSource.y < oTarget.y) {
                            oSource.y += vis.boxWidth;
                        } else {
                            oTarget.y += vis.boxWidth;
                        }
                    }else{
                        oTarget = {
                            x: li.target.y + 0.5 * vis.boxHeightCenter,
                            y: li.target.x
                        };
                        oSource = {
                            x: li.source.y + 0.5 * vis.boxHeight,
                            y: li.source.x
                        };

                        if (oSource.y < oTarget.y) {
                            oSource.y += vis.boxWidth;
                        } else {
                            oTarget.y += vis.boxWidth;
                        }
                    }

                    return vis.diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .attr("stroke", function(){
                    if(li.target.lvl === 0){ return vis.colorAreas(li.target.name); }
                    else{ return vis.colorCenters(li.target.name); }
                });
        });
    }
}
