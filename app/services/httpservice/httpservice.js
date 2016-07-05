import {InAppBrowser} from 'ionic-native';
import {Injectable} from '@angular/core';
import {Http,Headers} from '@angular/http';
import {StorageService} from '../../services/storageservice/storageservice';

@Injectable()
export class HttpService {
    static get parameters() {
	return [[Http],[StorageService]];
    }
    constructor(http,storage) {
	this.http = http;
	this.storage = storage;

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
			resolve (token);
		    }
		    else
			reject ("Yeah, that didn't work bud");
		}
	    });
	});
    }
    

    /* Make a get request from the server */
    makeGetRequest(d1,d2,requestFunction) {
	/* If the token isn't null, we can get immediately */
	if (this.token) {
	    this.get(d1,d2,requestFunction);
	    return;
	}
	
	/* Otherwise we retrieve the token first */
	this.storage.retrieveToken().then(
	    (token) => {
		this.token = token;
		this.get(d1,d2,requestFunction);
	    }, function() {
		alert("Token storage error");
	    }
	);
    }

    /* Get helper function */
    get(d1,d2,requestFunction) {

	/* Create headers (includes token) */
	var authHeaders = new Headers();
	authHeaders.append('Authorization', 'Bearer ' + this.token);
	authHeaders.append('Accept', 'application/json');

	/* The url is the standard for get, plus the date queries */
	let url = "http://143.229.6.40:443/v1.0.M1/dataPoints?schema_namespace=omh&schem\
a_name=heart-rate&schema_version=1.0&created_on_or_after=" + d1 + "&created_before=" + d2;


	/* Request the data and return via the callback */
	this.http.get(url,
		      { headers: authHeaders }).subscribe(
			  data => {requestFunction(data);},
			  error => alert("Get request failed (are you plugged in?)")
		      );
	
    }


    /* Make a post request to the server */
    makePostRequest(value) {
	
	/* If the token isn't null, we can post immediately */
	if (this.token) {
	    this.post(value);
	    return;
	}

	/* Otherwise, we have to retrieve the token, noting
	   that the call to post must be in the success function
	   and not afterward because this call must only occur after the
	   data is retrieved from storage, which takes a while */
	this.storage.retrieveToken().then(
	    (token) => {
		this.token = token;
		this.post(value);
	    }, function() {
		alert("Token storage error");
	    }
	);
    }
    
    /* Post helper function */
    post(value) {

	/* Edit the JSON to post into the correct format*/
	this.createJSON(value);
	
	/* Create headers (includes token) */
	var authHeaders = new Headers();
	authHeaders.append('Authorization', 'Bearer ' + this.token);
	authHeaders.append('Content-Type', 'application/json');

	/* Post the data */
	console.log(JSON.stringify(this.bpm_json));

	this.http.post("http://143.229.6.40:443/v1.0.M1/dataPoints",
		       JSON.stringify(this.bpm_json),
		      { headers:authHeaders }).subscribe(
			  data => console.log("Posted " + value),
			  error => console.log("Post error. Is your token valid?")
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
