
const form = document.getElementById('registerForm') as HTMLFormElement;
const errorMsg = document.getElementById('error-msg') as HTMLElement;
const nameValue = document.querySelector('#name') as HTMLInputElement;
const email = document.querySelector('#email') as HTMLInputElement;
const password = document.querySelector('#password') as HTMLInputElement;
const confirm_password = document.querySelector('#confirm_password') as HTMLInputElement;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');

    // Client-side Validation: Password Match
    if (password.value !== confirm_password.value) {
        errorMsg.innerText = "Passwords do not match!";
        errorMsg.classList.remove('hidden');
        return;
    }
    const formValue = {
        name: nameValue.value,
        email: email.value,
        password: password.value
    }

    //  Submit Logic
    try {
        const response = await fetch('/api/v1/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formValue)
        });

        const result = await response.json();

        if (response.ok) {
            const { email } = result.data;
            window.location.href = `/verify?email=${encodeURIComponent(email)}`;
        } else {
            errorMsg.innerText = result.message || "Registration failed.";
            errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        console.error(err);
        errorMsg.innerText = "Connection error. Try again.";
        errorMsg.classList.remove('hidden');
    }
});