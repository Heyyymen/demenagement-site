import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

/** Endpoint relatif : fonctionne en production comme avec `netlify dev` en local. */
const DEVIS_ENDPOINT = '/.netlify/functions/devis';

export interface DevisRequest {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  typeService: string;
  datePrevisionnelle: string;
  adresseDepart: string;
  adresseArrivee: string;
  message: string;
  consentement: boolean;
  /** Champ piège anti-robot : doit rester vide. */
  website: string;
  /** Temps de remplissage, en ms (anti-robot). */
  elapsedMs: number;
}

export interface DevisResponse {
  success: boolean;
  message: string;
}

export interface DevisError {
  status: number;
  message: string;
}

const PHONE_HINT = 'Vous pouvez aussi nous appeler au 01 70 24 08 60.';

@Injectable({ providedIn: 'root' })
export class DevisService {
  private readonly http = inject(HttpClient);

  envoyerDevis(devis: DevisRequest): Observable<DevisResponse> {
    return this.http
      .post<DevisResponse>(DEVIS_ENDPOINT, devis)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError((): DevisError => ({ status: error.status, message: DevisService.toMessage(error.status) })),
        ),
      );
  }

  private static toMessage(status: number): string {
    if (status === 0) return `Connexion impossible. Vérifiez votre connexion Internet. ${PHONE_HINT}`;
    if (status === 422) return 'Certaines informations sont invalides. Vérifiez le formulaire.';
    if (status === 429) return `Trop de demandes envoyées. Réessayez dans quelques minutes. ${PHONE_HINT}`;
    return `Une erreur est survenue lors de l'envoi. ${PHONE_HINT}`;
  }
}
