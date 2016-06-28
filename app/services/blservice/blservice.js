import {BLE, Vibration} from 'ionic-native';
import {StorageService} from '../storageservice/storageservice';
import {Injectable} from '@angular/core';
import {Events} from 'ionic-angular';
import {HttpService} from '../httpservice/httpservice';

@Injectable()
export class BLService {
    static get parameters() {
	return [[StorageService],[Events],[HttpService]];
    }
    constructor(storage,events,httpservice) {
	BLService.scanInfo = { service: 'aa7b3c40-f6ed-4ffc-bc29-5750c59e74b3', /* Heart rate service */
			       heartrate: '95d344f4-c6ad-48d8-8877-661ab4d41e5b', /* Heart rate characteristic */
			       ekg: '1bf9168b-cae4-4143-a228-dc7850a37d98', /* EKG characteristic */
			       timeout: 3 }; /* Scan time in seconds */
	
	/* The storage service */
	BLService.storage = storage;

	/* Used for publishing */
	BLService.events = events;

	/* Custom HTTP service */
	BLService.httpservice = httpservice;
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
        return [BLService.scanInfo.timeout, BLE.startScan([BLService.scanInfo.service])];
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

	/* Subscription for the heart rate (BPM) */
	BLService.HRsubscription = BLE.startNotification(peripheral.id, BLService.scanInfo.service, BLService.scanInfo.heartrate);

	/* Subscription for the EKG data */
	BLService.EKGsubscription = BLE.startNotification(peripheral.id, BLService.scanInfo.service, BLService.scanInfo.ekg);

	/* Subscribe to the BPM */
	BLService.HRsubscription.subscribe(buffer => {
	    var data = new Uint8Array(buffer);
	    
	    /* Store data */
            BLService.storage.store(new Date(),data);

	    /* Post the data to the server */
	    //BLService.httpservice.makePostRequest(parseInt(data));

	    /* Republish the data for the home page */
	    BLService.events.publish('bpm',parseInt(data));
        });

	/* Subscribe to the EKG */

	BLService.EKGsubscription.subscribe(buffer => {
	    var data = new Uint8Array(buffer);
	    
	    /* Republish the data for the home page */
	    BLService.events.publish('ekg',data);
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
	return BLService.HRsubscription;
    }

}
	
