import {BluetoothPage} from '../bluetooth/bluetooth';
import {Page} from 'ionic-angular';
import {BLE} from 'ionic-native';

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {

    constructor() {}

    onPageLoaded() {
	/* Retrieve information about the canvas and its context */
	HomePage.c = document.getElementById("myCanvas");
	HomePage.ctx = HomePage.c.getContext("2d");

	/* Set the canvas dimension according to the device */
	HomePage.c.width = window.screen.width - 50;
	HomePage.c.height = (window.screen.height / 3);

	/* The background is black and the line is green */
	HomePage.ctx.fillStyle = "#000000";
	HomePage.ctx.fillRect(0,0,HomePage.c.width,HomePage.c.height);
	HomePage.ctx.strokeStyle = "#458B00";


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
	    
	    /* Draw the most recent point */
	    HomePage.draw(data[1]);
	});
    }


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
