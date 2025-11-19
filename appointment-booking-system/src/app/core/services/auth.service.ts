import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  nameid: string; // userId
  unique_name: string; // username
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private decodedToken: DecodedToken | null = null;

  constructor() {
    this.loadToken();
  }

  private loadToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.decodedToken = jwtDecode<DecodedToken>(token);
    }
  }

  getUserId(): string | null {
    this.loadToken(); // Frissítjük az adatokat minden hívásnál
    return this.decodedToken?.nameid || null;
  }

  getUsername(): string | null {
    return this.decodedToken?.unique_name || null;
  }

  getUserRole(): string | null {
    return this.decodedToken?.role || null;
  }

  isTokenExpired(): boolean {
    if (!this.decodedToken?.exp) return true;

    const expirationDate = new Date(this.decodedToken.exp * 1000);
    return expirationDate <= new Date();
  }
}
