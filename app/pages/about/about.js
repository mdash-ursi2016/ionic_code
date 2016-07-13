import {Page} from 'ionic-angular';
import {Alert, NavController} from 'ionic-angular';

@Page({
  templateUrl: 'build/pages/about/about.html'
})
export class AboutPage {
  static get parameters() {
    return [[NavController]];
  }
  constructor(nav) {this.nav = nav;}

  /* A simple alert function to simply version info for the app */
  aboutAlert() {
    let alert = Alert.create({
      title: 'App Info',
      message: 'Version 0.8.0<br>Last Updated: July 13, 2016<br><br>Created by Alex, Macall, Nate, and JSON',
      buttons: ['Ok']
    });
    /* Actually display the alert */
    this.nav.present(alert);

  }

}
