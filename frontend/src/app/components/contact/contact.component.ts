import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DevisService, DevisRequest, DevisResponse } from '../../services/devis.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  minDate: string = '';
  messageCharCount = 0;
  maxMessageLength = 500;

  constructor(
    private readonly fb: FormBuilder,
    private readonly devisService: DevisService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.minDate = new Date().toISOString().split('T')[0];
    this.contactForm = this.fb.group(
      {
        prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        telephone: ['', Validators.required],
        typeService: ['', Validators.required],
        datePrevisionnelle: [''],
        adresseDepart: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
        adresseArrivee: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
        message: ['', [Validators.maxLength(500)]],
        consentement: [false, Validators.requiredTrue],
        website: [''] // Honeypot
      },
      {
        validators: [this.emailOrPhoneValidator(), this.phoneFormatValidator()]
      }
    );

    // Track message character count
    this.contactForm.get('message')?.valueChanges.subscribe((value: string) => {
      this.messageCharCount = value?.length || 0;
    });
  }

  /**
   * Validateur personnalisé : au moins email OU téléphone doit être rempli
   */
  private emailOrPhoneValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const email = group.get('email')?.value;
      const telephone = group.get('telephone')?.value;

      if (!email && !telephone) {
        return { emailOrPhoneRequired: true };
      }
      return null;
    };
  }

  /**
   * Validateur de téléphone français avec flexibilité (espaces, points tolérés)
   * Format accepté : 10 chiffres ou +33 suivi de 9 chiffres
   */
  private phoneFormatValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const telephone = group.get('telephone')?.value;

      if (!telephone) {
        return null; // Validation par emailOrPhoneValidator
      }

      // Nettoyer : supprimer espaces, points, traits
      const cleaned = telephone.replace(/[\s\.\-()]/g, '');

      // Regex : 10 chiffres ou +33 suivi de 9 chiffres
      const phoneRegex = /^(\d{10}|\+33\d{9})$/;

      if (!phoneRegex.test(cleaned)) {
        group.get('telephone')?.setErrors({ invalidPhoneFormat: true });
        return { invalidPhoneFormat: true };
      }

      return null;
    };
  }

  onSubmit(): void {
    if (this.contactForm.invalid || this.isSubmitting) {
      Object.keys(this.contactForm.controls).forEach((key) => {
        this.contactForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Vérifier honeypot
    if (this.contactForm.get('website')?.value) {
      // Silencieusement, considérer comme succès mais ne rien envoyer
      this.submitSuccess = true;
      this.resetForm();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const formValue = this.contactForm.value;
    const devisRequest: DevisRequest = {
      prenom: formValue.prenom,
      nom: formValue.nom,
      email: formValue.email,
      telephone: formValue.telephone,
      typeService: formValue.typeService,
      datePrevisionnelle: formValue.datePrevisionnelle || undefined,
      adresseDepart: formValue.adresseDepart,
      adresseArrivee: formValue.adresseArrivee,
      message: formValue.message || '',
      consentement: formValue.consentement,
      website: formValue.website // Honeypot
    };

    this.devisService.envoyerDevis(devisRequest).subscribe({
      next: (response: DevisResponse) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.submitError = '';
        this.resetForm();
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.submitSuccess = false;

        // Afficher message d'erreur en français
        if (error.status === 422) {
          this.submitError =
            'Erreur de validation. Vérifiez vos informations et réessayez.';
        } else if (error.status >= 500) {
          this.submitError =
            'Une erreur serveur s\'est produite. Veuillez contacter Reflex Déménagement au 01 70 24 08 60.';
        } else if (error.status === 0) {
          this.submitError =
            'Erreur de connexion. Vérifiez votre connexion Internet ou appelez au 01 70 24 08 60.';
        } else {
          this.submitError =
            'Une erreur est survenue. Veuillez réessayer ou appelez au 01 70 24 08 60.';
        }

        console.error('Erreur lors de l\'envoi du devis:', error);
      }
    });
  }

  private resetForm(): void {
    this.contactForm.reset();
    this.messageCharCount = 0;
    // Remettre la date minimale
    this.minDate = new Date().toISOString().split('T')[0];
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isFieldError(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    const errors = field.errors;

    switch (fieldName) {
      case 'prenom':
      case 'nom':
        if (errors['required']) return 'Ce champ est obligatoire';
        if (errors['minlength']) return 'Minimum 2 caractères';
        if (errors['maxlength']) return 'Maximum 50 caractères';
        break;

      case 'email':
        if (errors['required']) return 'L\'email est obligatoire';
        if (errors['email']) return 'Adresse email invalide';
        break;

      case 'telephone':
        if (errors['required']) return 'Au moins un contact (email ou téléphone) est obligatoire';
        if (errors['invalidPhoneFormat'])
          return 'Téléphone invalide (10 chiffres ou +33 suivi de 9 chiffres)';
        break;

      case 'typeService':
        if (errors['required']) return 'Veuillez sélectionner un type de déménagement';
        break;

      case 'adresseDepart':
      case 'adresseArrivee':
        if (errors['required']) return 'L\'adresse est obligatoire';
        if (errors['minlength']) return 'L\'adresse est trop courte';
        if (errors['maxlength']) return 'L\'adresse est trop longue';
        break;

      case 'message':
        if (errors['maxlength']) return 'Maximum 500 caractères';
        break;

      case 'consentement':
        if (errors['required']) return 'Vous devez accepter la politique de confidentialité';
        break;
    }

    return 'Erreur de validation';
  }

  hasFormError(): boolean {
    return this.contactForm.hasError('emailOrPhoneRequired') && this.contactForm.touched;
  }
}
