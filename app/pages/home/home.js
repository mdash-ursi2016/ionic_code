import {BluetoothPage} from '../bluetooth/bluetooth';
import {Page, Storage, SqlStorage} from 'ionic-angular';
import {BLE} from 'ionic-native';

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {

    constructor() {}

    onPageLoaded() {
	//HomePage.points = [];
	//alert("a")
	HomePage.c = document.getElementById("myCanvas");
	HomePage.ctx = c.getContext("2d");
	//alert("b");
	HomePage.ctx.moveTo(0,100);
	//alert("c");
	HomePage.i = 0;
	//alert("Page Loaded");
    }

    connect() {
	var connectSub = BLE.startNotification(BluetoothPage.peripheral.id, '180d', '2a37').subscribe(buffer => {
	    var data = new Uint8Array(buffer);
	    content.innerHTML = data[1];
	    //HomePage.points.push(data[1]);
	    HomePage.start(data[1]);
	});
    }


  
    static start(point) {
	HomePage.i += 2;
	//alert(HomePage.i);
	//alert(point);
	//alert(typeof point);
	HomePage.ctx.lineTo(HomePage.i, point);
	HomePage.ctx.stroke();
	alert("1");
	if (HomePage.i > 200)
	    {
		HomePage.ctx.clearRect(0,0,200,120);
		HomePage.ctx.moveTo(0,100);
	    }
	alert("2");
    }

}
