// ===== TrustShare Auth Module =====

const Auth = {
  // ===== Login =====
  showLogin() {
    Router.navigate('auth');
    setTimeout(() => this.renderLoginForm(), 50);
  },

  renderLoginForm() {
    const container = document.getElementById('auth-form-area');
    if (!container) return;

    container.innerHTML = `
      <div class="auth-title">Welcome back</div>
      <div class="auth-subtitle">Sign in to your TrustShare account</div>

      <div class="oauth-buttons mb-4">
        <button class="oauth-btn" onclick="Auth.oauthLogin('google')">
          <span class="oauth-icon">🌐</span> Google
        </button>
        <button class="oauth-btn" onclick="Auth.oauthLogin('microsoft')">
          <span class="oauth-icon">🪟</span> Microsoft
        </button>
        <button class="oauth-btn" onclick="Auth.oauthLogin('github')">
          <span class="oauth-icon">🐙</span> GitHub
        </button>
      </div>

      <div class="divider mb-4"><span>or sign in with email</span></div>

      <form class="auth-form" onsubmit="Auth.handleLogin(event)">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-group">
            <span class="input-icon">✉️</span>
            <input id="login-email" type="email" class="form-input" placeholder="surya@trustshare.io" value="surya@trustshare.io" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" style="display:flex;justify-content:space-between;">
            <span>Password</span>
            <span class="auth-link" onclick="Auth.showForgotPassword()">Forgot password?</span>
          </label>
          <div class="input-group">
            <span class="input-icon">🔒</span>
            <input id="login-password" type="password" class="form-input" placeholder="••••••••" value="SecurePass123!" required>
            <span class="input-icon-right" onclick="Auth.togglePasswordVisibility('login-password', this)">👁️</span>
          </div>
        </div>
        <label class="toggle-switch" style="font-size:0.875rem;color:var(--text-secondary);">
          <input type="checkbox" class="toggle-input" id="remember-me">
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          Remember me for 30 days
        </label>
        <button type="submit" class="btn btn-primary w-full btn-lg" id="login-btn">
          <span>Sign In Securely</span>
          <span>🔐</span>
        </button>
      </form>

      <div class="auth-footer">
        Don't have an account? <span class="auth-link" onclick="Auth.showRegister()">Create account</span>
      </div>
    `;
  },

  handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    if (!email || !password) {
      Notifications.error('Missing Fields', 'Please enter your email and password.');
      return;
    }

    // Show loading
    btn.innerHTML = '<span class="animate-spin">⟳</span> Signing in...';
    btn.disabled = true;

    setTimeout(() => {
      // Simulate auth check
      const user = TS.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user || email) {
        const targetUser = user || TS.users[0];
        if (targetUser.mfaEnabled) {
          this.showMFA(targetUser);
        } else {
          this.completeLogin(targetUser);
        }
      } else {
        btn.innerHTML = '<span>Sign In Securely</span><span>🔐</span>';
        btn.disabled = false;
        Notifications.error('Login Failed', 'Invalid email or password. Please try again.');
      }
    }, 1200);
  },

  showMFA(user) {
    const container = document.getElementById('auth-form-area');
    container.innerHTML = `
      <div class="text-center mb-4">
        <div style="font-size:3rem;margin-bottom:16px;">📱</div>
        <div class="auth-title" style="font-size:1.5rem;">Two-Factor Auth</div>
        <div class="auth-subtitle">Enter the 6-digit code from your authenticator app</div>
        <div style="font-size:0.8125rem;color:var(--blue-400);margin-top:8px;">
          Sending to: ${user.email}
        </div>
      </div>
      <div class="mfa-code-inputs mb-4" id="mfa-inputs">
        <input type="text" maxlength="1" class="mfa-digit" oninput="Auth.mfaInput(this, 0)">
        <input type="text" maxlength="1" class="mfa-digit" oninput="Auth.mfaInput(this, 1)">
        <input type="text" maxlength="1" class="mfa-digit" oninput="Auth.mfaInput(this, 2)">
        <input type="text" maxlength="1" class="mfa-digit" oninput="Auth.mfaInput(this, 3)">
        <input type="text" maxlength="1" class="mfa-digit" oninput="Auth.mfaInput(this, 4)">
        <input type="text" maxlength="1" class="mfa-digit" oninput="Auth.mfaInput(this, 5)">
      </div>
      <button class="btn btn-primary w-full btn-lg" onclick="Auth.verifyMFA('${user.id}')">
        <span>Verify & Sign In</span> <span>✅</span>
      </button>
      <div class="auth-footer">
        <span class="auth-link" onclick="Auth.showLogin()">← Back to login</span>
        &nbsp;·&nbsp;
        <span class="auth-link" onclick="Auth.resendMFA()">Resend code</span>
      </div>
      <div style="text-align:center;margin-top:12px;font-size:0.8125rem;color:var(--text-muted);">
        Demo hint: Enter any 6 digits (e.g. 1 2 3 4 5 6)
      </div>
    `;
    const inputs = container.querySelectorAll('.mfa-digit');
    inputs[0].focus();
    this._pendingMFAUser = user;
  },

  mfaInput(el, index) {
    const inputs = document.querySelectorAll('.mfa-digit');
    el.classList.toggle('filled', el.value !== '');
    if (el.value && index < 5) {
      inputs[index + 1].focus();
    }
    // Auto-verify when all 6 filled
    const allFilled = Array.from(inputs).every(i => i.value !== '');
    if (allFilled && this._pendingMFAUser) {
      setTimeout(() => this.verifyMFA(this._pendingMFAUser.id), 200);
    }
  },

  verifyMFA(userId) {
    const inputs = document.querySelectorAll('.mfa-digit');
    const code = Array.from(inputs).map(i => i.value).join('');
    if (code.length < 6) {
      Notifications.warning('Incomplete Code', 'Please enter all 6 digits.');
      return;
    }
    const user = TS.users.find(u => u.id === userId) || TS.users[0];

    // Show loading on all inputs
    inputs.forEach(i => { i.disabled = true; i.style.borderColor = 'var(--blue-500)'; });

    setTimeout(() => {
      this.completeLogin(user);
    }, 800);
  },

  completeLogin(user) {
    TS.state.currentUser = user;
    Notifications.success('Welcome back!', `Signed in as ${user.name}. Session secured with AES-256.`);
    setTimeout(() => Router.navigate('dashboard'), 300);
  },

  oauthLogin(provider) {
    const btn = document.querySelector(`.oauth-btn[onclick*="${provider}"]`);
    if (btn) { btn.innerHTML = `<span class="animate-spin">⟳</span> Connecting...`; btn.disabled = true; }

    setTimeout(() => {
      Notifications.info('OAuth Redirect', `Redirecting to ${provider} authentication...`);
      setTimeout(() => this.completeLogin(TS.users[0]), 1500);
    }, 800);
  },

  // ===== Register =====
  showRegister() {
    const container = document.getElementById('auth-form-area');
    container.innerHTML = `
      <div class="auth-title">Create Account</div>
      <div class="auth-subtitle">Join TrustShare — secure file sharing for teams</div>

      <form class="auth-form" onsubmit="Auth.handleRegister(event)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input id="reg-fname" type="text" class="form-input" placeholder="Surya" required>
          </div>
          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input id="reg-lname" type="text" class="form-input" placeholder="Venkatesh" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Work Email</label>
          <div class="input-group">
            <span class="input-icon">✉️</span>
            <input id="reg-email" type="email" class="form-input" placeholder="you@company.com" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="input-group">
            <span class="input-icon">🔒</span>
            <input id="reg-password" type="password" class="form-input" placeholder="Create a strong password" oninput="Auth.checkPasswordStrength(this.value)" required>
            <span class="input-icon-right" onclick="Auth.togglePasswordVisibility('reg-password', this)">👁️</span>
          </div>
          <div class="password-strength-meter" id="strength-bars">
            <div class="strength-bar" id="sb1"></div>
            <div class="strength-bar" id="sb2"></div>
            <div class="strength-bar" id="sb3"></div>
            <div class="strength-bar" id="sb4"></div>
          </div>
          <div class="strength-text" id="strength-text">Enter a password</div>
        </div>
        <div class="form-group">
          <label class="form-label">Organization (Optional)</label>
          <div class="input-group">
            <span class="input-icon">🏢</span>
            <input id="reg-org" type="text" class="form-input" placeholder="Acme Corp">
          </div>
        </div>
        <label style="display:flex;align-items:flex-start;gap:10px;font-size:0.8125rem;color:var(--text-secondary);cursor:pointer;">
          <input type="checkbox" id="reg-terms" style="margin-top:2px;" required>
          I agree to the <span class="auth-link" style="margin:0 4px;">Terms of Service</span> and <span class="auth-link" style="margin-left:4px;">Privacy Policy</span>
        </label>
        <button type="submit" class="btn btn-primary w-full btn-lg" id="reg-btn">
          <span>Create Secure Account</span> <span>🚀</span>
        </button>
      </form>

      <div class="auth-footer">
        Already have an account? <span class="auth-link" onclick="Auth.showLogin()">Sign in</span>
      </div>
    `;
  },

  handleRegister(e) {
    e.preventDefault();
    const fname = document.getElementById('reg-fname').value;
    const lname = document.getElementById('reg-lname').value;
    const email = document.getElementById('reg-email').value;
    const btn = document.getElementById('reg-btn');

    btn.innerHTML = '<span class="animate-spin">⟳</span> Creating account...';
    btn.disabled = true;

    setTimeout(() => {
      const newUser = {
        id: `u${Date.now()}`,
        name: `${fname} ${lname}`,
        email: email,
        role: 'Member',
        avatar: `${fname[0]}${lname[0]}`.toUpperCase(),
        avatarColor: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
        plan: 'Free',
        storageUsed: 0,
        storageTotal: 5,
        mfaEnabled: false,
        lastLogin: new Date().toISOString(),
        status: 'online',
        filesShared: 0,
        filesOwned: 0,
      };
      TS.users.push(newUser);
      TS.state.currentUser = newUser;
      Notifications.success('Account Created!', `Welcome, ${fname}! Your account is encrypted and ready.`);
      setTimeout(() => Router.navigate('dashboard'), 300);
    }, 1500);
  },

  checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const bars = ['sb1', 'sb2', 'sb3', 'sb4'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const classes = ['', 'weak', 'fair', 'strong', 'strong'];
    const colors = ['', 'var(--rose-500)', 'var(--amber-500)', 'var(--blue-500)', 'var(--emerald-500)'];

    bars.forEach((id, i) => {
      const bar = document.getElementById(id);
      if (!bar) return;
      bar.className = 'strength-bar';
      if (i < strength) bar.classList.add(classes[strength]);
    });

    const text = document.getElementById('strength-text');
    if (text) {
      text.textContent = password ? labels[strength] || 'Weak' : 'Enter a password';
      text.style.color = colors[strength] || 'var(--text-muted)';
    }
  },

  showForgotPassword() {
    const container = document.getElementById('auth-form-area');
    container.innerHTML = `
      <div class="text-center mb-4">
        <div style="font-size:3rem;margin-bottom:16px;">🔑</div>
        <div class="auth-title" style="font-size:1.5rem;">Reset Password</div>
        <div class="auth-subtitle">We'll send a secure reset link to your email</div>
      </div>
      <form class="auth-form" onsubmit="Auth.handleForgotPassword(event)">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-group">
            <span class="input-icon">✉️</span>
            <input id="forgot-email" type="email" class="form-input" placeholder="your@email.com" required>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-full btn-lg" id="forgot-btn">
          <span>Send Reset Link</span> <span>📧</span>
        </button>
      </form>
      <div class="auth-footer">
        <span class="auth-link" onclick="Auth.showLogin()">← Back to login</span>
      </div>
    `;
  },

  handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const btn = document.getElementById('forgot-btn');
    btn.innerHTML = '<span class="animate-spin">⟳</span> Sending...';
    btn.disabled = true;

    setTimeout(() => {
      document.getElementById('auth-form-area').innerHTML = `
        <div class="text-center">
          <div style="font-size:4rem;margin-bottom:20px;animation:float 3s ease-in-out infinite;">📬</div>
          <div class="auth-title" style="font-size:1.5rem;">Check Your Email</div>
          <div class="auth-subtitle">A secure reset link was sent to <strong style="color:var(--blue-400);">${email}</strong>. Link expires in 15 minutes.</div>
          <button class="btn btn-secondary w-full mt-4" onclick="Auth.showLogin()">Back to Sign In</button>
        </div>
      `;
    }, 1200);
  },

  togglePasswordVisibility(inputId, icon) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = '🙈';
    } else {
      input.type = 'password';
      icon.textContent = '👁️';
    }
  },

  resendMFA() {
    Notifications.info('Code Resent', 'A new verification code has been sent to your device.');
  },

  logout() {
    TS.state.currentUser = null;
    Notifications.info('Signed Out', 'Your session has been securely terminated.');
    setTimeout(() => Router.navigate('landing'), 200);
    // Close any open dropdowns
    document.getElementById('user-dropdown')?.classList.add('hidden');
  },
};

window.Auth = Auth;
