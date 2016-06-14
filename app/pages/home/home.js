import {BluetoothPage} from '../bluetooth/bluetooth';
import {Page, Storage, SqlStorage, NavController, Loading} from 'ionic-angular';
import {Chart} from 'chart.js';

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
    static get parameters() {
	/* Used for Loading */
	return [[NavController]];
    }

    constructor(nav) {
	/* The global storage unit. Perhaps move to HomePage.storage? */
	BluetoothPage.storage = new Storage(SqlStorage);
	HomePage.labels = ["0"];
	HomePage.db = [0];
	/* Used for Loading */
	this.nav = nav;
    }

  onPageLoaded()
    {
	HomePage.makeChart();
    }


    /* Retrieve a fixed amount of data from storage and show the graph */
    retrieve() {
	
	var i; /* Used for indexing the data */
	var j = 1; /* Because the data load is asynchronous with the display, this variable maintains the correct index */
	
	/* Create and display a loading icon while the graph is retrieved and generatd */
	let loading = Loading.create({spinner: 'dots',content: 'Loading Graph...'});
	this.nav.present(loading);

	/* Populate data with fake data for testing -- remove later */
	for (i = 1; i < 50; i++) {
	    BluetoothPage.storage.set(i.toString(),i);
	}
	/* Retrieve fixed amount of data from storage */
	for (i = 1; i < 50; i++)
	  {
	      /* Get the current index's value from storage */
	      BluetoothPage.storage.get(i.toString()).then(
		  function(value) {
		      /* Add the index and the (parsed) value to the data table */
		      //HomePage.data.addRows([
			//  [j.toString(),parseInt(value)]]);;
		      HomePage.labels.push(j.toString());
		      HomePage.db.push(parseInt(value));

		      /* The index is likely way higher now, so use j to record our place */
		      j++;

		      /* Only make the chart on the last iteration */
		      if (j==50) {loading.dismiss(); HomePage.makeChart();}
		  },
	          function(value) { alert("Error"); }
	      );
	  }

	/* Unused prototype code for calling a timeout until all data is fetched, then graphing */
	/*
	ready_wait();
	function ready_wait() {
	    if (!(j = 50)) {
		alert("go");
		setTimeout(ready_wait(),50);
	    }
	    else {
		alert(j);
		alert(HomePage.labels);
		alert("done");
		HomePage.makeChart();
	    }
	}*/
	      
    }

    /* Erase the current graph and redraw with no data */
    clear() {
	/* This line needs to be removed eventually, of course, and hidden in settings */
	BluetoothPage.storage.clear().then();
	HomePage.labels = [];
	HomePage.db = [];
	HomePage.makeChart();
    }


    /* Charts.js graph routine */
    static makeChart() {
	var ctx = document.getElementById("chart2");
	var myChart = new Chart(ctx, {
	    type: 'line',
	    data: {
		labels: HomePage.labels,
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
		    data: HomePage.db,
		    borderWidth: 1
		}]
	    },
	});
    }

}
