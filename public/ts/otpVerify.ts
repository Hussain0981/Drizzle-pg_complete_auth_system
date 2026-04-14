(() => {

// ── DOM Elements ──────────────────────────────────────────
const container = document.getElementById('otpContainer') as HTMLDivElement;
const resendOtpBtn = document.getElementById('resendOtpBtn') as HTMLButtonElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
const emailElem = document.getElementById('emailElem') as HTMLElement;
const errorMsg = document.getElementById('error-msg') as HTMLParagraphElement;
const successMsg = document.getElementById('success-msg') as HTMLParagraphElement;
const form = document.getElementById('otpForm') as HTMLFormElement;
const timingElem = document.getElementById('timing') as HTMLDivElement;

interface UserData {
    id: number;
    email: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: unknown;
}

const RESEND_COOLDOWN = 60;
let timerInterval: ReturnType<typeof setInterval> | null = null;

const startResendTimer = (): void => {
    let seconds = RESEND_COOLDOWN;
    resendOtpBtn.disabled = true;
    resendOtpBtn.classList.add('cursor-not-allowed');
    timingElem.textContent = `Resend OTP in ${seconds}s`;

    timerInterval = setInterval(() => {
        seconds--;
        timingElem.textContent = `Resend OTP in ${seconds}s`;

        if (seconds <= 0) {
            clearInterval(timerInterval!);
            timerInterval = null;
            resendOtpBtn.disabled = false;
            resendOtpBtn.classList.remove('cursor-not-allowed');
            timingElem.textContent = '';
        }
    }, 1000);
};

startResendTimer();

const userData: UserData | null = JSON.parse(localStorage.getItem('user') ?? 'null');
const userId = userData?.id;
const userEmail: string = userData?.email ?? emailElem.textContent?.trim() ?? '';

const OTP_LENGTH = 5 as const;
const inputs: HTMLInputElement[] = [];

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

const getOtpValue = (): string => inputs.map(el => el.value).join('');

const clearOtpInputs = (): void => {
    inputs.forEach(input => (input.value = ''));
    inputs[0]?.focus();
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

for (let i = 0; i < OTP_LENGTH; i++) {
    const input = document.createElement('input');

    Object.assign(input, {
        type: 'text',
        maxLength: 1,
        placeholder: '•',
        inputMode: 'numeric',
        className: 'w-14 h-16 text-2xl text-center font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all',
    });

    input.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        target.value = target.value.replace(/\D/g, '');
        if (target.value && i < OTP_LENGTH - 1) inputs[i + 1].focus();
    });

    input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Backspace' && !input.value && i > 0) {
            inputs[i - 1].focus();
        }
    });

    input.addEventListener('paste', (e: ClipboardEvent) => {
        e.preventDefault();
        const chars = e.clipboardData
            ?.getData('text')
            .trim()
            .slice(0, OTP_LENGTH)
            .split('') ?? [];

        chars.forEach((char, index) => {
            if (inputs[index]) {
                inputs[index].value = char;
                if (index < OTP_LENGTH - 1) inputs[index + 1].focus();
            }
        });
    });

    container.appendChild(input);
    inputs.push(input);
}

submitBtn.dataset.label = 'Verify Code';

// verify otp
form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();
    clearMessages();

    const otpValue = getOtpValue();

    if (otpValue.length < OTP_LENGTH) {
        showError('Please fill all OTP fields');
        return;
    }

    setLoading(submitBtn, true);

    try {
        const data = await apiCall('/api/v1/user/verify', {
            id: userId,
            otp: otpValue,
        });

        showSuccess(data.message || 'Account verified! Redirecting...');
        setTimeout(() => (window.location.href = '/users/login'), 1500);

    } catch (error) {
        showError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
        setLoading(submitBtn, false);
    }
});

// resend
resendOtpBtn.dataset.label = 'Resend OTP';

resendOtpBtn.addEventListener('click', async (): Promise<void> => {
    clearMessages();
    setLoading(resendOtpBtn, true);

    try {
        const data = await apiCall('/api/v1/user/resend-otp', {
            id: userId,
            email: userEmail,
        });

        clearOtpInputs();
        showSuccess(data.message || 'OTP resent! Please check your email.');
        startResendTimer();

    } catch (error) {
        showError(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
        setLoading(resendOtpBtn, false);
    }
});

})();