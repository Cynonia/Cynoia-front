import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AuthService } from '../../../../core/services';
import { OrganisationService } from '../../../../core/services/organisation.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-organisation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './create-organisation.component.html',
})
export class CreateOrganisationComponent {
  organisationForm: FormGroup;
  loading = false;
  currentUser$ = this.authService.currentUser$;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private organisationService: OrganisationService,
    private router: Router
  ) {
    this.organisationForm = this.fb.group({
      name: ['', [Validators.required]],
      domaine: ['', [Validators.required]],
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.organisationForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Ce champ est requis';
    }
    return '';
  }

  isFieldTouched(fieldName: string): boolean {
    return this.organisationForm.get(fieldName)?.touched || false;
  }

  logout(): void {
    this.authService.signOut();
    console.log("deconn");
    
  }

  async onSubmit() {
    if (this.organisationForm.valid) {
      this.loading = true;

      try {
        // Sauvegarder les données de l'organisation temporairement
        const organizationData = {
          name: this.organisationForm.get('name')?.value,
          domaine: this.organisationForm.get('domaine')?.value
        };

        // Sauvegarder dans localStorage pour l'utiliser dans les étapes suivantes
        localStorage.setItem('organizationData', JSON.stringify(organizationData));

        this.loading = false;
        
        // Rediriger vers l'étape de branding
        this.router.navigate(['/auth/create-organisation/branding']);

      } catch (error) {
        console.error('Erreur lors de la sauvegarde des données ❌', error);
        this.loading = false;
      }
    }
  }

  onCancel() {
    // Retourner à la page de bienvenue
    this.router.navigate(['/auth/create-organisation']);
  }
}
