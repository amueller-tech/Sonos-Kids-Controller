import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { publishReplay, refCount } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class SpotifyControl{

    private config: Observable<any> = null;

    constructor(private http: HttpClient) {}

    getConfig() {
      // Observable with caching:
      // publishReplay(1) tells rxjs to cache the last response of the request
      // refCount() keeps the observable alive until all subscribers unsubscribed
      if (!this.config) {
        const url = (environment.production) ? '../api/spotifyConnect' : 'http://localhost:8200/api/spotifyConnect';

        this.config = this.http.get<any>(url).pipe(
          publishReplay(1), // cache result
          refCount()
        );
      }

      return this.config;
    }

      /*gets all available device IDs for playback*/
    getDevices(): Observable<any> {

      return new Observable(obs=> {
          this.getConfig().subscribe(config => {
              let url = "http://" + config.server + ":" +  config.port + "/getDevices";
              this.http.get(url).subscribe(data => obs.next(data));
          });
      });

    }



      /*sets Device ID for playback*/
    setDevice(deviceID){

      this.getConfig().subscribe(config => {
          let url = "http://" + config.server + ":" +  config.port + "/setDevice?id=" + deviceID;;
          this.http.get(url).subscribe();
      });
    }


}
