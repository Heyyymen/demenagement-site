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

  minDate: string = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly devisService: DevisService
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
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
      const formValue = this.contactForm.value;

      const subject = `Demande de devis - ${formValue.firstName} ${formValue.lastName}`;
      const body = `
Bonjour,

Je souhaite obtenir un devis pour un déménagement. Voici mes informations :

Nom : ${formValue.lastName}
Prénom : ${formValue.firstName}
Email : ${formValue.email}
Téléphone : ${formValue.phone}

Type de déménagement : ${formValue.moveType}
Date souhaitée : ${formValue.moveDate}

Adresse de départ : ${formValue.adresseDepart}
Adresse d'arrivée : ${formValue.adresseArrivee}

Message :
${formValue.message}

Cordialement,
${formValue.firstName} ${formValue.lastName}
      `.trim();

      const mailtoLink = `mailto:reflexdemenagement@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Open the mailto link
      window.location.href = mailtoLink;

      this.isSubmitting = false;
      this.isSubmitted = true;
      this.submitMessage = 'Votre client de messagerie a été ouvert avec les informations préremplies.';

      // Optional: still call the service if you want to save data to backend, 
      // but for now we prioritize the user request to open email.
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
