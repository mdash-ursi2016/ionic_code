import {BLE, Vibration} from 'ionic-native';
import {StorageService} from '../storage/service';
import {Injectable} from 'angular2/core';

@Injectable()
export class BLService {
    static get parameters() {
	return [[StorageService]];
    }
    constructor(service) {
	BLService.scanInfo = { service: '180d',
			       heartrate: '2a37',
			       timeout: 3 };
	BLService.service = service;
    }

    scan() {
	document.addEventListener('deviceready', this.checkBluetooth(), false);
    }

    isEnabled() {
	return BLE.isEnabled();
    }

    enable() {
	return BLE.enable();
    }

    startScan() {
	/* Var used for timing out */
        //let foundDevice = false;

        /* Subscribe to the scan using heart rate service. If a device is found, pass it and the */
        return [BLService.scanInfo.timeout, BLE.startScan([])];

    }
    
    stopScan() {
	BLE.stopScan().then(() => {});
    }


    timeout() {

        /* If no device is found, that sucks. Update */
        setTimeout(function() {
            BLE.stopScan().then(() => {});
        }, (BLService.scanInfo.timeout * 1000));

	/* Success function for scan. Notify the user of the device            
           and unsubscribe from new devices. Then connect to device. */
        function scanSuccess(peripheral) {
            foundDevice = true;
	    Vibration.vibrate(100);
	    subscription.unsubscribe();
	    var connectSub = BLE.connect(peripheral.id).subscribe(result => {
		BLService.peripheral = peripheral;
		BLService.connected(peripheral);
	    });
        }
    }

    connect(peripheral) {
	Vibration.vibrate(100);
	var connectSub = BLE.connect(peripheral.id).subscribe(result => {
	    BLService.peripheral = peripheral;
            BLService.connected(peripheral);
        });
    }

    static connected(peripheral) {
	BLE.startNotification(peripheral.id, BLService.scanInfo.service, BLService.scanInfo.heartrate).subscribe(buffer => {
            var data = new Uint8Array(buffer);
            //alert(data[1]);
	    //content.innerHTML = data[1];
            BLService.service.store(data[1]);
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
	else return BLE.isConnected(null);
    }

}
	
