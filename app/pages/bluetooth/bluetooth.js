import {Page, Storage, SqlStorage} from 'ionic-angular';
import {BLE, Vibration, BackgroundMode} from 'ionic-native';

@Page({
  templateUrl: 'build/pages/bluetooth/bluetooth.html'
})

export class BluetoothPage {
  constructor() {
      /* SqlStorage Unit is now instantiated in the Home Page*/
      //BluetoothPage.storage = new Storage(SqlStorage);
  }



  onPageLoaded()
    {
	/* See if Bluetooth is connected to a device already */
	BluetoothPage.checkExistingBluetooth();
    }

  /* Scan for and connect to a peripheral device */
  scan() {
      //BackgroundMode.enable().then(function() {alert("Yep!");}, function() {alert("Nope!");});
  
      /* Information for the Heart Rate service:
	   service: Code for the Bluetooth Heart Rate service
	   heartrate: Characteristic code in this service for heart rate
	   timeout: Scan time before quitting */
      var scanInfo = { service: '180d',
		       heartrate: '2a37',
		       timeout: 25 };
      
      /* If a Bluetooth device has been found, this will be true.
	 Prevents incorrect status. */
      var foundDevice;

      /* This is the object that controls connection to a device.
	 All of its members are functions that will be called sequentially,
	 starting with init() */
      var bleApp = {

	  /* Initialization, called first */
	  init: function() {
	      statusDiv.innerHTML = "Initializing";
	      document.addEventListener('deviceready', this.checkBluetooth(), false);
	      //this.startScan();   //<-- Use when debugging on server instead of previous line
	      console.log("Operations completed");
	  },

	  /* Make sure Bluetooth is enabled, and if not attempt to turn it on */
	  checkBluetooth: function() {
	      BLE.isEnabled().then(
		  /* Bluetooth is on already */
		  function() {
		      bleApp.startScan();
		  },
		  /* Bluetooth is not on already */
		  function() {
		      BLE.enable().then(
			  /* Bluetooth was successfully turned on */
			  function() {
			      bleApp.startScan();
			  },
			  /* Could not turn Bluetooth on */
			  function() {
			      statusDiv.innerHTML = "Disconnected";
			      alert("Bluetooth could not be enabled");
			  }
		      );
		  }
	      );
	  },


	  startScan: function() {
	      foundDevice = false;
	      statusDiv.innerHTML = "Scanning";
	      
	      /* Not sure how to implement a failure function with subscriptions, so this isn't
		 currently used */
	      function scanFailure(reason) {
		  alert("Scan Failed");
		  statusDiv.innerHTML = "Scan error";
		  console.log("Could not find a BLE device");
	      }

	      /* Notify the user of the device and unsubscribe. Then connect to device. */
	      function scanSuccess(peripheral) {
		  console.log("Found a BLE device: " + JSON.stringify(peripheral));
		  foundDevice = true;
		  Vibration.vibrate(1000);
		  subscription.unsubscribe();
		  statusDiv.innerHTML = "Found device";
		  alert("Device Found: " + peripheral.name);
		  var connectSub = BLE.connect(peripheral.id).subscribe(result => {
		                                                          BluetoothPage.peripheral = peripheral;
									  bleApp.connected(peripheral);
		                                                          //connectSub.unsubscribe(); //hm
									});
	      }

	      /* Subscribe to the scan using heart rate service. If a device is found, pass it and the subscription along */
	      var subscription = BLE.scan([scanInfo.service], scanInfo.timeout).subscribe(device => 
											  {scanSuccess(device,subscription);});
	      
	      /* If no device is found, that sucks. Update */
	      setTimeout(function() {
		  if (!foundDevice) {
		      statusDiv.innerHTML = "No device found";
		  }
	      }, (scanInfo.timeout * 1000));
	  },

	  /* When the device has successfully connected */
	  connected: function(peripheral) {
	      statusDiv.innerHTML = "Connected to " + peripheral.name;
	      BluetoothPage.id = peripheral.id;

	      //BackgroundMode.enable().then(alert("BGM Enabled"),alert("BGM *Not* Enabled"));

	      /* Start reading data, update the HTML, and store */
	      var count = 0;
	      BLE.startNotification(peripheral.id, scanInfo.service, scanInfo.heartrate).subscribe(buffer => {
										 var data = new Uint8Array(buffer);
										 content.innerHTML = data[1];
										 count += 1;
										 BluetoothPage.storage.set(
										     count.toString(),data[1]);
										});
	  }

      }

     /* The kick off that starts everything */
     bleApp.init();
  }   

  /* Called when the user wants to sever the Bluetooth connection */
  disconnect() {

      /* The device id that is currently connected, or null */
      var devID = BluetoothPage.id;

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
		      BluetoothPage.id = null;
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
      BLE.isConnected(BluetoothPage.id).then(
	  function() {statusDiv.innerHTML = "Connected to " + BluetoothPage.peripheral.name;},
	  function() {statusDiv.innerHTML = "Disconnected";}
	  );
  }    

}
