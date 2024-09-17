import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  template: `
    <ion-content class="ion-padding custom-background">
      <div class="flex-center">
        <ion-card class="custom-card">
          <img src="/assets/splash.png" alt="Secure Wallet Logo" class="card-image">
          <ion-card-header>
            <ion-card-title class="ion-text-center">Secure Wallet</ion-card-title>
            <ion-card-subtitle class="ion-text-center">Inicia sesión para acceder</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <form (ngSubmit)="login()">
              <ion-item>
                <ion-label position="floating">Contraseña</ion-label>
                <ion-input type="password" [(ngModel)]="password" name="password" required class="custom-input"></ion-input>
              </ion-item>
              <ion-button expand="block" type="submit" class="custom-button ion-margin-top">
                Iniciar Sesión
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .flex-center {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
    .card-image {
      margin: 20px auto;
      display: block;
    }
    ion-card {
      width: 100%;
      max-width: 400px;
    }
  `]
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
