import {Page, Alert, NavController, Loading, Range} from 'ionic-angular';
import {BLService} from '../../services/blservice/blservice';

@Page({
  templateUrl: 'build/pages/bluetooth/bluetooth.html'
})

export class BluetoothPage {
    static get parameters() {
	return [[BLService], [NavController]];
    }

    constructor(bl,nav) {
	this.bl = bl;
	this.nav = nav;

	/* List of of found devices on scan */
	this.listItems = [];
	this.statusDiv = "Undefined";
	this.scanTime = 3;
    }

    onPageLoaded()
    {
	/* Ensuring that Bluetooth is on */
	this.statusDiv = "Initializing";
	var self = this;
	document.addEventListener('deviceready', function () {
	    /* If already enabled, do nothing */
	    self.bl.isEnabled().then(
		function() {},
		function() {
		    /* Otherwise, attempt to enable */
		    self.bl.enable().then(
			function() {},
			function() {alert ("Bluetooth could not be enabled");}
		    );
		}
	    );
	});

	/* Checking if a device is already connected */
	this.bl.checkExistingBluetooth().then(
	    () => {this.statusDiv = "Connected to " + this.bl.getName();},
	    () => {this.statusDiv = "Disconnected";}
	);

    }

    /* Scan for a device */
    scan() {
	/* The list of found devices should be empty on scan start */
	this.listItems = [];
	this.statusDiv = "Scanning";

	/* BL scanning service returns a [timeout,subscription] pair */
	var scanSub = this.bl.startScan();
	
	/* Create a loader for during the scan */
	let loading = Loading.create({
	    spinner: 'dots',
	    content: 'Scanning...'
	});
	this.nav.present(loading);

	/* Subscribe to the scanner, and add each found device to the list */
	scanSub.subscribe(device => {
	    this.listItems.push(device);
	});

	/* After the timeout, stop scanning and remove the loader */
	setTimeout(() => {
	    this.bl.stopScan();
	    this.statusDiv = "Finished Scanning";
	    loading.dismiss();
	}, 1000 * this.scanTime);
    }

    /* Executed when a user selects a device from the list;
       Connect to that device */
    connect(device) {
	this.bl.connect(device);

	/* Remove the device from the list of displayed devices */
	this.listItems = [];
	this.statusDiv = "Connected to " + device.name;
    }
	
    /* Disconnect from any connected device */
    disconnect() {
	this.bl.disconnect();
	this.statusDiv = "Disconnected";
    }
}
