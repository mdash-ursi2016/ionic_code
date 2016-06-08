import {Page, NavController, NavParams} from 'ionic-angular';
import {Geolocation} from 'ionic-native';
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

  constructor(nav, navParams, platform) {
    this.nav = nav;
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    /* The icons that will be used in the list labels */
    this.icons = ['bluetooth','desktop', 'locate'];

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

    this.items.push({
      title: 'Current Coordinates',
      icon: this.icons[2],
      id: 2
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

    /* Or in this case, give the user their coordinates because why not */
    else if (item["id"] == 2)
      {
	Geolocation.getCurrentPosition().then((resp) => {
	    alert("Latitude: " + resp.coords.latitude + "\nLongitude: " + resp.coords.longitude); });
      }

    /* If the ID is not recognized, burn the world to the ground */
    else
      { console.log("OHMYGODITSALLONFIRENOPAGEEXISTSWHATDOWEDO"); }
  }
}
