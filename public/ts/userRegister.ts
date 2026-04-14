(() => {

// ── DOM Elements ──────────────────────────────────────────
const submitBtnElem = document.getElementById('registerButton') as HTMLButtonElement;
const loadingSpinner = document.getElementById('loadingSpinner') as HTMLSpanElement;
const errorMsgElem = document.getElementById('error-msg') as HTMLParagraphElement;
const successMsgElem = document.getElementById('success-msg') as HTMLParagraphElement;
const form = document.getElementById('registerForm') as HTMLFormElement;
const nameInput = document.getElementById('name') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const confirmPasswordInput = document.getElementById('confirm_password') as HTMLInputElement;

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: unknown;
}

const showError = (msg: string): void => {
    errorMsgElem.textContent = msg;
    errorMsgElem.classList.remove('hidden');
    successMsgElem.classList.add('hidden');
};

const showSuccess = (msg: string): void => {
    successMsgElem.textContent = msg;
    successMsgElem.classList.remove('hidden');
    errorMsgElem.classList.add('hidden');
};

const clearMessages = (): void => {
    errorMsgElem.classList.add('hidden');
    successMsgElem.classList.add('hidden');
};

const setLoading = (loading: boolean): void => {
    submitBtnElem.disabled = loading;
    submitBtnElem.textContent = loading ? 'Please wait...' : (submitBtnElem.dataset.label ?? '');
    loadingSpinner.classList.toggle('hidden', !loading);
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

const getFormValues = (): RegisterPayload => ({
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
});

const validateForm = (payload: RegisterPayload): string | null => {
    if (!payload.name) return 'Full name is required';
    if (!payload.email) return 'Email is required';
    if (!payload.password) return 'Password is required';
    if (payload.password !== confirmPasswordInput.value) return 'Passwords do not match';
    if (payload.password.length < 8) return 'Password must be at least 8 characters';
    return null;
};

submitBtnElem.dataset.label = 'Register Now';

form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();
    clearMessages();

    const payload = getFormValues();

    const validationError = validateForm(payload);
    if (validationError) {
        showError(validationError);
        return;
    }

    setLoading(true);

    try {
        const result = await apiCall('/api/v1/user/register', payload);
        localStorage.setItem('user', JSON.stringify(result.data));
        showSuccess(result.message || 'Registered! Redirecting...');
        setTimeout(() => (window.location.href = '/users/verify'), 1500);

    } catch (error) {
        showError(error instanceof Error ? error.message : 'Registration failed. Try again.');
    } finally {
        setLoading(false);
    }
});

})();