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
	this.listItems = [];
    }

    

    onPageLoaded()
    {
	/* See if Bluetooth is connected to a device already */
	statusDiv.innerHTML = "Initializing";
	document.addEventListener('deviceready', function () {
	    BluetoothPage.bl.isEnabled().then(
		function() {},
		function() {
		    BluetoothPage.bl.enable().then(
			function() {},
			function() {alert ("Bluetooth could not be enabled");}
		    );
		}
	    );
	});


	BluetoothPage.bl.checkExistingBluetooth().then(
	    function() {statusDiv.innerHTML = "Connected";},
	    function() {statusDiv.innerHTML = "Disconnected";}
	);
    }

    /* Scan for and connect to a peripheral device */
    init() {
	statusDiv.innerHTML = "Initializing";
	//this.listItems.push({title: "num0"});
	document.addEventListener('deviceready', this.checkBluetooth(), false);
	this.checkBluetooth();
    }

    checkBluetooth() {
	//BluetoothPage.scan();
	BluetoothPage.bl.isEnabled().then(
	    this.scan(),
	    BluetoothPage.bl.enable().then(
		this.scan(),
		function() {alert("Bluetooth could not be enabled");}
	    )
	);
    }
    
    scan() {
	this.listItems = [];
	statusDiv.innerHTML = "Scanning";

	var scanner = BluetoothPage.bl.startScan();

	var timeout = scanner[0];
	var scanSub = scanner[1];
	
	let loading = Loading.create({
	    spinner: 'dots',
	    content: 'Scanning...'
	});

	this.nav.present(loading);

	scanSub.subscribe(device => {
	    this.listItems.push(device);
	});

	setTimeout(() => {
	    BluetoothPage.bl.stopScan();
	    statusDiv.innerHTML = "Finished Scanning";
	    loading.dismiss();
	}, 1000 * timeout);
    }
	//alert("3");

        /* Subscribe to the scan using heart rate service. If a device is found, pass it and the subscription along */
        //var sub = BluetoothPage.bl.startScan();
	//sub.subscribe(device => this.listItems.push({title: device.name}));
	//scanSuccess(device,nav);

        /* If no device is found, that sucks. Update */
        //setTimeout(function() {
        //    alert("No other devices found");
	//    statusDiv.innerHTML = "Disconnected";
        //}, (25 * 1000));

        /* Success function for scan.  Notify the user of the device
           and unsubscribe from new devices. Then connect to device. */
        //function scanSuccess(peripheral) {
         //   foundDevice = true;
         //   Vibration.vibrate(100);
         //   subscription.unsubscribe();
          //  var connectSub = BLE.connect(peripheral.id).subscribe(result => {
            //    BLService.peripheral = peripheral;
            //    BLService.connected(peripheral);
           // });
       // }


    connect(device) {
	BluetoothPage.bl.connect(device);
	statusDiv.innerHTML = "Connected to " + device.name;
    }

    found(device,sub) {
	this.listItems.push({title: device.name});
	alert(this.listItems);
	sub.unsubscribe();
	//alert(device.name);
	//this.listItems.push({title: device.name});
	//alert(this.listItems);
    }
	
	
 
    disconnect() {
	BluetoothPage.bl.disconnect();
	statusDiv.innerHTML = "Disconnected";
    }
}
