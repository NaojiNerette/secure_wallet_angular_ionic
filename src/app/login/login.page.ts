import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form (ngSubmit)="login()">
        <ion-item>
          <ion-label position="floating">Password</ion-label>
          <ion-input type="password" [(ngModel)]="password" name="password" required></ion-input>
        </ion-item>
        <ion-button expand="block" type="submit" [disabled]="!password">Login</ion-button>
      </form>
    </ion-content>
  `
})
export class LoginPage {
  password: string = '';

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async login() {
    try {
      if (await this.authService.login(this.password)) {
        this.storageService.setEncryptionKey(this.password);
        this.router.navigate(['/home']);
      } else {
        this.showAlert('Login Failed', 'Invalid password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showAlert('Error', 'An unexpected error occurred. Please try again.');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
