import {Page, Events, Platform} from 'ionic-angular';
import {BLService} from '../../services/blservice/blservice';

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
    static get parameters() {
	return [[BLService],[Events],[Platform]];
    }
    constructor(bl,events,platform) {
	this.platform = platform;
	this.bl = bl; /* Bluetooth */
	this.events = events; /* Subscriptions */
	this.linelength = 50; /* Length of the line on the canvas before erasing -- currently unused */
	this.canvasWidth = window.screen.width - 50;
	this.canvasHeight = window.screen.height / 3;
    }

    onPageDidEnter() {
	this.points = [];
	this.head = 0;

	/* Retrieve information about the canvas and its context */
	this.c = document.getElementById("myCanvas");
	this.ctx = this.c.getContext("2d");

	/* The first point is actually offscreen so a big jump doesn't get drawn */
	this.ctx.moveTo(-2,0);
	this.ctx.beginPath();
	this.i = -2;

	/* Don't persist through draw() function for some reason */
	//this.ctx.strokeStyle = "#00FF00";
	//this.ctx.lineWidth = 2;

	/* If we have a device to connect to, start up the data relay */
	this.platform.ready().then(() => {
	    this.connect();
	});
	
    }


    connect() {
	/* Subscribe to incoming data packets
	   First make sure the subscription exists */
	var connectSub = this.bl.getSubscription();
	if (!connectSub) return;
	
	/* Display the BPM provided by BLService*/
	this.events.subscribe('bpm', (data) => {
	    content.innerHTML = data;
	});
	

	/* Graph EKG data provided by BLService */
	this.events.subscribe('ekg', (data) => {
	    /* The data is a single element array containing an array of numbers */
	    for (var i = 0; i < data[0].length; i++) {
		this.draw(data[0][i]);
	    }

	    /* Using old draw method for now */
	    return;
	});
    }

    /* New graphing method, doesn't currently work
       Graph the points and discard of the tail */
    drawNoTrace() {
	/* Increment the canvas (x-axis) index */
	HomePage.i += 2;
	/* Populate the array before overwriting anything in it (and draw) */
	if (HomePage.points.length < 50) {
	    HomePage.ctx.lineTo(HomePage.i, data);
	    HomePage.points.push([HomePage.i,data]);
	    HomePage.ctx.stroke();
	}
	
	/* After it's populated, start the erasing algorithm */
	else {
	    
	    /* Change the stroke color to green */
	    HomePage.ctx.strokeStyle = "#00FF00";
	    /* Draw to newest point */
	    HomePage.ctx.lineTo(HomePage.i, data);
	    /* Move to the tail of the line*/
	    HomePage.ctx.moveTo(HomePage.points[HomePage.head][0], HomePage.points[HomePage.head][1]);
	    HomePage.ctx.stroke();
	    
	    
	    /* Change to black */
	    HomePage.ctx.strokeStyle = "#000000";
	    /* Erase up to second to last point */
	    var tmp = (HomePage.head + 1) % 50;
	    HomePage.ctx.lineTo(HomePage.points[tmp][0], HomePage.points[tmp][1]);
	    
	    /* Update last point to newest point */
	    HomePage.points[HomePage.head] = [HomePage.i, data];
	    /* Move to newest point */
	    HomePage.ctx.moveTo(HomePage.points[HomePage.head][0], HomePage.points[HomePage.head][1]);
	    HomePage.ctx.stroke();
	    
	    
	    /* Increment head */
	    HomePage.head++;
	    HomePage.head %= 50;
	}
    }

    /* Old graphing method for a single, unerasing line until the end of the canvas
       Given a point, draw it on the canvas and erase if the canvas is full */
    draw(point) {
	/* Increment by 2 for more noticeable drawing changes */
	this.i += 1;
	this.ctx.strokeStyle = "#00FF00";
	this.ctx.lineTo(this.i, (this.c.height - (2 * point)));;
	this.ctx.stroke();
	
	/* If the index (x-axis) is out of bounds, reset canvas */
	if (this.i > this.c.width)
	    {
		this.ctx.clearRect(0,0,this.c.width, this.c.height);
		this.ctx.beginPath();

		this.ctx.moveTo(-2, this.c.height - point);
		this.i = -2;
	    }
    }

}
