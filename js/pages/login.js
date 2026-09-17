// View: Login / Registro
import { login, signUp } from '../auth.js';

export async function render(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-background flex items-center justify-center p-space-md">
      <div class="w-full max-w-md bg-surface-container-lowest border border-border-subtle rounded-2xl shadow-xl p-space-xl flex flex-col gap-space-lg">
        <!-- Header / Logo -->
        <div class="flex flex-col items-center text-center gap-space-xs">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1 shadow-xs">
            <span class="material-symbols-outlined text-[32px]">token</span>
          </div>
          <h1 class="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">CRSys M3000</h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant">CRM & Gestão Comercial para Agências Web</p>
        </div>

        <!-- Formulario Login -->
        <form id="auth-form" class="flex flex-col gap-space-md">
          <div class="flex flex-col gap-space-2xs">
            <label for="auth-email" class="font-label-xs text-label-xs font-semibold uppercase text-on-surface-variant">E-mail Corporativo</label>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">mail</span>
              <input type="email" id="auth-email" required placeholder="seu.nome@agencia.com" class="w-full h-10 pl-9 pr-space-md rounded-xl bg-surface-container-low border border-border-subtle text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all">
            </div>
          </div>

          <div class="flex flex-col gap-space-2xs">
            <label for="auth-password" class="font-label-xs text-label-xs font-semibold uppercase text-on-surface-variant">Senha de Acesso</label>
            <div class="relative flex items-center">
              <span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">lock</span>
              <input type="password" id="auth-password" required minlength="6" placeholder="••••••••" class="w-full h-10 pl-9 pr-space-md rounded-xl bg-surface-container-low border border-border-subtle text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all">
            </div>
          </div>

          <button type="submit" id="btn-submit-auth" class="mt-space-xs w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-space-xs cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">login</span>
            <span>Entrar na Plataforma</span>
          </button>
        </form>

        <!-- Toggle Modo (Criar Conta / Login) -->
        <div class="flex items-center justify-between pt-space-xs border-t border-border-subtle text-body-sm text-on-surface-variant">
          <span id="auth-toggle-label">Não tem uma conta?</span>
          <button type="button" id="btn-toggle-mode" class="font-semibold text-primary hover:underline cursor-pointer">
            Criar conta
          </button>
        </div>
      </div>
    </div>
  `;

  let isSignUpMode = false;
  const form = container.querySelector('#auth-form');
  const btnSubmit = container.querySelector('#btn-submit-auth');
  const btnToggle = container.querySelector('#btn-toggle-mode');
  const toggleLabel = container.querySelector('#auth-toggle-label');

  btnToggle.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    if (isSignUpMode) {
      btnSubmit.innerHTML = `<span class="material-symbols-outlined text-[20px]">person_add</span><span>Cadastrar Conta</span>`;
      toggleLabel.textContent = 'Já possui conta?';
      btnToggle.textContent = 'Fazer Login';
    } else {
      btnSubmit.innerHTML = `<span class="material-symbols-outlined text-[20px]">login</span><span>Entrar na Plataforma</span>`;
      toggleLabel.textContent = 'Não tem uma conta?';
      btnToggle.textContent = 'Criar conta';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#auth-email').value;
    const password = container.querySelector('#auth-password').value;

    btnSubmit.disabled = true;
    btnSubmit.classList.add('opacity-70');

    if (isSignUpMode) {
      const { user, error } = await signUp(email, password);
      if (user && !error) {
        // Redireciona para dashboard
        window.location.hash = '#/dashboard';
      }
    } else {
      const { session, error } = await login(email, password);
      if (session && !error) {
        window.location.hash = '#/dashboard';
      }
    }

    btnSubmit.disabled = false;
    btnSubmit.classList.remove('opacity-70');
  });
}
