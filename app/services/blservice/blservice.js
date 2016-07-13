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
	this.scanInfo = { service: 'aa7b3c40-f6ed-4ffc-bc29-5750c59e74b3', /* Heart rate service */
			  heartrate: 'b0351694-25e6-4eb5-918c-ca9403ddac47', /* Heart rate characteristic */
			  ekg: '1bf9168b-cae4-4143-a228-dc7850a37d98', /* EKG characteristic */
			  timechar: '95d344f4-c6ad-48d8-8877-661ab4d41e5b', /* Date write characteristic */
			  heartratebundle: '3cd43730-fc61-4ea7-aa18-6e7c3d798d74',
			  timeout: 3 }; /* Scan time in seconds */
	
	/* The storage service */
	this.storage = storage;

	/* Used for publishing */
	this.events = events;

	/* Custom HTTP service */
	this.httpservice = httpservice;
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
        return [this.scanInfo.timeout, BLE.startScan([this.scanInfo.service])];
    }
    
    /* Stop scanning */
    stopScan() {
	BLE.stopScan().then(() => {});
    }

    /* Connect to the given device, and set the peripheral for later */
    connect(peripheral) {
	Vibration.vibrate(100);
	var connectSub = BLE.connect(peripheral.id).subscribe(result => {
	    this.storage.storePeripheral(peripheral.id);
	    this.peripheral = peripheral;
            this.connected(peripheral);
        }, error => {console.log("Peripheral not found.");});
    }

    /* Record incoming data in storage */
    connected(peripheral) {
	/* Inform the peripheral of the current date */
	this.sendDate(peripheral);
	/* Subscription for the heart rate (BPM) */
	this.HRsubscription = BLE.startNotification(peripheral.id, this.scanInfo.service, this.scanInfo.heartrate);
	/* Subscription for the EKG data */
	this.EKGsubscription = BLE.startNotification(peripheral.id, this.scanInfo.service, this.scanInfo.ekg);
	/* Subscription for the bundle data */
	this.HRBundlesubscription = BLE.startNotification(peripheral.id, this.scanInfo.service, this.scanInfo.heartratebundle);


	/* Subscribe to the BPM */
	this.HRsubscription.subscribe(buffer => {
	    var data = new Uint32Array(buffer);
	    /* Store data (date * 1000 to account for milliseconds) */
	    this.storage.store(new Date(data[1] * 1000),data[0]);
	    /* Republish the data for the home page */
	    this.events.publish('bpm',parseInt(data));
	    /* Post the data to the server */
	    //this.httpservice.makePostRequest(data[0],new Date(data[1] * 1000));
        });

	/* Subscribe to the EKG */
	this.EKGsubscription.subscribe(buffer => {
	    var data = new Uint8Array(buffer);
	    
	    /* Republish the data for the home page */
	    this.events.publish('ekg',data);
	});

	this.HRBundlesubscription.subscribe(buffer => {
	    /* Data processing goes here */
	    /* Data storage goes here */
	});
    }


    /* Inform the peripheral of the current date */
    sendDate(peripheral) {

	/* Data must be sent through the BLE plugin as an ArrayBuffer */
	let uint8 = new Uint8Array(4);

	/* Grab the current time without milliseconds */
	let time = Math.floor((new Date).getTime() / 1000);

	/* Store the time in 4 byte increments */
	uint8[0] = time & 0xFF;
	uint8[1] = (time & 0xFF00) >>> 8;
	uint8[2] = (time & 0xFF0000) >>> 16;
	uint8[3] = (time & 0xFF000000) >>> 24;

	/* Write the data to the peripheral */
	BLE.write(peripheral.id, this.scanInfo.service, this.scanInfo.timechar, uint8.buffer).then(
	    succ => {console.log(JSON.stringify(succ));},
	    fail => {console.log(JSON.stringify(fail));}
	);

    }




    /* Called when the user wants to sever the Bluetooth connection */
    disconnect() {
	let devID = null;
	var self = this;

	if (this.peripheral) {
	    /* The device id that is currently connected, or null */
	    devID = this.peripheral.id;
	}
	BLE.isConnected(devID).then(
            /* Check if connected, and disconnect if so */
            function(result) {
		BLE.disconnect(devID).then(
                    function(dcResult) {

			/* Reset the peripheral ID */
			self.peripheral = null;
                    },
                    /* Could not disconnect for some reason */
                    function(dcResult) {
			alert("Error Disconnecting");
                    });
            },
            /* Button was pressed with no active connection */
            function(result) {
		console.log("You are not currently connected to a device");
            }
	);
    }


    /* On page load, we want the status to reflect if the device is connected already */
    checkExistingBluetooth() {
	if (this.peripheral) {
            return BLE.isConnected(this.peripheral.id);
	}
	/* Should always be a rejected Promise */
	else return BLE.isConnected(null);
    }

    getSubscription() {
	return this.HRsubscription;
    }

}
	
