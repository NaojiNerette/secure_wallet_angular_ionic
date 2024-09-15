import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DocumentPage } from './document.page';

import { DocumentPageRoutingModule } from './document-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentPageRoutingModule
  ],
  declarations: [DocumentPage]
})
export class DocumentPageModule {}
