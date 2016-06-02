import {Page, NavController, NavParams} from 'ionic-angular';
import {AboutPage} from '/home/natgreen/URSI/ursiApp/app/pages/about/about';
import {BluetoothPage} from '/home/natgreen/URSI/ursiApp/app/pages/bluetooth/bluetooth';
import {ServerPage} from '/home/natgreen/URSI/ursiApp/app/pages/server/server';


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

    /* The icons that will be used in the list labels */
    this.icons = ['bluetooth','wifi'];

    this.items = [];

    this.items.push({
      title: 'Bluetooth Settings',
      icon: this.icons[0],

      /* The ID will be used to identify this page when passed to a function later */
      id: 0
    });

    this.items.push({
      title: 'Server Settings',
      icon: this.icons[1],
      id: 1
    });
    
  }

  /* If a list item is touched, check its ID and go to the correct corresponding page */
  itemTapped(event, item) {
    if (item["id"] == 0)
      { console.log("Bluetooth page"); 
        this.nav.push(BluetoothPage);
      }

    else if (item["id"] == 1)
      { console.log("Server page");
        this.nav.push(ServerPage);
      }

    /* If the ID is not recognized, burn the world to the ground */
    else
      { console.log("OHMYGODITSALLONFIRENOPAGEEXISTSWHATDOWEDO"); }
  }
}
