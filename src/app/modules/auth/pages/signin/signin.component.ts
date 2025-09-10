import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SigninFormComponent } from '../../components/signin-form/signin-form.component';
import {
  AuthService,
  SignInCredentials,
} from '../../../../core/services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, SigninFormComponent],
  template: `
    <div
    class="min-h-screen bg-gray-50 flex flex-col items-center  px-4 sm:px-6 lg:px-8"
    >
    <div class="flex items-center  justify-between w-full py-4">
    <img src="assets/images/logo.svg" class="self-start" alt="Logo" width="150" height="150">
    </div>
      <main
      class="h-full flex-1 flex flex-col items-center justify-center"
      >
        <div
          class="relative max-w-md lg:max-w-lg shadow-lg w-full bg-white p-10 rounded-lg animate-fade-in"
        >
          <div class="text-center">
            <h1 class="text-4xl font-semibold text-slate-800 mb-2">Se connecter</h1>
          </div>

          <div class="rounded-2xl  p-8 ">
            <div class="text-center mb-8">
              <p class="text-gray-700">
                Entrez dans votre espace de travail et rejoignez vos coéquipiers.
              </p>
            </div>

            <app-signin-form
              #signinForm
              (formSubmit)="handleSignIn($event)"
            ></app-signin-form>

            <div class="text-center mt-6">
              <p class="text-slate-800">
                Nouveau sur notre plateforme ?
                <a
                  href="/auth/signup/"
                  class="text-purple-800 hover:text-purple-400 font-medium transition-colors"
                >
                  Cree un compte
                </a>
              </p>
            </div>
          </div>

        </div>
      </main>
      <div class="text-center py-4">
        <p class="text-slate-500 text-sm">
          &copy; 2025 Cynoia. All rights reserved.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fade-in {
        animation: fade-in 0.6s ease-out;
      }
    `,
  ],
})
export class SigninComponent implements OnInit {
  @ViewChild('signinForm') signinFormComponent!: SigninFormComponent;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  handleSignIn(credentials: SignInCredentials): void {
    this.authService.signIn(credentials).subscribe({
      next: () => {
        this.signinFormComponent.setLoading(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.signinFormComponent.setLoading(false);
        console.error('Sign in error:', error);
      },
    });
  }
}
