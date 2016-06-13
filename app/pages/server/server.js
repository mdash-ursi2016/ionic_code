import {Page} from 'ionic-angular';
import {BluetoothPage} from '../bluetooth/bluetooth'

@Page({
  templateUrl: 'build/pages/server/server.html'
})
export class ServerPage {
  constructor() { }
    doIt() {
	fun.innerHTML = BluetoothPage.test;
    }

}
