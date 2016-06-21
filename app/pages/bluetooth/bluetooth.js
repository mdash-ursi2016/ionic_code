import {Page, Alert, NavController, Loading} from 'ionic-angular';
import {BLService} from '../blservice/blservice';

@Page({
  templateUrl: 'build/pages/bluetooth/bluetooth.html'
})

export class BluetoothPage {
    static get parameters() {
	return [[BLService], [NavController]];
    }

    constructor(bl,nav) {
	BluetoothPage.bl = bl;
	this.nav = nav;

	/* List of of found devices on scan */
	this.listItems = [];
    }

    onPageLoaded()
    {
	/* Ensuring that Bluetooth is on */
	statusDiv.innerHTML = "Initializing";
	document.addEventListener('deviceready', function () {
	    /* If already enabled, do nothing */
	    BluetoothPage.bl.isEnabled().then(
		function() {},
		function() {
		    /* Otherwise, attempt to enable */
		    BluetoothPage.bl.enable().then(
			function() {},
			function() {alert ("Bluetooth could not be enabled");}
		    );
		}
	    );
	});

	/* Checking if a device is already connected */
	BluetoothPage.bl.checkExistingBluetooth().then(
	    function() {statusDiv.innerHTML = "Connected";},
	    function() {statusDiv.innerHTML = "Disconnected";}
	);
    }

    /* Scan for a device */
    scan() {
	/* The list of found devices should be empty on scan start */
	this.listItems = [];
	statusDiv.innerHTML = "Scanning";

	/* BL scanning service returns a [timeout,subscription] pair */
	var scanner = BluetoothPage.bl.startScan();
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
	    BluetoothPage.bl.stopScan();
	    statusDiv.innerHTML = "Finished Scanning";
	    loading.dismiss();
	}, 1000 * timeout);
    }

    /* Executed when a user selects a device from the list;
       Connect to that device */
    connect(device) {
	BluetoothPage.bl.connect(device);
	statusDiv.innerHTML = "Connected to " + device.name;
    }
	
    /* Disconnect from any connected device */
    disconnect() {
	BluetoothPage.bl.disconnect();
	statusDiv.innerHTML = "Disconnected";
    }
}
