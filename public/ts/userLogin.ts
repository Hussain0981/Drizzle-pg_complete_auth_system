(() => {

// ── DOM Elements ──────────────────────────────────────────
const forgotBtn = document.getElementById('fogot-button') as HTMLButtonElement; 
const errorMsg = document.getElementById('error-msg') as HTMLParagraphElement;
const successMsg = document.getElementById('success-msg') as HTMLParagraphElement;
const submitBtn = document.getElementById('login-button') as HTMLButtonElement; 
const form = document.getElementById('loginForm') as HTMLFormElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;

// ── Null Guard ────────────────────────────────────────────
if (!forgotBtn || !errorMsg || !successMsg || !submitBtn || !form || !emailInput || !passwordInput) {
    console.error('Missing DOM elements:', { forgotBtn, errorMsg, successMsg, submitBtn, form, emailInput, passwordInput });
    throw new Error('Required DOM elements not found — check your HTML IDs');
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: unknown;
}

// ── Helpers ───────────────────────────────────────────────
const showError = (msg: string): void => {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
    successMsg.classList.add('hidden');
};

const showSuccess = (msg: string): void => {
    successMsg.textContent = msg;
    successMsg.classList.remove('hidden');
    errorMsg.classList.add('hidden');
};

const clearMessages = (): void => {
    errorMsg.classList.add('hidden');
    successMsg.classList.add('hidden');
};

const setLoading = (btn: HTMLButtonElement, loading: boolean): void => {
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait...' : (btn.dataset.label ?? '');
};

const apiCall = async (url: string, body: object): Promise<ApiResponse> => {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data: ApiResponse = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// ── Login ─────────────────────────────────────────────────
submitBtn.dataset.label = 'Sign In';

form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();
    clearMessages();

    const payload = {
        email: emailInput.value.trim(),
        password: passwordInput.value,
    };

    // validation before setLoading so button doesn't get stuck
    if (!payload.email || !payload.password) {
        showError('Please fill in all fields');
        return;
    }

    setLoading(submitBtn, true);

    try {
        const data = await apiCall('/api/v1/user/login', payload);

        // save user to localStorage for other pages
        localStorage.setItem('user', JSON.stringify(data.data));

        showSuccess(data.message || 'Login successful! Redirecting...');
        setTimeout(() => (window.location.href = '/'), 1500);

    } catch (error) {
        showError(error instanceof Error ? error.message : 'Login failed. Try again.');
    } finally {
        setLoading(submitBtn, false);
    }
});

// ── Forgot Password ───────────────────────────────────────
forgotBtn.dataset.label = 'Forgot password?';

forgotBtn.addEventListener('click', async (): Promise<void> => {
    clearMessages();

    // get email from input directly, not from localStorage
    const email = emailInput.value.trim();

    if (!email) {
        showError('Please enter your email address first');
        return;
    }

    setLoading(forgotBtn, true);

    try {
        const data = await apiCall('/api/v1/user/forgot-password', { email });
        showSuccess(data.message || 'OTP sent! Please check your email.');

    } catch (error) {
        showError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
        setLoading(forgotBtn, false);
    }
});

})();