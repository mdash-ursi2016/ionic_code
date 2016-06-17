import {Page, Storage, SqlStorage, NavController, Toast} from 'ionic-angular';
import {Chart} from 'chart.js';
import {StorageService} from '../storage/service';

@Page({
  templateUrl: 'build/pages/data/data.html'
})
export class DataPage {
    static get parameters() {
	/* Used for Loading and Storage*/
	return [[NavController], [StorageService]];
    }

    constructor(nav,service) {
	/* Used for Loading */
	this.nav = nav;
	/* Used for storage */
	this.service = service;
    }

  /* Draw an empty graph when the page is first loaded */
  onPageLoaded()
    {
	DataPage.labels = [];
	DataPage.db = [];
	DataPage.makeChart();
    }


    /* Retrieve a fixed amount of data from storage and show the graph */
    retrieve() {

	let j = 0;
	this.service.retrieve().then(
	    function(value) {
		/* A data object is returned, iterate through it */
		for (var i = 0; i < value.res.rows.length; i++) {
		    /* Add data to graphing arrays */
		    DataPage.labels.push(i.toString());
		    DataPage.db.push(value.res.rows.item(i).value);

		    /* Because retrieving data takes time, we have a third
		       variable checking for the end of the loop to update
		       the graph */
		    j++;
		    if (j == value.res.rows.length) {
			DataPage.makeChart();
		    }

		}
		
	    },  
	    function(value) { alert("Error"); }
	);
    }    

    /* Erase the current graph and redraw with no data.
       This function should eventually be hidden in settings */
    clear() {
	/* Delete the table and make a new one */
	this.service.clear();
	this.service.makeTable();
	
	/* Notify the event with a Toast */
	let toast = Toast.create({
            message: 'Table Cleared',
            duration: 2000,
            position: 'bottom'
        });
        this.nav.present(toast);

	/* Reset the data and redraw the graph */
	DataPage.labels = [];
	DataPage.db = [];
	DataPage.makeChart();
    }


    /* Charts.js graph routine */
    static makeChart() {
	var ctx = document.getElementById("chart");
	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
		labels: DataPage.labels,
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
		    data: DataPage.db,
		    borderWidth: 1
		}]
	    },
	});
    }

}
