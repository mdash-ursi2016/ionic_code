import {Page} from 'ionic-angular';
import {Alert, NavController} from 'ionic-angular';

@Page({
  templateUrl: 'build/pages/about/about.html'
})
export class AboutPage {
  static get parameters() {
    return [[NavController]];
  }
  constructor(nav) {

  /* A simple alert function to simply version info for the app */
      
      this.slides = [
	  {
	      title: "Welcome!",
	      description: "Thanks for using the 2016 URSI Mobile Health Kit application.",
	      image: "img/ica-slidebox-img-1.png",
	  },
	  {
	      title: "How to Start?",
	      description: "The first step to take is authorizing yourself on our server. Head to the <b>Data Page</b> and obtain an Authorization Token.",
	      image: "img/ica-slidebox-img-2.png",
	  },
	  {
	      title: "Linking Up",
	      description: "It's time to connect to your device. Navigate to the <b>Bluetooth Page</b> and start up a scan.",
	      image: "img/ica-slidebox-img-3.png",
	  },
	  {
	      title: "Data Incoming",
	      description: "Finally you can start viewing data! The <b>Home Page</b> will automatically display incoming heart rate information. The center box will display a live EKG graph and a BPM readout will be displayed as well.",
	      image: "img/slidebox_6.png",
	  },
	  {
	      title: "Graphing",
	      description: "You can also view long term data from the server on the <b>Data Page</b>. The last 24 hours are automatically displayed. Clicking <b>+/-</b> will zoom in and out out and the <b><-/-></b> will slide to different dates.",
	      image: "img/slidebox_5.png",
	  }
      ];
  }
}
/*



    aboutAlert() {
	let alert = Alert.create({
	    title: 'App Info',
	    message: 'Version 0.8.0<br>Last Updated: July 13, 2016<br><br>Created by Alex, Macall, Nate, and JSON',
	    buttons: ['Ok']
	});
	/* Actually display the alert
	this.nav.present(alert);

    }

}*/
