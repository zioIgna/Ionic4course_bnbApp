import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  constructor(private modalCtrl: ModalController, private http: HttpClient) { }

  onPickLocation() {
    this.modalCtrl
      .create({ component: MapModalComponent })
      .then(modalEl => {
        modalEl.onDidDismiss().then(modalData => {
          // console.log(modalData.data);
          if (!modalData.data) {
            return;
          }
          this.getAddress(modalData.data.lat, modalData.data.lng).subscribe((address) => {
            console.log(address);
          });
        });
        modalEl.present();
      });
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get<any>(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`
    ).pipe(
      map(geoData => {
        // console.log(geoData);
        if (!geoData || !geoData.results || geoData.results.length === 0) {
          return null;
        }
        return geoData.results[0].formatted_address;
      })
    );
  }

  ngOnInit() { }

}
