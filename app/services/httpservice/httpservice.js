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

    /* Opens a browser, allows user to login, return with access token */
    getToken() {
	return new Promise(function(resolve, reject) {
	    /* Open the URL in app without header information (URL, back/forward buttons, etc.) */
	    var browserRef = InAppBrowser.open("http://143.229.6.40:80/oauth/authorize?response_type=token&client_id=testClient&redirect_uri=http://143.229.6.40:80/&scope=read_data_points", "_blank","location=no");
	    
	    /* When the browser reloads, check the URL */
	    browserRef.addEventListener("loadstart", (event) => {
		
		/* If the URL starts this way, we can access the token */
		if ((event.url).indexOf("http://143.229.6.40/#") === 0) {
		    browserRef.removeEventListener("exit", (event) => {});
		    browserRef.close();

		    /* Token is located between "=" and "&" */
		    let token = (event.url).split("=")[1].split("&")[0];

		    if (token !== null)
			resolve (token);
		    else
			reject ("Yeah, that didn't work bud");
		}
	    });
	});
    }

    /* Make a get request from a server */
    makeGetRequest() {
	this.http.get("http://httpbin.org/ip").subscribe(data => {
	    alert(JSON.stringify(data.json()));
	}, error => {
	    alert("You dun goofed, is what you dun did do");
	});
    }

    /* Make a post request to a server */
    makePostRequest() {
	this.http.post("https://httpbin.org/post", "Nate").subscribe(data => {
	    alert(JSON.stringify(data.json().data));
	}, error => {
	    alert("Shouldn'ta dun that. Should not. Have done. That.");
	});
    }
}
