import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Affiche une information légale, ou un repère visible « [À compléter] » si elle manque. */
@Component({
  selector: 'app-legal-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (value()) {
      {{ value() }}
    } @else {
      <mark class="bg-yellow-200 text-yellow-900 px-1 rounded">[À compléter]</mark>
    }
  `,
})
export class LegalValueComponent {
  readonly value = input<string | null>();
}
