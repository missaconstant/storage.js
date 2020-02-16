window.addEventListener('load', function () {

    // database initializing
    _Storage.initDb({
        name    : 'storagedb',
        tables  : {
            employee    : {
                header  : ['name', 'job', 'phonenumber', 'idnumber'],
                rows    : []
            }
        }
    });

    // select database to work on
    _Storage.selectDb('storagedb');

    // select table employee
    _Storage.selectTable('employee');

    // add a line to table
    // _Storage.addLine({ name: 'John Doe', job: 'Developer', idnumber: 'C0011209876', phonenumber: '+225000000000' });

    // read a line from table
    // var employee = _Storage.getLine(1);

    // update line in a table
    // _Storage.updateLine(1, { phonenumber: '+22567879899' });

    // delete a line from table
    // _Storage.removeLine(4);

    // where clause
    var crew = _Storage.getLines();
        crew = _Storage.where('id', '<=', 2);

    // log
    console.table(crew);

});
