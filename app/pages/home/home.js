import {Page, Storage, SqlStorage, Events} from 'ionic-angular';
import {BLService} from '../blservice/blservice';

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
    static get parameters() {
	return [[BLService],[Events]];
    }
    constructor(bl,events) {
	this.bl = bl; /* Bluetooth */
	this.events = events; /* Subscriptions */
    }

    onPageLoaded() {

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
	this.connect();
	
    }

    connect() {
	/* Subscribe to incoming data packets
	   First make sure the subscription exists */
	var connectSub = this.bl.getSubscription();
	if (!connectSub) return;
	
	/* Subscribe to incoming data provided by BLService */
	this.events.subscribe('bpm', (data) => {
	    /* Update the HTML for the latest packet */
	    content.innerHTML = "Your heart rate is currently <b>" + data +  "</b> BPM";
	    
	    /* Increment the canvas (x-axis) index */
	    HomePage.i += 2;
	    
	    /* Populate the array before overwriting anything in it */
	    if (HomePage.points.length < 50) {
		HomePage.ctx.lineTo(HomePage.i, data);
		HomePage.points.push([HomePage.i,data]);
	    }
	    
	    /* After it's populated, start the erasing algorithm */
	    else {
		
		/* Draw to the next point */
		HomePage.ctx.lineTo(HomePage.i, data);

		/* Move to the tail */
		HomePage.ctx.moveTo(HomePage.points[HomePage.head][0], HomePage.points[HomePage.head][1]);
		
		/* Change to black, erase last point, change to green, move back to tail */
		HomePage.ctx.strokeStyle = "#000000";
		var tmp = (HomePage.head + 1) % 50;
		HomePage.ctx.lineTo(HomePage.points[tmp][0], HomePage.points[tmp][1]);
		HomePage.ctx.strokeStyle = "#00FF00";
		HomePage.ctx.moveTo(HomePage.points[head][0], HomePage.points[HomePage.head][1]);

		
		/* Overwrite least recently used data point */
		HomePage.points[HomePage.head] = [HomePage.i, data];

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
