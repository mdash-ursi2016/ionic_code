import {Page, NavController, NavParams} from 'ionic-angular';
import {AboutPage} from '/home/natgreen/URSI/ursiApp/app/pages/about/about';

@Page({
  templateUrl: 'build/pages/settings/settings.html'
})
export class SettingsPage {
  static get parameters() {
    return [[NavController], [NavParams]];
  }

  constructor(nav, navParams) {
    this.nav = nav;

    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    /*
    this.icons = ['flask', 'wifi', 'beer', 'football', 'basketball', 'paper-plane',
    'american-football', 'boat', 'bluetooth', 'build'];*/

    this.icons = ['bluetooth','wifi'];

    this.items = [];
    this.items.push({
      title: 'Bluetooth Settings',
      icon: this.icons[0]
    });

    this.items.push({
      title: 'Server Settings',
      icon: this.icons[1]
    });
    
  }

  itemTapped(event, item) {
    this.nav.push(AboutPage, {
      item: item
    })
  }
}
