/**
* @author Atomix dev team
*
* This namespace to easly manage localstorage
* @namespace Storage
*/
var _Storage = {
    /**
     * storage object from window
     */
    storage: window.localStorage,

    db: null,

    selected: null,

    selectedTable: null,

    getted: null,

    inittial: null,

    /**
     * This to initialize a database
     * @namespace Storage
     * @param {Object} options
     * @param {function} callback: success callback
     * @param {function} fail: fail callback
     * @return Storage
     */
    initDb: function (options, callback, fail) {
    if (options && options.name && !this.existsDb(options.name)) {
        var newDb = {
        dbinfos: {name: options.name},
        tables: options.tables ? options.tables : {}
        };

        this.storage.setItem(options.name, JSON.stringify(newDb));
        /* select the db */
        this.selectDb(options.name);

        if (callback) callback();
        console.log("Database "+options.name+"setted correctly !");
    }
    else if(this.existsDb(options.name)){
        /* select the db */
            this.selectDb(options.name);

        if (callback) callback();
        console.log("Database "+options.name+" inited !");
    }
    else {
        if (fail) fail();
        console.error('Cannot initiate this database.');
    }
    },

    /**
     * This function creates new item in localstorage called db
     * @namespace Storage
     * @param {String} dbname
     * return Storage
     */
    newDb: function (dbname) {
        this.storage.setItem(dbname, '{"dbinfos": {"name": "'+dbname+'"}, "tables": {}}');
        return this;
    },

    /**
     * This function select a database
     * @namespace Storage
     * @param {String} dbname
     * return Storage
     */
    selectDb: function (dbname) {
    /* initialisation if needed */
    // this.initDb(this.inittial);

    var founded = this.storage.getItem(dbname);

    if (founded) {
        this.db = JSON.parse(founded);
        this.selected = dbname;
        return this;
    }
    else {
        console.error("Database "+dbname+" doesn't exists !");
    }
    },

    /**
     * This function check for database exists
     * @namespace Storage
     * @param {String} dbname
     * return {bool}
     */
    existsDb: function (dbname) {
    return this.storage.getItem(dbname) ? true : false;
    },

    /**
     * This function remove a database
     * @namespace Storage
     * @param {String} dbname
     * return Storage
     */
    removeDb: function (dbname) {
    var founded = this.storage.getItem(dbname);

    if (founded) {
        this.storage.removeItem(dbname);
        this.db = null;
        this.selected = null;
        return this;
    }
    else {
        console.error("Database "+dbname+" doesn't exists !");
    }
    },

    /**
     * This function save a database
     * @namespace Storage
     * return Storage
     */
    saveDb: function () {
        if (this.selected) {
            if (this.storage.getItem(this.selected)) {
                this.storage.setItem(this.selected, JSON.stringify(this.db));
                return this;
            }
        }
        else {
            console.error("You should select a database");
            return false;
        }
    },

    /**
     * This function add a table to database
     * @namespace Storage
     * @param {String} tablename
     * @param {Array} columns
     * return Storage
     */
    addTable: function (tablename, columns) {
        if (this.dbSelected()) {
            if (!this.existsTable()) {
                this.db.tables[tablename] = {
                    header: columns,
                    rows: []
                };
                this.saveDb();

                return this;
            }
            else {
                console.error("Table "+tablename+" already exists");
            }
        }
        else {
            console.error("You should select a database");
        }
    },

    /**
     * This function verify if table exists
     * @namespace Storage
     * @param {String} tablename
     * return {bool}
     */
    existsTable: function (tablename) {
        this.checkDbSelected();

        return this.db.tables[tablename] ? true : false;
    },

    /**
     * This function list tables
     * @namespace Storage
     * return {Array}
     */
    listTable: function () {
        this.checkDbSelected();

        var tables = [];
        for (var table in this.db.tables) {
        if (this.db.tables[table] != null) {
            tables.push(table);
        }
        }

        return tables;
    },

    /**
     * This function select a table
     * @namespace Storage
     * @param {String} tablename
     * return Storage
     */
    selectTable: function (tablename) {
        if (this.existsTable(tablename)) {
            this.selectedTable = tablename;
            return this;
        }
        else {
            console.error("Table "+tablename+" doesn't exists !");
        }
    },

    /**
     * This function remove a table
     * @namespace Storage
     * @param {String} tablename
     * return Storage
     */
    removeTable: function (tablename) {
        if (this.existsTable(tablename)) {
            this.db.tables[tablename] = null;
            this.selectedTable = this.selectedTable==tablename ? null : this.selectedTable;
            /**/
            this.saveDb();
            /**/
            return this;
        }
        else {
            console.log("Table "+tablename+" doesn't exists !");
        }
    },

    getTableHead: function () {
    this.checkTableSelected();

    return this.db.tables[this.selectedTable].header;
    },

    /**
     * This function add a line to a table
     * @namespace Storage
     * @param {Object} line
     * return {Int} id, last insert id
     */
    addLine: function (line, addnull) {
        if (this.checkColumnMatch(line)) {
        return false;
        }

        this.db.tables[this.selectedTable].header.forEach(function(head) {
            if (!line[head]) {
                line[head] = addnull ? null : '';
            }
        });
        /* adding id */
        var id = this.db.tables[this.selectedTable].rows.length + 1;
        line['id'] = id;
        /**/
        this.db.tables[this.selectedTable].rows.push(line);
        /**/
        this.saveDb();

        return id;
    },

    /**
     * This method to get a line from selected table
     * @param {Int} id
     * return {Object || false} line
     */
    getLine: function (id) {
        this.checkTableSelected();

        var row = null;

        if (row = this.db.tables[this.selectedTable].rows[id-1]) {
            this.getted = row;
            return row;
        }
        else {
            return false;
        }

    },

    /**
     * This method to get a list of line from selected table
     * @param {int} limitBegin
     * @param {int} limitEnd
     * return {Array} lines
     */
    getLines: function (limitBegin, limitEnd) {
        this.checkTableSelected();

        var lines = [];

        lines = this.db.tables[this.selectedTable].rows.filter(function (val) { return val != false && val != null });

        this.getted = lines;

        return this.limitLines(lines, limitBegin, limitEnd);
    },

    /**
     * This method to limit number of lines to return
     * @param {Array} lines
     * @param {Int} begin
     * @param {Int} end
     * return {Array} lines
     */
    limitLines: function (lines, begin, end) {
        return end ? lines.slice(begin, end+1) : lines.slice(begin);
    },

    /**
     * This method to get a reverted list from selected table
     * @param {Int} begin
     * @param {Int} end
     * return {Array} lines
     */
    getReversedLines: function (begin, end) {
        return this.limitLines(this.getLines().reverse(), begin, end);
    },

    /**
     * This method to get lines length from selected table
     * @param {Int} id
     * return {Object || false} line
     */
    countLines: function () {
    this.checkTableSelected();

    return this.db.tables[this.selectedTable].rows.length;
    },

    /**
     * This method to remove a line from selected table
     * id correspond to row position in the rows array so when user call id=x do id-1 to get the right position
     * @param {Int} id
     * return {Storage || false}
     */
    removeLine: function (id) {
        this.checkTableSelected();

        if (this.db.tables[this.selectedTable].rows[id-1]) {
            this.db.tables[this.selectedTable].rows[id-1] = null;
            // need to reorganise to remove null from db
            /**/
            this.saveDb();
            /**/
            return this;
        }
        else {
            return false;
        }
    },

    /**
     * This method to empty a selected table
     * return {Storage || false}
     */
    removeAllLines: function () {
        this.checkTableSelected();

        this.db.tables[this.selectedTable].rows = [];
        this.saveDb();

        return this;
    },

    /**
     * This method to update a line from selected table
     * id correspond to row position in the rows array so when user call id=x do id-1 to get the right position
     * @param {Int} id
     * @param {object} values
     * return {Storage || false}
     */
    updateLine: function(id,values) {
        this.checkTableSelected();

        if (!this.checkColumnMatch(values)) {
            var line = this.getLine(id);

            for (var a in values) {
                line[a] = values[a];
            }

            this.db.tables[this.selectedTable].rows[id-1] = line;
            this.saveDb();

            return true;
        }

        return this;
    },

    where: function (x, sign, y) {
        if (this.getted) {
            this.getted = this.getted.filter(function (one) {
                return eval("one[x.toString()]"+sign+"y.toString()");
            });

            return this.getted;
        }
    },

    dbSelected: function () {
        return this.selected ? true : false;
    },

    checkDbSelected: function () {
        if (!this.selected) {
            console.error("You should select a database");
            return;
        }
    },

    checkTableSelected: function () {
        if (!this.selectedTable) {
            console.error("You should select a table");
            return;
        }
    },

    checkColumnMatch: function(line) {
        this.checkTableSelected();

        var missmatch = false;

        for (var head in line) {
            if (this.db.tables[this.selectedTable].header.indexOf(head) == -1) {
                console.error("Column missmatch error: column "+head+" doesn't exist in"+this.selectedTable);
                missmatch = true;
                break;
            }
        }

        return missmatch;
    }
};
