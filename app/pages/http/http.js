import {InAppBrowser} from 'ionic-native';
import {Injectable} from 'angular2/core';

@Injectable()
export class Http {
    constructor() {}




    getToken() {
	//return new Promise(function(resolve, reject) {
	    InAppBrowser.open("http://www.google.com");
    }
}
