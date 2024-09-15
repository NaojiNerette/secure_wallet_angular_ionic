import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-document',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isNew ? 'Nuevo Documento' : documentName }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ng-container *ngIf="fileData">
        <ion-img *ngIf="isImage" [src]="fileData"></ion-img>
        <ion-button *ngIf="!isImage" expand="block" (click)="viewDocument()">Ver Documento</ion-button>
      </ng-container>
      <ion-button expand="block" (click)="selectFile()" *ngIf="isNew">Seleccionar Archivo</ion-button>
      <ion-item *ngIf="isNew">
        <ion-label position="floating">Nombre del Documento</ion-label>
        <ion-input [(ngModel)]="documentName"></ion-input>
      </ion-item>
      <ion-button expand="block" (click)="saveDocument()" *ngIf="isNew" [disabled]="!documentName || !fileData">Guardar Documento</ion-button>
      <ion-button expand="block" color="danger" (click)="deleteDocument()" *ngIf="!isNew">Eliminar Documento</ion-button>
    </ion-content>
  `
})
export class DocumentPage implements OnInit {
  isNew: boolean = false;
  documentName: string = '';
  fileData: string = '';
  mimeType: string = '';
  isImage: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.documentName = this.route.snapshot.paramMap.get('name') ?? '';
    this.isNew = this.documentName === 'new';
    if (!this.isNew) {
      this.loadDocument();
    }
  }

  async loadDocument() {
    const loading = await this.loadingController.create({
      message: 'Cargando documento...',
    });
    await loading.present();

    try {
      const result = await this.storageService.getDocument(this.documentName);
      if (result) {
        this.fileData = result.data;
        this.mimeType = result.mimeType;
        this.isImage = this.mimeType.startsWith('image/');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      this.showAlert('Error', 'No se pudo cargar el documento. Por favor, intente de nuevo. ->' + error);
    } finally {
      await loading.dismiss();
    }
  }

  async selectFile() {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*,application/pdf,text/*';

      fileInput.addEventListener('change', async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) {
          const reader = new FileReader();
          reader.onload = async (e: ProgressEvent<FileReader>) => {
            const result = e.target?.result as string;
            this.fileData = result;
            this.mimeType = file.type;
            this.isImage = this.mimeType.startsWith('image/');
          };
          reader.readAsDataURL(file);
        }
      });

      fileInput.click();
    } catch (error) {
      console.error('File selection error:', error);
      this.showAlert('Error', 'No se pudo seleccionar el archivo. Por favor, intente de nuevo. ->' + error);
    }
  }

  async saveDocument() {
    if (this.documentName && this.fileData) {
      const loading = await this.loadingController.create({
        message: 'Guardando documento...',
      });
      await loading.present();

      try {
        await this.storageService.saveDocument(this.documentName, this.fileData, this.mimeType);
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Save document error:', error);
        this.showAlert('Error', 'No se pudo guardar el documento. Por favor, intente de nuevo. ->' + error);
      } finally {
        await loading.dismiss();
      }
    }
  }

  async deleteDocument() {
    const loading = await this.loadingController.create({
      message: 'Eliminando documento...',
    });
    await loading.present();

    try {
      await this.storageService.deleteDocument(this.documentName);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Delete document error:', error);
      this.showAlert('Error', 'No se pudo eliminar el documento. Por favor, intente de nuevo.');
    } finally {
      await loading.dismiss();
    }
  }

  async viewDocument() {
    if (!this.fileData || !this.mimeType) {
      this.showAlert('Error', 'No se pudo cargar el documento para visualización.');
      return;
    }

    let content: string | SafeResourceUrl;

    if (this.mimeType.startsWith('image/')) {
      content = this.fileData;
    } else if (this.mimeType === 'application/pdf') {
      content = this.sanitizer.bypassSecurityTrustResourceUrl(this.fileData);
    } else if (this.mimeType.startsWith('text/')) {
      const textContent = atob(this.fileData.split(',')[1]);
      content = textContent;
    } else {
      this.showAlert('Error', 'Tipo de documento no soportado para visualización.');
      return;
    }

    const modal = await this.modalController.create({
      component: DocumentViewerComponent,
      componentProps: {
        content: content,
        mimeType: this.mimeType,
        documentName: this.documentName
      }
    });

    return await modal.present();
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

@Component({
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ documentName }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismissModal()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ng-container [ngSwitch]="mimeType.split('/')[0]">
        <img *ngSwitchCase="'image'" [src]="content" style="width: 100%; height: auto;">
        <iframe *ngSwitchCase="'application'" [src]="content" style="width: 100%; height: 100%;"></iframe>
        <pre *ngSwitchCase="'text'" style="white-space: pre-wrap;">{{ content }}</pre>
      </ng-container>
    </ion-content>
  `
})
export class DocumentViewerComponent {
  content: string | SafeResourceUrl = '';
  mimeType: string = '';
  documentName: string = '';

  constructor(private modalController: ModalController) {}

  dismissModal() {
    this.modalController.dismiss();
  }
}
