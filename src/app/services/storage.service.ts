import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CryptoJS from 'crypto-js';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private encryptionKey: string = '';
  private _storage: Storage | null = null;
  private storageReady = new BehaviorSubject<boolean>(false);

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    this.storageReady.next(true);
    await this.ensureDocumentsFolderExists();
  }

  private async waitForStorage(): Promise<void> {
    if (this._storage !== null) {
      return;
    }
    await firstValueFrom(this.storageReady.asObservable());
  }

  setEncryptionKey(password: string) {
    this.encryptionKey = CryptoJS.SHA256(password).toString();
  }

  private async ensureDocumentsFolderExists() {
    try {
      await Filesystem.readdir({
        path: 'documents',
        directory: Directory.Documents
      });
    } catch (e) {
      // If the folder doesn't exist, create it
      await Filesystem.mkdir({
        path: 'documents',
        directory: Directory.Documents,
        recursive: true
      });
    }
  }

  async saveDocument(name: string, fileData: string, mimeType: string): Promise<void> {
    await this.waitForStorage();
    try {
      await this.ensureDocumentsFolderExists();
      const encryptedData = CryptoJS.AES.encrypt(fileData, this.encryptionKey).toString();
      await this._storage?.set(name, JSON.stringify({ encryptedData, mimeType }));

      // Save to filesystem as well
      await Filesystem.writeFile({
        path: `documents/${name}`,
        data: encryptedData,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
    } catch (error) {
      console.error('Save document error:', error);
      throw error;
    }
  }

  async getDocument(name: string): Promise<{ data: string; mimeType: string } | null> {
    await this.waitForStorage();
    try {
      let storedData = await this._storage?.get(name);
      if (!storedData) {
        // Try to get from filesystem if not in storage
        const result = await Filesystem.readFile({
          path: `documents/${name}`,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        storedData = result.data;
      }
      if (storedData) {
        const { encryptedData, mimeType } = JSON.parse(storedData);
        const decryptedData = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey).toString(CryptoJS.enc.Utf8);
        return { data: decryptedData, mimeType };
      }
      return null;
    } catch (error) {
      console.error('Get document error:', error);
      throw error;
    }
  }

  async getAllDocuments(): Promise<string[]> {
    await this.waitForStorage();
    try {
      await this.ensureDocumentsFolderExists();
      const keys = await this._storage?.keys() ?? [];
      const filesystemDocs = await Filesystem.readdir({
        path: 'documents',
        directory: Directory.Documents,
      });
      const allDocs = [...new Set([...keys, ...filesystemDocs.files?.map(f => f.name) ?? []])];
      return allDocs.filter(key => key !== 'passwordHash');
    } catch (error) {
      console.error('Get all documents error:', error);
      throw error;
    }
  }

  async deleteDocument(name: string): Promise<void> {
    await this.waitForStorage();
    try {
      await this._storage?.remove(name);
      await Filesystem.deleteFile({
        path: `documents/${name}`,
        directory: Directory.Documents,
      });
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }

  async saveNote(title: string, content: string): Promise<void> {
    await this.waitForStorage();
    try {
      const encryptedContent = CryptoJS.AES.encrypt(content, this.encryptionKey).toString();
      await this._storage?.set(`note_${title}`, JSON.stringify({ title, encryptedContent }));
    } catch (error) {
      console.error('Save note error:', error);
      throw error;
    }
  }

  async getNote(title: string): Promise<string | null> {
    await this.waitForStorage();
    try {
      const storedData = await this._storage?.get(`note_${title}`);
      if (storedData) {
        const { encryptedContent } = JSON.parse(storedData);
        return CryptoJS.AES.decrypt(encryptedContent, this.encryptionKey).toString(CryptoJS.enc.Utf8);
      }
      return null;
    } catch (error) {
      console.error('Get note error:', error);
      throw error;
    }
  }

  async getAllNotes(): Promise<string[]> {
    await this.waitForStorage();
    try {
      const keys = await this._storage?.keys() ?? [];
      return keys.filter(key => key.startsWith('note_')).map(key => key.slice(5));
    } catch (error) {
      console.error('Get all notes error:', error);
      throw error;
    }
  }

  async deleteNote(title: string): Promise<void> {
    await this.waitForStorage();
    try {
      await this._storage?.remove(`note_${title}`);
    } catch (error) {
      console.error('Delete note error:', error);
      throw error;
    }
  }
}
