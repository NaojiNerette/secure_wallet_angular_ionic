import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})


export class HomePage implements OnInit {
  documents: string[] = [];

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    try {
      this.documents = await this.storageService.getAllDocuments();
    } catch (error) {
      console.error('Error fetching documents:', error);
      this.showAlert('Error', 'Failed to load documents. Please try again. ->' + error);
    }
  }

  async handleRefresh(event: any) {
    try {
      this.documents = await this.storageService.getAllDocuments();
    } catch (error) {
      console.error('Error fetching documents:', error);
      this.showAlert('Error', 'Failed to load documents. Please try again. ->' + error);
    } finally {
      event.target.complete();
    }
  }

  addDocument() {
    this.router.navigate(['/document', 'new']);
  }

  viewDocument(name: string) {
    this.router.navigate(['/document', name]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
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
