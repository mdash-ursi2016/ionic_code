import {Page} from 'ionic-angular';
import {BLE} from 'ionic-native';


@Page({
  templateUrl: 'build/pages/bluetooth/bluetooth.html'
})

export class BluetoothPage {
  constructor() {}
  //constructor() {}

  scan() {
  
      var foundDevice;
      
      var scanInfo = { service: '180d',
		       heartrate: '2a37',
		       timeout: 25 };
      
      /* If a Bluetooth device has been found, this will be true.
	 Prevents incorrect status. */

      /* This is the object that controls connection to a device.
	 All of its members are functions that will be called sequentially,
	 starting with init() */
      var bleApp = {


	  init: function() {
	      statusDiv.innerHTML = "Initializing";
	      BluetoothPage.connect();
	      document.addEventListener('deviceready', this.startScan, false);
	      //this.startScan();   //<-- Use when debugging on server instead of previous line
	      console.log("Operations completed");
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
		  subscription.unsubscribe();
		  statusDiv.innerHTML = "Found device";
		  alert("Device Found: " + peripheral.name);
		  var connectSub = BLE.connect(peripheral.id).subscribe(result => {
									  //connectSub.unsubscribe();
		                                                          connect();
									  bleApp.connected(peripheral);
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
	      connectDiv.innerHTML = peripheral.id;
	      
	      /* Start reading data and update the HTML to reflect this */
	      BLE.startNotification(peripheral.id, scanInfo.service, scanInfo.heartrate).subscribe(buffer =>
										{var data = new Uint8Array(buffer);
										 content.innerHTML = data[1];
										});
	  }

      }

     
     bleApp.init();
  }   

  static connect() {alert("WE HAVE CONNECTED, COMMANDER");}
  
  disconnect() {
      var devID = connectDiv.innerHTML;
      if (devID != null) {
	  BLE.disconnect(devID).then(
	      function(result) {
		  statusDiv.innerHTML = "Disconnected";
		  connectDiv.innerHTML = "";
		  content.innerHTML = "Data will display here";
		  alert("Disconnected Successfully");
	      },
	      function(result) {
		  statusDiv.innerHTML = "Error Disconnecting";
	      });
      }
      else
	  { alert("You aren't connected to a device");}
  }

  /* Observe if Bluetooth is enabled or not */
  bleCheck() {
     /* isEnabled() returns a Promise */
     BLE.isEnabled().then(function(result) {alert("Bluetooth is enabled");}, 
			  function(result) {alert("Bluetooth is *not* enabled");}
			 );
    
  }
  /* Enable Bluetooth in the case that it isn't alreay enabled */
  enable() {
     /* enable() returns a Promise */
     BLE.enable().then(function(result) {alert("Bluetooth has been enabled");},
		       function(result) {alert("Bluetooth has *not* been enabled");}
		      );
  }
}
