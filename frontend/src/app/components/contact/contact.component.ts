import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { map } from 'rxjs';
import { SERVICES } from '../../data/services.data';
import { DevisError, DevisService } from '../../services/devis.service';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const MESSAGE_MAX = 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^(0\d{9}|\+\d{8,15})$/;

/** Téléphone FR (10 chiffres) ou international (+ et 8 à 15 chiffres) ; espaces, points et tirets tolérés. */
function phoneValidator(control: AbstractControl<string>): ValidationErrors | null {
  const cleaned = (control.value ?? '').replace(/[\s.\-()]/g, '');
  return !cleaned || PHONE_PATTERN.test(cleaned) ? null : { phone: true };
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  prenom: {
    required: 'Le prénom est obligatoire',
    minlength: 'Minimum 2 caractères',
    maxlength: 'Maximum 50 caractères',
  },
  nom: { required: 'Le nom est obligatoire', minlength: 'Minimum 2 caractères', maxlength: 'Maximum 50 caractères' },
  email: { required: "L'email est obligatoire", pattern: 'Adresse email invalide' },
  telephone: {
    required: 'Le téléphone est obligatoire',
    phone: 'Numéro invalide (ex. 06 12 34 56 78 ou +33 6 12 34 56 78)',
  },
  typeService: { required: 'Sélectionnez un type de déménagement' },
  adresseDepart: {
    required: "L'adresse est obligatoire",
    minlength: 'Adresse trop courte',
    maxlength: 'Adresse trop longue',
  },
  adresseArrivee: {
    required: "L'adresse est obligatoire",
    minlength: 'Adresse trop courte',
    maxlength: 'Adresse trop longue',
  },
  message: { maxlength: `Maximum ${MESSAGE_MAX} caractères` },
  consentement: { required: 'Votre accord est nécessaire pour traiter la demande' },
};

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, ReactiveFormsModule, RouterLink],
})
export class ContactComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly devisService = inject(DevisService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private startedAt = Date.now();

  readonly services = SERVICES;
  readonly messageMax = MESSAGE_MAX;
  readonly minDate = todayIso();
  readonly status = signal<SubmitStatus>('idle');
  readonly errorMessage = signal('');
  readonly submitted = signal(false);

  readonly form = this.fb.group({
    prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    telephone: ['', [Validators.required, phoneValidator]],
    typeService: ['', Validators.required],
    datePrevisionnelle: [''],
    adresseDepart: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    adresseArrivee: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    message: ['', Validators.maxLength(MESSAGE_MAX)],
    consentement: [false, Validators.requiredTrue],
    website: [''], // champ piège anti-robot
  });

  readonly messageLength = toSignal(this.form.controls.message.valueChanges.pipe(map((v) => v.length)), {
    initialValue: 0,
  });

  showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  errorFor(name: keyof typeof this.form.controls): string {
    const errors = this.form.controls[name].errors;
    if (!errors) return '';
    const key = Object.keys(errors)[0];
    return ERROR_MESSAGES[name]?.[key] ?? 'Valeur invalide';
  }

  onSubmit(): void {
    if (this.status() === 'submitting') return;
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.host.nativeElement.querySelector<HTMLElement>('form .ng-invalid:not(form)')?.focus();
      return;
    }

    const value = this.form.getRawValue();
    this.status.set('submitting');
    this.errorMessage.set('');

    this.devisService
      .envoyerDevis({
        ...value,
        telephone: value.telephone.replace(/[\s.\-()]/g, ''),
        elapsedMs: Date.now() - this.startedAt,
      })
      .subscribe({
        next: () => {
          this.status.set('success');
          this.submitted.set(false);
          this.form.reset();
          this.startedAt = Date.now();
        },
        error: (error: DevisError) => {
          this.status.set('error');
          this.errorMessage.set(error.message);
        },
      });
  }
}
