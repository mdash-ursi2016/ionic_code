import {Page, NavController, Toast} from 'ionic-angular';
import {Chart} from 'chart.js';
import {StorageService} from '../../services/storageservice/storageservice';
import {HttpService} from '../../services/httpservice/httpservice';

@Page({
  templateUrl: 'build/pages/data/data.html'
})
export class DataPage {
    static get parameters() {
	/* Used for Loading and Storage*/
	return [[NavController], [StorageService], [HttpService]];
    }

    constructor(nav,storage, httpservice) {
	/* Used for Loading */
	this.nav = nav;
	/* Used for storage */
	this.storage = storage;
	/* Used for token/http requests */
	this.httpservice = httpservice;
	this.startDate = new Date().toISOString();
	this.endDate = new Date().toISOString();
    }

  /* Draw an empty graph when the page enters */
  onPageDidEnter()
    {
	this.labels = [];
	this.db = [];
	this.makeChart();
    }
    
    /* Retrieve authorization token from server */
    getToken() {
	this.httpservice.getToken().then((success) => {
	    this.storage.storeToken(success);
	    let toast = Toast.create({
		message: success,
		duration: 2000,
		position: 'bottom',
		showCloseButton: true
	    });
	    this.nav.present(toast);
	}, (error) => {
	    alert(JSON.stringify(error));
	});
    }


    store() {
	/* Store the current date and a random number 1-100 */
	this.storage.store(new Date(),Math.floor(Math.random() * 100) + 1);
    }

    /* Retrieve a fixed amount of data from storage and show the graph */
    retrieve() {
	/* Get the dates from the Datetime Ionic component and create a Date() object */
	let s1 = this.strParse(this.startDate);
	let s2 = this.strParse(this.endDate);

	/* The parse function separates ISO 8601 times into individual components */
	var d1 = new Date(s1[0],s1[1],s1[2],s1[3],s1[4]).toISOString();
	var d2 = new Date(s2[0],s2[1],s2[2],s2[3],s2[4]).toISOString();
	
	this.labels = [];
	this.db = [];

	var self = this;

	/* Make a get request, with a callback function for graphing */
	this.httpservice.makeGetRequest(d1,d2, function(dates) {

	    /* Magic parsing techniques for the return value */
	    dates = JSON.parse(dates._body);
	    for (var i = 0; i < dates.length; i++) {

		/* Push all of the dates as labels and values as points */
		self.labels.push(dates[i].header.creation_date_time.toString());
		self.db.push(dates[i].body.heart_rate.value);
	    }
	    
	    self.makeChart();

	});
    }    
	
    /* Erase the current graph and redraw with no data.
       This function should eventually be hidden in settings */
    clear() {
	/* Delete the table and make a new one */
	this.storage.clear();
	this.storage.makeTable();
	
	/* Notify the event with a Toast */
	let toast = Toast.create({
            message: 'Table Cleared',
            duration: 2000,
            position: 'bottom',
	    showCloseButton: true
        });
        this.nav.present(toast);

	/* Reset the data and redraw the graph */
	this.labels = [];
	this.db = [];
	this.makeChart();
    }


    /* Charts.js graph routine */
    makeChart() {
	var ctx = document.getElementById("chart");
	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
		labels: this.labels,
		datasets: [{
		    label: "Heart Rate",
		    fill: false,
		    lineTension: 0.1,
		    backgroundColor: "rgba(75,192,192,0.4)",
		    borderColor: "rgba(75,192,192,1)",
		    borderCapStyle: 'butt',
		    borderDash: [],
		    borderDashOffset: 0.0,
		    borderJoinStyle: 'miter',
		    pointBorderColor: "rgba(75,192,192,1)",
		    pointBackgroundColor: "#fff",
		    pointBorderWidth: 1,
		    pointHoverRadius: 5,
		    pointHoverBackgroundColor: "rgba(75,192,192,1)",
		    pointHoverBorderColor: "rgba(220,220,220,1)",
		    pointHoverBorderWidth: 2,
		    pointRadius: 1,
		    pointHitRadius: 10,
		    data: this.db,
		    borderWidth: 1
		}]
	    },
	    options: {
		scales: {
		    xAxes: [{
			ticks: {
			    maxTicksLimit: 20
			}
		    }]
		}
	    }
	});
    }


    strParse(str) {
	return [
	    parseInt(str.slice(0,4)), /* Year */
	    parseInt(str.slice(5,7)) - 1, /* Month */
	    parseInt(str.slice(8,10)), /* Day */
	    parseInt(str.slice(11,13)), /* Hour */
	    parseInt(str.slice(14,16)) /* Minute */
	];
    }

}
