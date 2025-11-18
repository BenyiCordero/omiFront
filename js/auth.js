// js/index.js
import { displayError, clearError, displayMessage, clearMessage } from './utils.js';


const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const logoutButton = document.getElementById('logout-button');
const showLoginLink = document.getElementById('show-login');

const authError = document.getElementById('auth-error');
const authMessage = document.getElementById('auth-message');

const BASE_API_URL = 'http://127.0.0.1:8081'; 
const LOGIN_API_URL = `${BASE_API_URL}/auth/login`;
const REGISTER_API_URL = `${BASE_API_URL}/auth/register`;

let accessToken = null;

function checkAuthStatus() {
    console.log('--- checkAuthStatus called ---');
    console.log('Current path:', window.location.pathname);
    const authToken = localStorage.getItem('authToken');
    console.log('authToken:', authToken ? 'exists' : 'does not exist');


    const isOnLoginPage = window.location.pathname.includes('index.html');
    const isOnRegisterPage = window.location.pathname.includes('register.html');
    console.log('Is on login page:', isOnLoginPage);

    if (authToken) {
        console.log('User is authenticated.');
        if (isOnLoginPage) {
            console.log('On login page with token. Redirecting to dashboard.html');
            window.location.href = 'dashboard.html';
        } else {
            console.log('On dashboard page with token. Staying here.');
        }
    } else {
        console.log('User is NOT authenticated.');
        if (!isOnLoginPage && !isOnRegisterPage) {
            console.log('Not on login page without token. Redirecting to index.html');
            window.location.href = 'index.html';
        } else {
            console.log('On login page without token. Staying here.');
        }
    }
    console.log('--- checkAuthStatus end ---');
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        if (authError) clearError(authError);
        if (authMessage) clearMessage(authMessage);

        try {
            console.log('Intentando iniciar sesión con:', { username, password });
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ email: username, password }),
            });

            let responseData; 

            const clonedResponse = response.clone(); 

            try {
                responseData = await clonedResponse.json();
            } catch (jsonError) {
                console.warn('Failed to parse response as JSON. Status:', response.status, 'Error:', jsonError);
                if (!response.ok) { 
                    try {
                        const textError = await response.text(); 
                        console.warn('Error response body (text):', textError);
                    } catch (textReadError) {
                        console.warn('Also failed to read response body as text:', textReadError);
                    }
                }
                responseData = {}; 
            }

            console.log('Respuesta de la API de login:', responseData);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
                } else if (response.status === 400) {
                    throw new Error(responseData.message || 'Solicitud incorrecta. Verifica tus datos.');
                } else {
                    throw new Error(responseData.message || `Credenciales invalidas`);
                }
            }

            if (responseData.access_token) {
                localStorage.setItem('authToken', responseData.access_token);
                if (authMessage) displayMessage(authMessage, '¡Inicio de sesión exitoso!');
                console.log('Login successful. Redirecting to dashboard.html');
                window.location.href = 'dashboard.html';
            } else {
                if (authError) displayError(authError, 'Respuesta de API inesperada: no se recibió access_token.');
            }

        } catch (error) {
            console.error('Error durante el inicio de sesión:', error);
            if (authError) displayError(authError, error.message || 'Error al conectar con el servidor. Por favor, verifica la URL de la API y la consola para más detalles.');
        }
    });
}

if(registerForm){
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombre = registerForm.nombre.value;
        const primerApe = registerForm.primerApe.value;
        const segundoApe = registerForm.segundoApe.value;
        const telefono = registerForm.telefono.value;
        const email = registerForm.email.value;
        const password = registerForm.password.value;
        const rol = "ROLE_TRABAJADOR";

        if (authError) clearError(authError);
        if (authMessage) clearMessage(authMessage);

        try {
            console.log('Registrandose con:', { nombre, primerApe, segundoApe, telefono, email, password });
            const response = await fetch(REGISTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ nombre: nombre, primerApellido: primerApe, segundoApellido: segundoApe, numeroTelefono: telefono, rol, email, password, horasSemana: 0, salario: 0 }),
            });

            let responseData; 

            const clonedResponse = response.clone(); 

            try {
                responseData = await clonedResponse.json();
            } catch (jsonError) {
                console.warn('Failed to parse response as JSON. Status:', response.status, 'Error:', jsonError);
                if (!response.ok) { 
                    try {
                        const textError = await response.text(); 
                        console.warn('Error response body (text):', textError);
                    } catch (textReadError) {
                        console.warn('Also failed to read response body as text:', textReadError);
                    }
                }
                responseData = {}; 
            }

            console.log('Respuesta de la API de login:', responseData);

            if (responseData.access_token) {
                localStorage.setItem('authToken', responseData.access_token);
                if (authMessage) displayMessage(authMessage, 'Registro de sesión exitoso!');
                console.log('Login successful. Redirecting to dashboard.html');
                window.location.href = 'dashboard.html';
            } else {
                if (authError) displayError(authError, 'Respuesta de API inesperada: no se recibió access_token.');
            }

        } catch (error) {
            console.error('Error durante el registro:', error);
            if (authError) displayError(authError, error.message || 'Error al conectar con el servidor. Por favor, verifica la URL de la API y la consola para más detalles.');
        }
    })
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        console.log('Logout button clicked. Removing token and redirecting to login.html');
        localStorage.removeItem('authToken'); 
        window.location.href = 'index.html'; 
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', (event) => {
        event.preventDefault();
        showLoginView();
    });
}

document.addEventListener('DOMContentLoaded', checkAuthStatus);