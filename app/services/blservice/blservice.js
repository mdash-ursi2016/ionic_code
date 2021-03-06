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
        return BLE.startScan([this.scanInfo.service]);
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
        }, error => {
	    console.log("Peripheral was disconnected");
	    this.disconnect();
	});
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
	    var data = new Uint8Array(buffer);

	    let date = this.calcDate(data[3],data[2],data[1],data[0]);

	    /* Store data (date * 1000 to account for milliseconds) */
	    this.storage.store(new Date(date * 1000),data[4]);
	    /* Republish the data for the home page */
	    this.events.publish('bpm',parseInt(data[4]));
	    
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
	    var data = new Uint8Array(buffer);

	    /* BPMs are located every 5 indices */
	    let bpmArray = [data[4],data[9],data[14],data[19]];

	    /* Dates must be calculated in reverse order */
	    let dateArray = [
		this.calcDate(data[3],data[2],data[1],data[0]),
		this.calcDate(data[8],data[7],data[6],data[5]),
		this.calcDate(data[13],data[12],data[11],data[10]),
		this.calcDate(data[18],data[17],data[16],data[15])
	    ];

	    /* Push all data points to storage 
	       (dates * 1000 for ms format ) */
	    for (var i=0; i < bpmArray.length; i++) {
		this.storage.store(new Date(dateArray[i] * 1000),bpmArray[i]);
	    }
	});
    }

    /* Format a unix epoch from individual bytes */
    calcDate(n1,n2,n3,n4) {
	return (n1 << 24) + (n2 << 16) + (n3 << 8) + n4;
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

	/* Grab the peripheral from storage and operate on it */
	this.storage.retrievePeripheral().then(periphID => {
	    /* If we are connected to this device, connect from it */
	    BLE.isConnected(periphID).then(() => {

		/* Reset subscriptions so if anything requests them they are null */
		this.HRsubscription = this.EKGsubscription = this.HRBundlesubscription = null;

		BLE.stopNotification(periphID, this.scanInfo.service, this.scanInfo.heartrate).then();
		BLE.stopNotification(periphID, this.scanInfo.service, this.scanInfo.ekg).then();
		BLE.stopNotification(periphID, this.scanInfo.service, this.scanInfo.heartratebundle).then();

		BLE.disconnect(periphID).then(() => {
		}, () => {
		    /* Never seems to fire with current version of BLE... */
		    alert("Unsuccessful disconnect");
		});
	    }, () => {
		/* Otherwise we shouldn't be conencted to anything at all */
		alert("You are not connected to a device");
	    });
	});
    }

    /* On page load, we want the status to reflect if the device is connected already */
    checkExistingBluetooth() {
	if (this.peripheral) {
            return BLE.isConnected(this.peripheral.id);
	}
	/* Should always be a rejected Promise */
	else return BLE.isConnected(null);
    }

    /* Return name of device */
    getName() {
	if (this.peripheral) {
	    return this.peripheral.name;
	}
	else return "Unknown Device";
    }
    
    /* Returns the heart rate subscription.
       Currently used by home page to know if
       it should subscribe to data */
    getSubscription() {
	return this.HRsubscription;
    }

}
	
