import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DevisRequest {
  nom: string;
  email: string;
  telephone: string;
  typeService: string;
  datePrevisionnelle?: string;
  adresseDepart: string;
  adresseArrivee: string;
  message: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    client: {
      nom: string;
      email: string;
      telephone: string;
    };
    service: string;
    mailtoLink: string;
    gmailWebLink: string;
    emailPreview?: {
      to: string;
      subject: string;
      bodyPreview: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private readonly apiUrl = this.getApiUrl();

  constructor(private readonly http: HttpClient) {}

  private getApiUrl(): string {
    // En production sur Netlify, utilise les fonctions serverless
    if (window.location.hostname !== 'localhost') {
      return '/.netlify/functions';
    }
    // En développement local, utilise le serveur Node.js
    return 'http://localhost:3000/api';
  }

  envoyerDevis(devisData: DevisRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/devis`, devisData);
  }

  testerConnexion(): Observable<ApiResponse> {
    // En production, pas besoin de test de connexion
    if (window.location.hostname !== 'localhost') {
      return new Observable(observer => {
        observer.next({ success: true, message: 'Fonctions Netlify actives' });
        observer.complete();
      });
    }
    return this.http.get<ApiResponse>(`${this.apiUrl}/test`);
  }
}
