import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ArtworkService } from '../artwork.service';
import { PlayerService, PlayerCmds } from '../player.service';
import { Media } from '../media';

import { SpotifyControl } from '../spotifyControl';



@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

  media: Media;
  cover = '';
  playing = true;
  devices;
  spotifyEnabled = false;
  enabledSpotifyDeviceID = "";
  enabledSpotifyDeviceName = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private artworkService: ArtworkService,
    private playerService: PlayerService,
    private spotifyControl: SpotifyControl
  ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.media = this.router.getCurrentNavigation().extras.state.media;
      }
    });
  }

  ngOnInit() {

    this.artworkService.getArtwork(this.media).subscribe(url => {
      this.cover = url;
    });

      /*get spotify config and show spotify control if enabled*/
    this.spotifyControl.getConfig().subscribe(config => {

      this.spotifyEnabled = (/true/i).test(config.enabled);

      if (this.spotifyEnabled){

        /*get spotify connect devices*/
        this.spotifyControl.getDevices().subscribe(
          (response) =>{
            this.devices = response;
              /*search for active device and store it*/
            for (let item of response){
              if(item.is_active){
                this.enabledSpotifyDeviceID = item.id;
                this.enabledSpotifyDeviceName  = item.name;
              }

            }
              /*if no active device has been found, set first one to active and transfer playback*/
            if (this.enabledSpotifyDeviceID == ""){
                this.enabledSpotifyDeviceID = response[0].id
                this.enabledSpotifyDeviceName = response[0].name
                this.spotifyControl.setDevice(this.enabledSpotifyDeviceID);
            }
          }
        );
      }
    });
  }

  transferPlayback(deviceID){
     this.spotifyControl.setDevice(deviceID);
  }

  ionViewWillEnter() {
    if (this.media) {
      this.playerService.sendCmd(PlayerCmds.CLEARQUEUE);
      this.playerService.playMedia(this.media);
    }
  }

  ionViewWillLeave() {
    this.playerService.sendCmd(PlayerCmds.PAUSE);
  }

  volUp() {
    this.playerService.sendCmd(PlayerCmds.VOLUMEUP);
  }

  volDown() {
    this.playerService.sendCmd(PlayerCmds.VOLUMEDOWN);
  }

  skipPrev() {
    this.playerService.sendCmd(PlayerCmds.PREVIOUS);
  }

  skipNext() {
    this.playerService.sendCmd(PlayerCmds.NEXT);
  }

  playPause() {
    if (this.playing) {
      this.playing = false;
      this.playerService.sendCmd(PlayerCmds.PAUSE);
    } else {
      this.playing = true;
      this.playerService.sendCmd(PlayerCmds.PLAY);
    }
  }
}
