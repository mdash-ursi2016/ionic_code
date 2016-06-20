import {Page} from 'ionic-angular';
import {BLE, Vibration, BackgroundMode} from 'ionic-native';
import {StorageService} from '../storage/service';
import {BLService} from '../blservice/blservice';

@Page({
  templateUrl: 'build/pages/bluetooth/bluetooth.html'
})

export class BluetoothPage {
    static get parameters() {
	return [[StorageService], [BLService]];
    }
  constructor(service, bl) {
      BluetoothPage.service = service;
      this.bl = bl;
      /* Information for the Heart Rate service:
	 service: Code for the Bluetooth Heart Rate service
	 heartrate: Characteristic code in this service for heart rate
	 timeout: Scan time before quitting */
      BluetoothPage.scanInfo = { service: '180d',
				 heartrate: '2a37',
				 timeout: 25 };
  }



  onPageLoaded()
    {
	/* See if Bluetooth is connected to a device already */
	BluetoothPage.checkExistingBluetooth();
	BluetoothPage.content = content;
    }

    /* Scan for and connect to a peripheral device */

    init() {
	this.bl.scan();
    }

    init2() {
	/* Initialization, called first */
	statusDiv.innerHTML = "Initializing";
	document.addEventListener('deviceready', BluetoothPage.checkBluetooth(), false);
	//this.startScan();   //<-- Use when debugging on server instead of previous line
    }

    /* See if Bluetooth is enabled, or turn it on */
    static checkBluetooth() {
	/* Make sure Bluetooth is enabled, and if not attempt to turn it on */
	BLE.isEnabled().then(
	    /* Bluetooth is on already */
	    function() {
		BluetoothPage.startScan();
	    },
	    /* Bluetooth is not on already */
	    function() {
		BLE.enable().then(
		    /* Bluetooth was successfully turned on */
		    function() {
			BluetoothPage.startScan();
		    },
		    /* Could not turn Bluetooth on */
		    function() {
			statusDiv.innerHTML = "Disconnected";
			alert("Bluetooth could not be enabled");
		    }
		);
	    }
	);
    }

    /* Begin scanning for a device */
    static startScan() {
	/* Var used for timing out */
	let foundDevice = false;
	statusDiv.innerHTML = "Scanning";
	

	/* Subscribe to the scan using heart rate service. If a device is found, pass it and the subscription along */
	var subscription = BLE.scan([BluetoothPage.scanInfo.service], BluetoothPage.scanInfo.timeout).subscribe(device => {
	    scanSuccess(device,subscription);
	});
	      
	/* If no device is found, that sucks. Update */
	setTimeout(function() {
	    if (!foundDevice) {
		statusDiv.innerHTML = "No device found";
	    }
	}, (BluetoothPage.scanInfo.timeout * 1000));


	/* Success function for scan.  Notify the user of the device 
	   and unsubscribe from new devices. Then connect to device. */
	function scanSuccess(peripheral) {
	    foundDevice = true;
	    Vibration.vibrate(100);
	    subscription.unsubscribe();
	    statusDiv.innerHTML = "Found device";
	    alert("Device Found: " + peripheral.name);
	    var connectSub = BLE.connect(peripheral.id).subscribe(result => {
		/* Update device information and connect */
		BluetoothPage.peripheral = peripheral;
		BluetoothPage.connected(peripheral);
	    });
	}
	
    }

    /* When the device has successfully connected */
    static connected(peripheral) {
	statusDiv.innerHTML = "Connected to " + peripheral.name;
	
	//BackgroundMode.enable().then(alert("BGM Enabled"),alert("BGM *Not* Enabled"));
    
	/* Start reading data, update the HTML, and store */
	BLE.startNotification(peripheral.id, BluetoothPage.scanInfo.service, BluetoothPage.scanInfo.heartrate).subscribe(buffer => {
	    var data = new Uint8Array(buffer);
	    content.innerHTML = data[1];
	    BluetoothPage.service.store(data[1]);
	});
    }

 
    disconnect() {
	this.bl.disconnect();
    }

  /* Called when the user wants to sever the Bluetooth connection */
  disconnect2() {

      /* The device id that is currently connected, or null */
      var devID = BluetoothPage.peripheral.id;

      BLE.isConnected(devID).then(
	  /* Check if connected, and disconnect if so */
	  function(result) {
	      BLE.disconnect(devID).then(
		  function(dcResult) {
		      statusDiv.innerHTML = "Disconnected";
		      content.innerHTML = "Data will display here";
		      alert("Disconnected Successfully");
		      /* Reset the peripheral ID */
		      BluetoothPage.peripheral = null;
		  },
		  /* Could not disconnect for some reason */
		  function(dcResult) {
		      statusDiv.innerHTML = "Error Disconnecting";
		  });
	  },
	  /* Button was pressed with no active connection */
	  function(result) {
	      alert("You are not currently connected to a device");
	  }
      );
  }

  /* On page load, we want the status to reflect if the device is connected already */
  static checkExistingBluetooth() {
      if (BluetoothPage.peripheral) {
	  BLE.isConnected(BluetoothPage.peripheral.id).then(
	      function() {statusDiv.innerHTML = "Connected to " + BluetoothPage.peripheral.name;},
	      function() {statusDiv.innerHTML = "Disconnected";}
	  );
      }
  }    

}
