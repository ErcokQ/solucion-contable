import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../ui/alert/services/alert.service';

@Component({
  standalone: true,
  selector: 'app-signin-form',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  imports: [ReactiveFormsModule],
})
export class SigninComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private alertSvc: AlertService,
  ) {
    this.form = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const { login, password } = this.form.value as any;
    console.log('Form submitted:', this.form.value);
    this.auth.signin(login, password).subscribe({
      next: (res) => {
        this.alertSvc.show('Registro exitoso', 'success');
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.router.navigate(['/dashboard']);
      },
      error: (response) => {
        const msg = response?.error?.error || 'Credenciales inválidas';
        this.alertSvc.show(msg, 'error');
      },
    });
  }
}
