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

	/* The format of a post to the server */
	this.bpm_json = 
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

		    if (token !== null) {
			/* Set the token for post requests */
			HttpService.token = token;
			resolve (token);
		    }
		    else
			reject ("Yeah, that didn't work bud");
		}
	    });
	});
    }
    

    /* Make a get request from the server */
    makeGetRequest() {
	
	/* Create headers (includes token) */
	var authHeaders = new Headers();
	authHeaders.append('Authorization', 'Bearer ' + HttpService.token);
	authHeaders.append('Accept', 'application/json');

	/* Request the data */
	this.http.get("http://143.229.6.40:443/v1.0.M1/dataPoints?schema_namespace=omh&schema_name=heart-rate&schema_version=1.0",
		      { headers: authHeaders }).subscribe(
			  data => console.log("Success"),
			  error => alert("No")
		      );
    }


    /* Make a post request to the server */
    makePostRequest(value) {

	/* Edit the JSON to post into the correct format*/
	this.createJSON(value);
	
	/* Create headers (includes token) */
	var authHeaders = new Headers();
	authHeaders.append('Authorization', 'Bearer ' + HttpService.token);
	authHeaders.append('Content-Type', 'application/json');

	/* Post the data */
	this.http.post("http://143.229.6.40:443/v1.0.M1/dataPoints",
		       JSON.stringify(this.bpm_json),
		      { headers:authHeaders }).subscribe(
			  data => console.log(JSON.stringify(data)),
			  error => alert("Post error. Is your token valid?")
		      );
    }

    /* Change the JSON template with desired information.
       Correct dates not implemented yet */
    createJSON(value) {

	this.bpm_json.header.creation_date_time = new Date().toISOString();
	this.bpm_json.header.id = ((new Date).getTime()).toString();
	this.bpm_json.body.heart_rate.value = value;
	this.bpm_json.body.effective_time_frame.date_time = new Date().toISOString();
    }

}
