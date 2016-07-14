import {Page, Alert, NavController, Loading} from 'ionic-angular';
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
    }

    onPageLoaded()
    {
	/* Ensuring that Bluetooth is on */
	statusDiv.innerHTML = "Initializing";
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
	    () => {statusDiv.innerHTML = "Connected to " + this.bl.getName();},
	    () => {statusDiv.innerHTML = "Disconnected";}
	);

    }

    /* Scan for a device */
    scan() {
	/* The list of found devices should be empty on scan start */
	this.listItems = [];
	statusDiv.innerHTML = "Scanning";

	/* BL scanning service returns a [timeout,subscription] pair */
	var scanner = this.bl.startScan();
	var timeout = scanner[0];
	var scanSub = scanner[1];
	
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
	    statusDiv.innerHTML = "Finished Scanning";
	    loading.dismiss();
	}, 1000 * timeout);
    }

    /* Executed when a user selects a device from the list;
       Connect to that device */
    connect(device) {
	this.bl.connect(device);

	/* Remove the device from the list of displayed devices */
	this.listItems = [];
	statusDiv.innerHTML = "Connected to " + device.name;
    }
	
    /* Disconnect from any connected device */
    disconnect() {
	this.bl.disconnect();
	statusDiv.innerHTML = "Disconnected";
    }
}
