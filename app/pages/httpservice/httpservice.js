import {InAppBrowser} from 'ionic-native';
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

@Injectable()
export class HttpService {
    static get parameters() {
	return [[Http]];
    }
    constructor(http) {
	this.http = http;
    }

    getToken() {
	return new Promise(function(resolve, reject) {
	    var browserRef = InAppBrowser.open("http://143.229.6.40:8082/oauth/authorize?response_type=token&client_id=testClient&redirect_uri=http://143.229.6.40:8082/&scope=read_data_points", "_blank","location=no");
	    browserRef.addEventListener("loadstart", (event) => {
		if ((event.url).indexOf("143.229.6.40:8082/#") === 0) {
		    browserRef.removeEventListener("exit", (event) => {});
		    browserRef.close();

		    let token = (event.url).split("=")[1].split("&")[0];

		    if (token !== null)
			resolve (token);
		    else
			reject ("Yeah, that didn't work bud");
		}
	    });
	});
    }


    makeGetRequest() {
	this.http.get("http://httpbin.org/ip").subscribe(data => {
	    alert(data.json().origin);
	}, error => {
	    alert("You dun goofed, is what you dun did do");
	});
    }
}
