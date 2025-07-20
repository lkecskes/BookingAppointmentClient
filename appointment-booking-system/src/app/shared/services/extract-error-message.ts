import { Component, Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ExtractErrorMessageService {
  extractBackendErrorMessage(error: any): string {
    if (error?.response) {
      try {
        const parsed = typeof error.response === 'string'
          ? JSON.parse(error.response)
          : error.response;
        return parsed.message || 'Hiba történt regisztráció közben.';
      } catch {
        return 'Hiba történt regisztráció közben.';
      }
    }
    return error?.message || 'Hiba történt regisztráció közben.';
  }
}

