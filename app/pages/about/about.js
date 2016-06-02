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


  aboutAlert() {
    let alert = Alert.create({
      title: 'App Info',
      message: 'Version 1.0.0<br>Last Updated: June 2, 2016',
      buttons: ['Ok']
    });
    console.log("made it this far");
    this.nav.present(alert);

  }

}
