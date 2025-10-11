import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthHeaderComponent } from '../../../../shared/components/ui/header/header.component';

@Component({
  selector: 'app-entity-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthHeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center px-4 sm:px-6 lg:px-8">
      <div class="flex items-start w-full">
        <auth-header class="flex-1" />
      </div>

      <main class="h-full flex-1 flex flex-col items-center justify-center w-full max-w-xl">
        <div class="w-full bg-white p-8 rounded-lg shadow-lg animate-fade-in">
          <div class="text-center">
            <h1 class="text-3xl font-semibold text-slate-800">Créer un compte client</h1>
            <p class="mt-2 text-gray-600">Renseignez vos informations pour rejoindre l'entité.</p>
          </div>

          <!-- Invitation context (prefilled via URL) -->
          <div class="mt-4">
            <ng-container *ngIf="hasInvite; else noInviteTpl">
              <div class="px-3 py-2 rounded-md bg-purple-50 text-purple-700 text-sm">
                Lien d'invitation détecté. Vous allez rejoindre l'entité n°{{ form.value.entityId }}.
              </div>
            </ng-container>
            <ng-template #noInviteTpl>
              <div class="px-3 py-2 rounded-md bg-amber-50 text-amber-700 text-sm">
                Lien d'invitation manquant ou invalide. Veuillez ouvrir ce formulaire depuis votre lien d'invitation.
              </div>
            </ng-template>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-8 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Prénom</label>
                <input type="text" formControlName="firstName" class="mt-1 w-full rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500" placeholder="John" />
                <p class="text-xs text-red-600 mt-1" *ngIf="submitted && form.controls.firstName.invalid">Prénom requis</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nom</label>
                <input type="text" formControlName="lastName" class="mt-1 w-full rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500" placeholder="Doe" />
                <p class="text-xs text-red-600 mt-1" *ngIf="submitted && form.controls.lastName.invalid">Nom requis</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Identifiant</label>
              <input type="text" formControlName="login" class="mt-1 w-full rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500" placeholder="jdoe" />
              <p class="text-xs text-red-600 mt-1" *ngIf="submitted && form.controls.login.invalid">Identifiant requis</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" formControlName="email" class="mt-1 w-full rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500" placeholder="john@exemple.com" />
              <p class="text-xs text-red-600 mt-1" *ngIf="submitted && form.controls.email.invalid">Email valide requis</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input type="password" formControlName="password" class="mt-1 w-full rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500" placeholder="••••••••" />
                <p class="text-xs text-red-600 mt-1" *ngIf="submitted && form.controls.password.invalid">6 caractères minimum</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                <input type="password" formControlName="confirm" class="mt-1 w-full rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500" placeholder="••••••••" />
                <p class="text-xs text-red-600 mt-1" *ngIf="submitted && form.errors?.['passwordMismatch']">Les mots de passe ne correspondent pas</p>
              </div>
            </div>

            <!-- entityId et token sont préremplis via l'URL et non affichés dans le formulaire -->

            <button type="submit" [disabled]="loading || !hasInvite" class="w-full inline-flex justify-center items-center rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-60">
              <svg *ngIf="loading" class="mr-2 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Créer mon compte client
            </button>
          </form>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in { animation: fade-in 0.6s ease-out; }
    `,
  ],
})
export class EntityRegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  submitted = false;
  loading = false;
  hasInvite = false;

  form = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      login: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
      entityId: [null as number | null, [Validators.required]],
      token: ['', [Validators.required]],
    },
    { validators: [passwordsMatchValidator] }
  );

  ngOnInit(): void {
    // prefill from query params if present
    this.route.queryParamMap.subscribe((params) => {
      const entityId =
        params.get('entityId') ||
        params.get('entity') ||
        params.get('eid');
      let token =
        (params.get('token') ||
          params.get('invitationToken') ||
          params.get('invite') ||
          params.get('t')) || null;
      if (token) {
        // Some links render '+' as space in querystrings; revert spaces to '+'
        token = token.replace(/\s/g, '+').trim();
      }
      if (entityId) this.form.patchValue({ entityId: Number(entityId) });
      if (token) this.form.patchValue({ token });
      this.hasInvite = !!(entityId && token);
      if (!this.hasInvite) {
        this.toast.info("Aucun lien d'invitation détecté. Les champs sont requis mais masqués.");
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    if (!this.hasInvite || this.form.invalid) {
      this.toast.warning('Veuillez corriger les erreurs du formulaire.');
      return;
    }

    const { confirm, ...raw } = this.form.getRawValue();
    this.loading = true;
    // Safe debug: confirm token and entityId presence without exposing secrets
    try {
      const t = String((raw as any).token || '')
        .replace(/.(?=.{4})/g, '*');
      console.debug('[EntityRegister] Sending payload', {
        entityId: (raw as any).entityId,
        tokenMasked: t,
      });
    } catch {}
    this.auth
      .entityRegister({ ...(raw as any), entityId: Number(raw.entityId) })
      .subscribe({
        next: () => {
          this.loading = false;
          this.toast.success("Inscription réussie. Vous pouvez vous connecter.");
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.loading = false;
          this.toast.error(err?.message || "Échec de l'inscription");
        },
      });
  }
}

function passwordsMatchValidator(group: any) {
  const p = group.get('password')?.value;
  const c = group.get('confirm')?.value;
  return p && c && p === c ? null : { passwordMismatch: true };
}
