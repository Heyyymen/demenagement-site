import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DevisRequest {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  typeService: string;
  datePrevisionnelle?: string;
  adresseDepart: string;
  adresseArrivee: string;
  message: string;
  consentement: boolean;
  website?: string; // Honeypot field
}

export interface DevisResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class DevisService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/devis`;

  envoyerDevis(devisData: DevisRequest): Observable<DevisResponse> {
    return this.http.post<DevisResponse>(this.apiUrl, devisData).pipe(
      catchError((error) => {
        console.error("Erreur lors de l'envoi du devis:", error);

        // Renvoyez une erreur structurée
        return throwError(() => ({
          status: error.status || 0,
          message: this.getErrorMessage(error),
          originalError: error,
        }));
      }),
    );
  }

  private getErrorMessage(error: any): string {
    if (error.status === 422) {
      return 'Erreur de validation. Vérifiez vos informations.';
    }
    if (error.status >= 500) {
      return "Une erreur serveur s'est produite.";
    }
    if (error.status === 0) {
      return 'Erreur de connexion.';
    }
    return 'Une erreur est survenue.';
  }
}
