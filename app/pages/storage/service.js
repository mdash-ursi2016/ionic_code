import {Storage, SqlStorage} from 'ionic-angular';
import {Injectable} from 'angular2/core';

@Injectable()
export class StorageService {
    constructor() {
	this.storage = new Storage(SqlStorage);
    }

    /* Create a new table, as long as one doesn't already exist, with datetime and integer columns */
    makeTable() {
	this.storage.query('CREATE TABLE IF NOT EXISTS dataTable(ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP, value INTEGER)').then(
	    function() {alert("Table exists: dataTable");},
	    function() {alert("Failed to create table");}
	);
    }

    /* Store a value into the database with the current time automatically generated */
    store(newVal) {
	this.storage.query('INSERT INTO dataTable(value) VALUES(?)',[newVal]).then(
	    function() {alert("Stored data: " + newVal);},
	    function() {alert("Failed to store data");}
	);
    }
    
    /* Retrieve all data points from the database, loop over them, and display the values */
    retrieve() {
	this.storage.query('SELECT * FROM dataTable').then(
	    function(val) {
		for (var i = 0; i < val.res.rows.length; i++) {
		    alert("Row " + i + ": " + val.res.rows.item(i).value);
		}
	    },
	    function() {alert("Failed to retrieve data (is database empty?)");}
	);
    }

    /* Delete the table */
    clear() {
	this.storage.query('DROP TABLE dataTable').then(
	    function() {alert("Table Deleted");},
	    function() {alert("Failed to delete table");}
	);
    }
    

}
