import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

// [
//   new Place(
//     'p1',
//     'Manhattan Mansion',
//     'In the heart of New York City.',
//     'https://images1.apartments.com/i2/h8jFKVlKaqHOy8RjKrOQE7hysBpYSRmkpfRJrRBb6t0/117/the-anthem-new-york-ny-building-photo.jpg',
//     149.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p2',
//     'L\'amour Toujours',
//     'A romantic place in Paris!',
//     'https://www.parisperfect.com/g/apartment-hero-images/hi_3-160827-369_new.jpg',
//     189.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p3',
//     'The foggy palace',
//     'Not your average city trip!',
//     'https://i.dailymail.co.uk/i/pix/2014/02/14/article-2559360-1B7B4D6200000578-322_964x638.jpg',
//     99.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   )
// ]

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) { }

  fetchPlaces() {
    return this.http
      .get<{ [key: string]: PlaceData }>('https://ionic-angular-course-fb3d1.firebaseio.com/offered-places.json')
      .pipe(
        map(
          resData => {
            const places = [];
            for (const key in resData) {
              if (resData.hasOwnProperty(key)) {
                places.push(
                  new Place(
                    key,
                    resData[key].title,
                    resData[key].description,
                    resData[key].imageUrl,
                    resData[key].price,
                    new Date(resData[key].availableFrom),
                    new Date(resData[key].availableTo),
                    resData[key].userId
                  )
                )
              }
            }
            return places;
            // return [];
          }
        ),
        tap(places => {
          this._places.next(places);
        })
      );
  }

  getPlace(id: string) {
    return this.places.pipe(
      take(1),
      map(places => {
        return { ...places.find(p => p.id === id) };
      })
    );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://i.dailymail.co.uk/i/pix/2014/02/14/article-2559360-1B7B4D6200000578-322_964x638.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this.http
      .post<{ name: string }>('https://ionic-angular-course-fb3d1.firebaseio.com/offered-places.json',
        { ...newPlace, id: null })
      .pipe(
        switchMap(
          resData => {
            generatedId = resData.name;
            return this.places;
          }
        ),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap((places) => {
    //     this._places.next(places.concat(newPlace));
    //   })
    // );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        return this.http.put(`https://ionic-angular-course-fb3d1.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }

}
