import {Storage, SqlStorage} from 'ionic-angular';
import {Injectable} from '@angular/core';

@Injectable()
export class StorageService {
    constructor() {
	this.storage = new Storage(SqlStorage);
    }

    /* Create a new table, as long as one doesn't already exist, with datetime and integer columns */
    makeTable() {
	this.storage.query('CREATE TABLE IF NOT EXISTS dataTable(date DATETIME, value INTEGER)').then(
	    function() {},
	    function() {alert("Failed to create table");}
	);
    }

    /* Store a value into the database with the current time automatically generated */
    store(date,newVal) {
	this.storage.query('INSERT INTO dataTable(date,value) VALUES(?,?)',[date,newVal]).then(
	    function() {}, //{alert("Stored data: " + newVal);},
	    //function() {alert("Failed to store data");}
	    function() {}
	);
    }
    
    /* Retrieve all data points from the database, loop over them, and display the values */
    retrieve() {
	//return this.storage.query('SELECT * FROM dataTable WHERE date BETWEEN ? AND ?',[date1,date2]);
	return this.storage.query('SELECT * FROM dataTable');
    }

    /* Delete the table */
    clear() {
	this.storage.query('DROP TABLE dataTable').then(
	    function() {},
	    function() {alert("Failed to delete table");}
	);
    }

    /* Save the token */
    storeToken(token) {
	this.storage.set('token',token);
    }

    /* Retrieve the token */
    retrieveToken() {
	return this.storage.get('token');
    }

    /* Save the peripheral id */
    storePeripheral(id) {
	this.storage.set('peripheral',id);
    }

    /* Retrieve the peripheral id */
    retrievePeripheral() {
	return this.storage.get('peripheral');
    }

}
