import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;

  constructor(private storage: Storage) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
  }

  async login(password: string): Promise<boolean> {
    try {
      const storedHash = await this.storage.get('passwordHash');
      if (!storedHash) {
        // First time login, set password
        const hash = CryptoJS.SHA256(password).toString();
        await this.storage.set('passwordHash', hash);
        this.isAuthenticated = true;
        return true;
      } else {
        // Check password
        const hash = CryptoJS.SHA256(password).toString();
        if (hash === storedHash) {
          this.isAuthenticated = true;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  logout() {
    this.isAuthenticated = false;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}
