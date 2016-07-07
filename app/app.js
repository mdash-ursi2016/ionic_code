import {ViewChild} from '@angular/core';
import {App, Platform} from 'ionic-angular';
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
    return [[Platform],[StorageService],[BLService], [HttpService]];
  }

    constructor(platform,storage,blservice,httpservice) {
	this.platform = platform;
	this.storage = storage;
	this.blservice = blservice;
	this.httpservice = httpservice;
	
	this.initializeApp();
	
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
		text: "Currently Working"
	    });
	    
	    document.addEventListener("pause",function() {
		console.log("paused");
	    });
	    
	    document.addEventListener("resume",function() {
		console.log("resumed");
	    });
	    
	    this.pushTimer();

	    
	    StatusBar.styleDefault();
	});
    }
    
    openPage(page) {
	// Reset the content nav to have just this page
	// we wouldn't want the back button to show in this scenario
	this.nav.setRoot(page.component);
    }


    pushTimer() {
	setTimeout(() =>  {
	    //var values = [];
	    //var dates = [];
	    var jsons = [];
	    //console.log("timer is reached");
	    this.storage.retrieve().then(
		data => {
		    for (var i = 0; i < data.res.rows.length; i++) {
			//values.push(data.res.rows.item(i).value);
			//dates.push(new Date(data.res.rows.item(i).date));
			//jsons.push(this.httpservice.createJSON(
			//    data.res.rows.item(i).value,
			//    new Date(data.res.rows.item(i).date))
			//);
			//console.log(i);
			//console.log(typeof data.res.rows.item(i).date);
		    }
		    if (jsons.length > 0) {
			//console.log(JSON.stringify(jsons));
			this.httpservice.makePostRequest(jsons);
		    }
		}, err => {
		    console.log("Error");
		}
	    );
	    this.pushTimer();
	}, 20000);
    }

}
