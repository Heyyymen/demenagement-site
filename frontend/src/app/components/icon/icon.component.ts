import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faArrowRight,
  faAward,
  faBuilding,
  faCheck,
  faCheckCircle,
  faClock,
  faEnvelope,
  faExclamationCircle,
  faGlobeEurope,
  faGraduationCap,
  faHandsHelping,
  faHandshake,
  faHeart,
  faHome,
  faMapMarkerAlt,
  faMoon,
  faPhone,
  faPhoneAlt,
  faQuestionCircle,
  faSpinner,
  faStar,
  faSun,
  faTools,
  faUser,
  faUsers,
  faWarehouse,
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons';

/**
 * Registre des icônes utilisées sur le site (Font Awesome 6 Free, licence CC BY 4.0 / MIT).
 * Seules ces icônes sont embarquées dans le bundle : ajouter ici toute nouvelle icône.
 */
const ICONS = {
  'arrow-right': faArrowRight,
  award: faAward,
  building: faBuilding,
  check: faCheck,
  'check-circle': faCheckCircle,
  clock: faClock,
  envelope: faEnvelope,
  'exclamation-circle': faExclamationCircle,
  'globe-europe': faGlobeEurope,
  google: faGoogle,
  'graduation-cap': faGraduationCap,
  'hands-helping': faHandsHelping,
  handshake: faHandshake,
  heart: faHeart,
  home: faHome,
  instagram: faInstagram,
  'map-marker-alt': faMapMarkerAlt,
  moon: faMoon,
  phone: faPhone,
  'phone-alt': faPhoneAlt,
  'question-circle': faQuestionCircle,
  spinner: faSpinner,
  star: faStar,
  sun: faSun,
  tiktok: faTiktok,
  tools: faTools,
  user: faUser,
  users: faUsers,
  warehouse: faWarehouse,
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;

/** Icône SVG inline, dimensionnée sur la taille de police comme les icônes Font Awesome. Décorative (aria-hidden). */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'inline-block leading-none' },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.viewBox]="viewBox()"
      fill="currentColor"
      focusable="false"
      style="height: 1em; width: auto; overflow: visible; vertical-align: -0.125em"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  private readonly def = computed(() => ICONS[this.name()].icon);
  readonly viewBox = computed(() => `0 0 ${this.def()[0]} ${this.def()[1]}`);
  readonly path = computed(() => {
    const d = this.def()[4];
    return Array.isArray(d) ? d.join(' ') : d;
  });
}
