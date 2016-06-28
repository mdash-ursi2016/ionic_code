import {InAppBrowser} from 'ionic-native';
import {Injectable} from '@angular/core';
import {Http,Headers} from '@angular/http';

@Injectable()
export class HttpService {
    static get parameters() {
	return [[Http]];
    }
    constructor(http) {
	this.http = http;
/*
	let json_flat = 
	    {
		"header":{
		    "id":"0",
		    "creation_date_time":"SOME_TIMESTAMP",
		    "acquisition_provenance":{
			"source_name":"arduino",
			"modality":"sensed"
		    },
		    "schema_id":{
			"namespace":"omh",
			"name":"heart-rate",
			"version":"1.0"
		    }
		},
		"body":{
		    "heart_rate": {
			"value":0,
			"unit":"beats/min"
		    },
		    "effective_time_frame":{
			"date_time":"SOME_TIMESTAMP"
		    }
		}
	    };

	this.bpm_json = json_flat;
*/
    }

    


    /* Opens a browser, allows user to login, return with access token */
    getToken() {
	return new Promise(function(resolve, reject) {
	    /* Open the URL in app without header information (URL, back/forward buttons, etc.) */
	    var browserRef = InAppBrowser.open("http://143.229.6.40:80/oauth/authorize?response_type=token&client_id=vassarOMH&redirect_uri=http://143.229.6.40:80/&scope=write_data_points%20read_data_points", "_blank","location=no");
	    
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
    makeGetRequest(token) {
	
	var authHeaders = new Headers();
	//{
	//    "Authorization": "Bearer e9add5f7-9aa0-4470-8909-0c9eb1fe1547",
	//    "Accept": "application/json"
	//});
	authHeaders.append('Authorization', 'Bearer ' + token);
	authHeaders.append('Accept', 'application/json');

	console.log(JSON.stringify(authHeaders));

	this.http.get("http://143.229.6.40:443/v1.0.M1/dataPoints/newHR",
		      { headers: authHeaders }).subscribe(data => { alert(JSON.stringify(data)) },
							  error => { alert("No") }
							 );
    }


    /* Make a post request to a server */
    /*
    makePostRequest(value,token) {
	//this.createJSON(value);
	//console.log(JSON.stringify(this.bpm_json));
	
	//console.log(token);
	var authHeaders = new Headers();
	authHeaders.append('Authorization', 'Bearer e9add5f7-9aa0-4470-8909-0c9eb1fe1547');
	authHeaders.append('Content-Type', 'text/plain');

	//console.log(JSON.stringify(headers));


	//alert(typeof JSON.stringify(this.bpm_json));
	this.http.post("http://143.229.6.40:443/v1.0.M1/test",
		       "BLAH",
		       //JSON.stringify(this.bpm_json),
		       //"hello",
		      { headers:authHeaders }).subscribe(
			  data => alert(data),
			  error => console.log(JSON.stringify(error)),
			  () => console.log("Completed")
		      );
    }
*/

    createJSON(value) {

	this.bpm_json.header.creation_date_time = new Date().toISOString();

	this.bpm_json.body.heart_rate.value = value;
	this.bpm_json.body.effective_time_frame.date_time = new Date().toISOString();
    }

}
