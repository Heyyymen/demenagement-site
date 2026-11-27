import { Injectable, signal } from '@angular/core';

/** Permet à un bouton (ex. « Devis monte-meuble ») de pré-sélectionner le service dans le formulaire. */
@Injectable({ providedIn: 'root' })
export class DevisPrefillService {
  readonly serviceId = signal<string | null>(null);

  select(serviceId: string): void {
    this.serviceId.set(serviceId);
  }
}
