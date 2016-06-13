import {BluetoothPage} from '../bluetooth/bluetooth';
import {Page, Storage, SqlStorage} from 'ionic-angular';

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  constructor() {
      /* The global storage unit. Perhaps move to HomePage.storage? */
      BluetoothPage.storage = new Storage(SqlStorage);
  }

  onPageLoaded()
    {
	/* Currently breaks if you select the Homp Page *from* the Home Page */
	HomePage.makeChart();
    }

    /* Clear all data in storage and update the chart.
       This method will be buried in some settings page eventually */
    clear() {
	BluetoothPage.storage.clear().then();
	HomePage.data = google.visualization.arrayToDataTable(HomePage.dataset);
	HomePage.updateChart();
    }

    /* Retrieve a fixed amount of data from storage and show the graph */
    retrieve() {

      var i; /* Used for indexing the data */
      var j = 1; /* Because the data load is asynchronous with the display, this variable maintains the correct index */

      for (i = 1; i < 50; i++)
	  {
	      /* Get the current index's value from storage */
	      BluetoothPage.storage.get(i.toString()).then(
		  function(value) {
		      /* Add the index and the (parsed) value to the data table */
		      HomePage.data.addRows([
			  [j.toString(),parseInt(value)]]);
		      /* The index is likely way higher now, so use j to record our place */
		      j++;
		      HomePage.updateChart();
		  },
	          function(value) { alert("Error"); }
	      );
	      
          }
     }

    
  /* Make the chart for the first time */
  static makeChart() {
      /* The graph must start with a data point unfortunately, but switching to a different graphics
	 package should solve that */
      HomePage.dataset = [['Unit', 'Rate'], ['Init',0]];
      if (!this.loaded)
	  google.charts.load('current', {'packages':['corechart']});
      this.loaded = true;
      google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
	  /* Turn the data array into a data table */
	  HomePage.data = google.visualization.arrayToDataTable(HomePage.dataset);

          HomePage.options = {
          title: 'Chart Demo',
          legend: { position: 'bottom' }
              };

          HomePage.chart = new google.visualization.LineChart(document.getElementById('chart'));

          HomePage.updateChart();
       }
  }
  
  /* Redraw the chart with the most current data */
  static updateChart() {
      HomePage.chart.draw(HomePage.data, HomePage.options);
  }


}
