// load data using promises
let promises = [
    d3.csv("data/faculty_coauthor_matrix.csv"),
    d3.csv('data/per_paper_vals_v1.csv'),
    d3.csv('data/Visualization Data_People.csv'),
    d3.csv('data/Visualization Data_Courses.csv'),
    d3.csv('data/Visualization Data_News.csv'),
    d3.csv('data/Visualization Data_Programs.csv')
    // please add additional data AFTER these, so that people's indexing isn't messed up...
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {

    // log data
    console.log('Check out the data', dataArray);

    // initialize the visualizations here
    //myMatrixVis = new MatrixVis('matrixDiv', dataArray[0], dataMarriages, dataBusiness)
}