let wordBarLongString = ""; // this will be modified with words, if we do new things with the bar graph
let wordBarSubTitle = "";
let wordBarColor = ""; // send over the color of the selected box
let selectedFacultyAdjFilter = "";
let selectedFacultyTableFilter = "";
let selectedFacultyNetworkViz=0;

// load data using promises
let promises = [
    d3.csv("data/faculty_coauthor_matrix.csv"),
    d3.csv('data/per_paper_vals_v1.csv'),
    d3.csv('data/Visualization Data_People.csv'),
    d3.csv('data/Visualization Data_Courses.csv'),
    d3.csv('data/Visualization Data_News.csv'),
    d3.csv('data/Visualization Data_Programs.csv'),
    d3.csv('data/Final Visualization Data_People.csv'),
    d3.csv('data/Visualization Data_Centers.csv')
    // please add additional data AFTER these, so that people's indexing isn't messed up...
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {

    // log data
    console.log('Check out the data', dataArray);
    let facultyCoauthorMatrix = dataArray[0];
    let perPaperVals = dataArray[1];
    let peopleData = dataArray[2]; // this is outdated (info is ok, but too many faculty)
    let coursesData = dataArray[3];
    let newsData = dataArray[4];
    let programsData = dataArray[5];
    let latestPeopleData = dataArray[6];  // this is latest list of faculty (as of 11/21)
    let centers = dataArray[7];

    // initialize the visualizations here
    myNetworkVis = new NetworkGraph("network-graph", nodeData);
    myNetworkBarVis = new NetworkBarGraph("network-counts", nodeData.links);


    myWordBarVis = new wordBarVis("word-frequency-chart");
    myFacultyAdjVis = new adjMatrixVis("faculty-adj-matrix", peopleData, perPaperVals, latestPeopleData);
    myFacultyManyTableVis = new manyTableVis("faculty-interest-table", peopleData, coursesData, latestPeopleData);
    myFacultyDotsVis = new groupDotsVis("faculty-dots", peopleData, coursesData, latestPeopleData, nodeData);
    myRelationshipVis = new RelationshipVis("relationshipDiv", latestPeopleData, centers);
}

// handle buttons, sorting, selecting etc. down here

// for the faculty adjacency matrix
selectedFacultyAdjSort = $('#faculty-adj-sort-selector').val();
function sortChangeFacultyAdj() {
    // update matrix once we've changed sorted values
    selectedFacultyAdjSort = $('#faculty-adj-sort-selector').val();
    myFacultyAdjVis.wrangleData();
}

selectedFacultyAdjFilter = $('#faculty-adj-filter-selector').val();
let newFilterBack = false;
function filterChangeFacultyAdj() {
    // filter matrix by these values
    selectedFacultyAdjFilter = $('#faculty-adj-filter-selector').val();
    newFilterBack = (selectedFacultyAdjFilter == "All");
    myFacultyAdjVis.wrangleData();
}

// for the faculty heatmap table for research interests

selectedFacultyTableFilter = $('#faculty-table-filter-selector').val();
//let newFilterBack = false;
function filterChangeFacultyTable() {
    // filter matrix by these values
    selectedFacultyTableFilter = $('#faculty-table-filter-selector').val();
    //newFilterBack = (selectedFacultyAdjFilter == "All");
    myFacultyManyTableVis.wrangleData();
}
selectedFacultyTableFacultySort = $('#faculty-table-faculty-sort-selector').val();
function sortFacultyChangeFacultyTable() {
    // sort table, via the faculty
    selectedFacultyTableFacultySort = $('#faculty-table-faculty-sort-selector').val();
    myFacultyManyTableVis.wrangleData();
}

selectedFacultyTableResearchSort = $('#faculty-table-research-sort-selector').val();
function sortResearchChangeFacultyTable() {
    // sort table, via research interests
    selectedFacultyTableResearchSort = $('#faculty-table-research-sort-selector').val();
    myFacultyManyTableVis.wrangleData();
}

// for the group faculty dots
selectedFacultyDotGrouping = $('#faculty-dots-group-selector').val();

function groupFacultyDotsSelector() {
    selectedFacultyDotGrouping = $('#faculty-dots-group-selector').val();
    myFacultyDotsVis.wrangleData();

}

// for the network visualization
// from https://stackoverflow.com/questions/9895082/javascript-populate-drop-down-list-with-array
var select = document.getElementById("network-selector");
var options = nodeData.nodes.map(d=>d.name)
var ids = nodeData.nodes.map(d=>d.id)

for(var i = 0; i < options.length; i++) {
    var opt = options[i];
    var id = ids[i]
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = id;
    select.appendChild(el);
}

function networkTableSelector() {
    selectedFacultyNetworkViz = $("#network-selector").val();
    $(".table").empty();
    myNetworkVis.updateVis();
    if (selectedFacultyNetworkViz>0) {
        $("#network-table").append('<table style="width:100%"> <tr> <td>Title</td> <td id="network-title" class="table" ></td> </tr>'+
            '<tr> <td>Research Interests</td><td id="network-research-interests" class="table" ></td> </tr>'+
            '<tr><td>Teaching Areas</td> <td id="network-teaching-areas" class="table" ></td> </tr>'+
            '<tr><td>Location</td><td id="network-location" class="table" ></td></tr> </table>');
        let tableData = nodeData.nodes.find(x => x.id == selectedFacultyNetworkViz);
        $("#network-title").text(tableData.primaryTitle);
        $("#network-research-interests").text(tableData.researchInterests);
        $("#network-teaching-areas").text(tableData.teachingArea);
        $("#network-location").text(tableData.location)
        $('#network-pic').prepend('<a href="http://seasdrupalstg.prod.acquia-sites.com/node/'
            +selectedFacultyNetworkViz.toString()+'" target="_blank">'+
            '<img src='+tableData.image +' title="Click for more information" width=200 height=300/>' +
            '</a>')
    }
}