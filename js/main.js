let wordBarLongString = ""; // this will be modified with words, if we do new things with the bar graph
let wordBarSubTitle = "";
let wordBarColor = ""; // send over the color of the selected box
let selectedFacultyAdjFilter = "";
let selectedFacultyTableFilter = "";

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


    myWordBarVis = new wordBarVis("word-frequency-chart");
    myFacultyAdjVis = new adjMatrixVis("faculty-adj-matrix", peopleData, perPaperVals, latestPeopleData);
    myFacultyManyTableVis = new manyTableVis("faculty-interest-table", peopleData, coursesData, latestPeopleData);
    myFacultyDotsVis = new groupDotsVis("faculty-dots", peopleData, coursesData, latestPeopleData);
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
