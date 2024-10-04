import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NotesPage, NoteEditorComponent } from './notes.page';
import { NotesPageRoutingModule } from './notes-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotesPageRoutingModule
  ],
  declarations: [NotesPage, NoteEditorComponent]
})
export class NotesPageModule {}
