import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  private _places: Place[] = [
    new Place('p1', 'Manhattan Mansion', 'In the heart of New York City.', 'https://images1.apartments.com/i2/h8jFKVlKaqHOy8RjKrOQE7hysBpYSRmkpfRJrRBb6t0/117/the-anthem-new-york-ny-building-photo.jpg', 149.99),
    new Place('p2', 'L\'amour Toujours', 'A romantic place in Paris!', 'https://www.parisperfect.com/g/apartment-hero-images/hi_3-160827-369_new.jpg', 189.99),
    new Place('p3', 'The foggy palace', 'Not your average city trip!', 'https://i.dailymail.co.uk/i/pix/2014/02/14/article-2559360-1B7B4D6200000578-322_964x638.jpg', 99.99)
  ];

  get places() {
    return [...this._places]
  }

  constructor() { }

  getPlace(id: string) {
    return { ...this._places.find(p => p.id === id) };
  }

}
