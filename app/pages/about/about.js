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
      message: 'Version 2.2.0<br>Last Updated: June 29, 2016',
      buttons: ['Ok']
    });
    /* Actually display the alert */
    this.nav.present(alert);

  }

}
