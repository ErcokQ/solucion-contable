import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../ui/alert/services/alert.service';

@Component({
  standalone: true,
  selector: 'app-signup-form',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [ReactiveFormsModule],
})
export class SignupComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private alertSvc: AlertService,
  ) {
    this.form = this.fb.group({
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(120),
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(120)],
      ],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(60),
        ],
      ],
      productKey: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const dto = this.form.value as any;

    this.auth.signup(dto).subscribe({
      next: (res) => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.router.navigate(['/dashboard']);
      },
      error: (response) => {
        const msg = response?.error?.error || 'Error al registrarse';
        this.alertSvc.show(msg, 'error');
        console.error('Signup error:', response);
      },
    });
  }
}
