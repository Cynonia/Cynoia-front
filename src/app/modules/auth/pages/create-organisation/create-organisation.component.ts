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
import { BrandingService } from '../../../../core/services/branding.service';
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
  cloudName = 'dorovcxxj';
  uploadPreset = 'cynoia';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private organisationService: OrganisationService,
    private brandingService: BrandingService,
    private router: Router
  ) {
    this.organisationForm = this.fb.group({
      name: ['', [Validators.required]],
      logo: [null],
      couleur: ['', [Validators.required]],
      avatar: [null],
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

  onFileChange(event: Event, fieldName: 'logo' | 'avatar') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log(`📁 File selected for ${fieldName}:`, file);
      this.organisationForm.get(fieldName)?.setValue(file);
    } else {
      this.organisationForm.get(fieldName)?.setValue(null);
    }
  }

  uploadToCloudinary(file: File): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return fetch(url, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.secure_url) {
          return data.secure_url;
        } else {
          throw new Error('Cloudinary upload failed');
        }
      });
  }

  logout(): void {
    this.authService.signOut();
    console.log("deconn");
    
  }

  async onSubmit() {
    if (this.organisationForm.valid) {
      this.loading = true;

      try {
        // Get the current user snapshot from observable
        const currentUser = await firstValueFrom(this.currentUser$);

        if (!currentUser || !currentUser.id) {
          throw new Error('Utilisateur non connecté');
        }

        const logoFile = this.organisationForm.get('logo')?.value;
        const avatarFile = this.organisationForm.get('avatar')?.value;

        const logoUrl = logoFile
          ? await this.uploadToCloudinary(logoFile)
          : '';
        const avatarUrl = avatarFile
          ? await this.uploadToCloudinary(avatarFile)
          : '';

        const formData = {
          name: this.organisationForm.get('name')?.value,
          logo: logoUrl,
          couleur: this.organisationForm.get('couleur')?.value,
          avatar: avatarUrl,
          domaine: this.organisationForm.get('domaine')?.value,
          userId: currentUser.id,  // Use the snapshot userId here
        };

        // Create organisation and wait for response, then update branding before navigating
        try {
          const resp = await firstValueFrom(this.organisationService.createOrganisation(formData));
          const org = resp?.data as any;
          console.log('Organisation créée ✅', org);

          // Update branding immediately so dashboard shows new logo/colors
          if (org) {
            this.brandingService.updateOrganization({
              name: org.name,
              logo: org.logo,
              primaryColor: org.couleur || org.primaryColor,
              hasCustomBranding: true
            });
            this.brandingService.applyCssVariables();
          }

          this.loading = false;
          this.router.navigate(['']);
        } catch (err) {
          console.error("Erreur lors de l'envoi ❌", err);
          this.loading = false;
        }
      } catch (error) {
        console.error('Erreur de Cloudinary ou utilisateur non connecté ❌', error);
        this.loading = false;
      }
    }
  }

  onCancel() {
    // Add navigation logic here
  }
}
