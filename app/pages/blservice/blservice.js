import {BLE, Vibration} from 'ionic-native';
import {StorageService} from '../storage/storage';
import {Injectable} from '@angular/core';
import {Events} from 'ionic-angular';

@Injectable()
export class BLService {
    static get parameters() {
	return [[StorageService],[Events]];
    }
    constructor(storage,events) {
	BLService.scanInfo = { service: '180d', /* Heart rate service */
			       heartrate: '2a37', /* Heart rate characteristic */
			       timeout: 3 }; /* Scan time in seconds */
	/* The storage service */
	BLService.storage = storage;

	/* Used for publishing */
	BLService.events = events;
    }

    /* Return a Promise for if Bluetooth is enabled or not */
    isEnabled() {
	return BLE.isEnabled();
    }

    /* Return a Promise for if Bluetooth was enabled or not */
    enable() {
	return BLE.enable();
    }

    /* Return a pair including the scan timeout and the scan subscription */
    startScan() {
        return [BLService.scanInfo.timeout, BLE.startScan([])];
    }
    
    /* Stop scanning */
    stopScan() {
	BLE.stopScan().then(() => {});
    }

    /* Connect to the given device, and set the peripheral for later */
    connect(peripheral) {
	Vibration.vibrate(100);
	var connectSub = BLE.connect(peripheral.id).subscribe(result => {
	    BLService.peripheral = peripheral;
            BLService.connected(peripheral);
        });
    }

    /* Record incoming data in storage */
    static connected(peripheral) {
	BLService.subscription = BLE.startNotification(peripheral.id, BLService.scanInfo.service, BLService.scanInfo.heartrate);
	BLService.subscription.subscribe(buffer => {
            var data = new Uint8Array(buffer);
            //BLService.storage.store(data[1]);

	    /* Publish just the data to a new subscriptable object for the live data feed
	       Necessary because publisher:subscriber is not one to many */
	    BLService.events.publish('bpm',data[1]);
        });
    }


    /* Called when the user wants to sever the Bluetooth connection */
    disconnect() {
	let devID = null;
	if (BLService.peripheral) {
	    /* The device id that is currently connected, or null */
	    devID = BLService.peripheral.id;
	}
	BLE.isConnected(devID).then(
            /* Check if connected, and disconnect if so */
            function(result) {
		BLE.disconnect(devID).then(
                    function(dcResult) {

			/* Reset the peripheral ID */
			BLService.peripheral = null;
                    },
                    /* Could not disconnect for some reason */
                    function(dcResult) {
			alert("Error Disconnecting");
                    });
            },
            /* Button was pressed with no active connection */
            function(result) {
		alert("You are not currently connected to a device");
            }
	);
    }


    /* On page load, we want the status to reflect if the device is connected already */
    checkExistingBluetooth() {
	if (BLService.peripheral) {
            return BLE.isConnected(BLService.peripheral.id);
	}
	/* Should always be a rejected Promise */
	else return BLE.isConnected(null);
    }

    getSubscription() {
	return BLService.subscription;
    }

}
	
