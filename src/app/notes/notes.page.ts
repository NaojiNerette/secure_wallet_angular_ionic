import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-notes',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Notas</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="addNote()">
            <ion-icon name="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding custom-background">
      <ion-list>
        <ion-item *ngFor="let note of notes" (click)="openNote(note)" class="custom-item">
          <ion-label>{{ note }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class NotesPage implements OnInit {
  notes: string[] = [];

  constructor(
    private storageService: StorageService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadNotes();
  }

  async loadNotes() {
    this.notes = await this.storageService.getAllNotes();
  }

  async addNote() {
    const alert = await this.alertController.create({
      header: 'Nueva Nota',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Título de la nota'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: (data) => {
            if (data.title) {
              this.openNote(data.title, true);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async openNote(title: string, isNew: boolean = false) {
    const modal = await this.modalController.create({
      component: NoteEditorComponent,
      componentProps: {
        title: title,
        isNew: isNew
      }
    });

    modal.onDidDismiss().then(() => {
      this.loadNotes();
    });

    return await modal.present();
  }
}

@Component({
  selector: 'app-note-editor',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-title>{{ isNew ? 'Nueva Nota' : 'Editar Nota' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="saveNote()">Guardar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="floating">Título</ion-label>
        <ion-input [(ngModel)]="title" [readonly]="!isNew"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="floating">Contenido</ion-label>
        <ion-textarea [(ngModel)]="content" rows="10"></ion-textarea>
      </ion-item>
    </ion-content>
  `
})
export class NoteEditorComponent implements OnInit {
  title: string = '';
  content: string = '';
  isNew: boolean = false;

  constructor(
    private modalController: ModalController,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    if (!this.isNew) {
      this.loadNote();
    }
  }

  async loadNote() {
    this.content = await this.storageService.getNote(this.title) || '';
  }

  async saveNote() {
    await this.storageService.saveNote(this.title, this.content);
    this.dismiss();
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
