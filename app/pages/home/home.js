import {BluetoothPage} from '../bluetooth/bluetooth';
import {Page, Storage, SqlStorage} from 'ionic-angular';
import {BLE} from 'ionic-native';

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {

    constructor() {}

    onPageLoaded() {
	
	BluetoothPage.storage = new Storage(SqlStorage);

	HomePage.points = [];
	HomePage.head = 0;

	/* Retrieve information about the canvas and its context */
	HomePage.c = document.getElementById("myCanvas");
	HomePage.ctx = HomePage.c.getContext("2d");

	/* Set the canvas dimension according to the device */
	HomePage.c.width = window.screen.width - 50;
	HomePage.c.height = (window.screen.height / 3);

	/* The background is black and the line is green */
	HomePage.ctx.fillStyle = "#000000";
	HomePage.ctx.fillRect(0,0,HomePage.c.width,HomePage.c.height);
	HomePage.ctx.strokeStyle = "#00FF00";
	HomePage.ctx.lineWidth = 2;

	/* The first point is actually offscreen so a big jump doesn't get drawn */
	HomePage.ctx.moveTo(-2,0);
	HomePage.ctx.beginPath();
	HomePage.i = 0;

	/* If we have a device to connect to, start up the data relay */
	if (BluetoothPage.peripheral.id != null) HomePage.connect();
    }

    static connect() {
	/* Subscribe to incoming data packets */
	var connectSub = BLE.startNotification(BluetoothPage.peripheral.id, '180d', '2a37').subscribe(buffer => {
	    var data = new Uint8Array(buffer);
	    
	    /* Update the HTML for the latest packet */
	    content.innerHTML = "Your heart rate is currently <b>" + data[1] +  "</b> BPM";
	    
	    /* Increment the canvas (x-axis) index */
	    HomePage.i += 2;
	    
	    /* Populate the array before overwriting anything in it */
	    if (HomePage.points.length < 50) {
		HomePage.ctx.lineTo(HomePage.i, data[1]);
		HomePage.points.push([HomePage.i,data[1]]);
	    }
	    
	    /* After it's populated, start the erasing algorithm */
	    else {
		
		/* Draw to the next point */
		HomePage.ctx.lineTo(HomePage.i, data[1]);

		/* Move to the tail */
		HomePage.ctx.moveTo(HomePage.points[HomePage.head][0], HomePage.points[HomePage.head][1]);
		
		/* Change to black, erase last point, change to green, move back to tail */
		HomePage.ctx.strokeStyle = "#000000";
		var tmp = (HomePage.head + 1) % 50;
		HomePage.ctx.lineTo(HomePage.points[tmp][0], HomePage.points[tmp][1]);
		HomePage.ctx.strokeStyle = "#00FF00";
		HomePage.ctx.moveTo(HomePage.points[head][0], HomePage.points[HomePage.head][1]);

		
		/* Overwrite least recently used data point */
		HomePage.points[HomePage.head] = [HomePage.i, data[1]];

		/* Increment head and tail */
		HomePage.head++;
		HomePage.head %= 50;
	    }
	    
	    HomePage.ctx.stroke();

	    /* Draw the most recent point */
	    //HomePage.draw(data[1]);
	});
    }

    /* Old graphing method for a single, unerasing line until the end of the canvas */

    /* Given a point, draw it on the canvas and erase if the canvas is full */
    static draw(point) {
	/* Increment by 2 for more noticeable drawing changes */
	HomePage.i += 2;
	HomePage.ctx.lineTo(HomePage.i, (HomePage.c.height - point));
	HomePage.ctx.stroke();
	
	/* If the index (x-axis) is out of bounds, reset canvas */
	if (HomePage.i > HomePage.c.width)
	    {
		//HomePage.ctx.clearRect(0,0,HomePage.c.width,HomePage.c.height);
		HomePage.ctx.fillRect(0,0,HomePage.c.width,HomePage.c.height);
		HomePage.ctx.beginPath();

		HomePage.ctx.moveTo(0, HomePage.c.height - point);
		HomePage.i = 0;
	    }
    }

}
