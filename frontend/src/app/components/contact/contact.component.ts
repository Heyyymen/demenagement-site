import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DevisService, DevisRequest } from '../../services/devis.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitted = false;
  isSubmitting = false;
  submitMessage = '';
  submitError = '';
  gmailLink = '';
  gmailWebLink = '';
  showGmailButton = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly devisService: DevisService
  ) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\s\-+()]+$/)]],
      moveType: ['', Validators.required],
      moveDate: [''],
      adresseDepart: ['', Validators.required],
      adresseArrivee: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = '';
      this.submitError = '';
      this.showGmailButton = false;

      // Map new form structure to API expected structure if needed, 
      // or just send as is if the backend supports it. 
      // For now assuming backend can handle or we map it.
      // Let's map it to the old structure to be safe for the service/backend
      const formValue = this.contactForm.value;
      const devisData: DevisRequest = {
        nom: `${formValue.firstName} ${formValue.lastName}`,
        email: formValue.email,
        telephone: formValue.phone,
        typeService: formValue.moveType,
        datePrevisionnelle: formValue.moveDate,
        adresseDepart: formValue.adresseDepart,
        adresseArrivee: formValue.adresseArrivee,
        message: formValue.message
      };

      this.devisService.envoyerDevis(devisData).subscribe({
        next: (response) => {
          console.log('Réponse du serveur:', response); // Debug
          if (response.success && response.data?.mailtoLink) {
            this.submitMessage = 'Formulaire prêt ! Cliquez sur un bouton pour envoyer votre demande de devis par email.';
            this.gmailLink = response.data.mailtoLink;
            this.gmailWebLink = response.data.gmailWebLink || '';
            this.showGmailButton = true;
            console.log('Lien Gmail généré:', this.gmailLink); // Debug
            console.log('Lien Gmail Web généré:', this.gmailWebLink); // Debug
            // Ne pas reset le formulaire pour que le client puisse voir ses infos
          } else {
            this.submitError = response.message || 'Une erreur est survenue lors de l\'envoi.';
          }
          this.isSubmitting = false;
          this.isSubmitted = true;
        },
        error: (error) => {
          console.error('Erreur lors de l\'envoi:', error);
          if (error.status === 0) {
            this.submitError = 'Impossible de contacter le serveur. Veuillez vérifier votre connexion ou réessayer plus tard.';
          } else {
            this.submitError = error.error?.message || 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.';
          }
          this.isSubmitting = false;
          this.isSubmitted = true;
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Ce champ est obligatoire';
      if (field.errors['email']) return 'Format email invalide';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['pattern']) return 'Format invalide';
    }
    return '';
  }
}
