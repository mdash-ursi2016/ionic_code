import {ViewChild} from '@angular/core';
import {App, Platform, NavController, Toast} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';
import {BluetoothPage} from './pages/bluetooth/bluetooth';
import {AboutPage} from './pages/about/about';
import {DataPage} from './pages/data/data';
import {StorageService} from './services/storageservice/storageservice';
import {BLService} from './services/blservice/blservice';
import {HttpService} from './services/httpservice/httpservice';


@App({
  templateUrl: 'build/app.html',
  providers: [StorageService, BLService, HttpService],
  config: {}, // http://ionicframework.com/docs/v2/api/config/Config/
  queries: {
    nav: new ViewChild('content')
  }
})
class MyApp {
  static get parameters() {
    return [[Platform],[StorageService],[BLService],[HttpService]];
  }

    constructor(platform,storage,blservice,httpservice) {
	this.platform = platform;
	this.storage = storage;
	this.blservice = blservice;
	this.httpservice = httpservice;
	
	this.initializeApp();
	
	this.jsons = [];

	// used for an example of ngFor and navigation
	this.pages = [
	    { title: 'Home', component: HomePage },
	    { title: 'Data Visualization', component: DataPage },
	    { title: 'Bluetooth Settings', component: BluetoothPage },
	    { title: 'About', component: AboutPage }
	];
	
	this.rootPage = HomePage;
    }
    
    initializeApp() {
	this.platform.ready().then(() => {
	    // Okay, so the platform is ready and our plugins are available.
	    // Here you can do any higher level native things you might need.
	    
	    /* Enable background mode and set the heads up notification text */
	    cordova.plugins.backgroundMode.enable();
	    cordova.plugins.backgroundMode.setDefaults({
		title: "URSI App",
		ticker: "",
		text: "Collecting Data"
	    });

	    this.resumeOperations();

	    /* Add listeners for app pause/resume and bind "this" to them */
	    document.addEventListener("pause",this.pauseOperations.bind(this));	    
	    document.addEventListener("resume",this.resumeOperations.bind(this));

	    /* Function that regulates periodic server posting */
	    this.pushTimer();
	
	    StatusBar.styleDefault();
	

	});
    }

    pauseOperations() {
	/* On app leave, disconnect immediately */
	this.blservice.disconnect();
	
	/* Every 5 minutes, reconnect with this method */
	setTimeout(() => {
	    /* We must scan available devices to see if one                                                            
               has been connected to last */
            let scanner = this.blservice.startScan();
            var timeout = scanner[0];
	    var scanSub = scanner[1];
	    
            var id;
	    
	    /* Retrieve the last used device id from storage */
            this.storage.retrievePeripheral().then(storedID => {
		id = storedID;
	    
		/* Scan for peripherals and see if a match is found */
		scanSub.subscribe(device => {
		    if (device.id == id) {
			/* If so, connect, and disconnect 30 seconds later */
			this.blservice.connect(device);
			setTimeout(() => {
			    this.blservice.disconnect();
			},30000);
		    }
		    /* A device was found that we weren't connected to last */
		    else {}
		});
		
		/* Stop scan at twice usual time because it's in the background */
		setTimeout(() => {
		    this.blservice.stopScan();
		    console.log("Scan finished");
		}, 2000 * timeout);
	    });
	},300000);
    }

    resumeOperations() {
	/* On app resume, we must scan available devices to see if one
	   has been connected to last */
	let scanner = this.blservice.startScan();
	var timeout = scanner[0];
	var scanSub = scanner[1];
	
	var id;
	
	/* Retrieve the last used decive id from storage */
	this.storage.retrievePeripheral().then(storedID => {
	    id = storedID;
	
	    /* Scan for peripherals and see if a match is found */
	    scanSub.subscribe(device => {
		if (device.id == id) {
		    /* If so, notify and connect as usual */
		    this.blservice.connect(device);
		    let toast = Toast.create({
			message: "Connected to " + device.name,
			duration: 2000,
			position: 'bottom',
			showCloseButton: true
                    });
                    this.nav.present(toast);
		}
		/* A device was found that we weren't connected to last */
		else {}
	    });
	    
	    /* Stop scan at twice usual time because it's in the background */
	    setTimeout(() => {
		this.blservice.stopScan();
		console.log("Scan finished");
	    }, 2000 * timeout);
	});
    }
    
    openPage(page) {
	// Reset the content nav to have just this page
	// we wouldn't want the back button to show in this scenario
	this.nav.setRoot(page.component);
    }

    
    pushTimer() {
	setTimeout(() =>  {
	    this.jsons = [];

	    /* Grab all the data from storage */
	    this.storage.retrieve().then(
		data => {
		    /* If successful, cycle through and create an array of JSONs
		       in the correct format for the server to read */
		    for (var i = 0; i < data.res.rows.length; i++) {
			this.jsons.push(this.httpservice.createJSON(
			    data.res.rows.item(i).value,
			    new Date(data.res.rows.item(i).date)));
		    }
		    /* If there's any data, we want to post it */
		    if (this.jsons.length > 0) {
			var self = this;
			this.httpservice.makePostRequest(this.jsons, function() {
			    /* Success callback if the data was posted. Clear out the storage */
			    self.storage.clear();
			    self.storage.makeTable();
			    let toast = Toast.create({
				message: "Data posted to server",
				duration: 2000,
				position: 'bottom',
				showCloseButton: true
			    });
			    self.nav.present(toast);
			});
		    }
		}, err => {
		    console.log("Error");
		}
	    );
	    /* Repeat this function again in 5 minutes */
	    this.pushTimer();
	}, 300000);
    }

}
