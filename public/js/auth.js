// Definición de roles (debe estar al inicio del archivo)
const ROLES = {
    ADMIN: '66532a1e3fc6ae1234567890',
    USER: '66532a1e3fc6ae1234567891'
};

// Configuración de rutas
const APP_ROUTES = {
    PUBLIC: ['/', '/index.html'],
    ADMIN: {
        DASHBOARD: '/admin/dashboardAdmin.html'
    },
    USER: {
        DASHBOARD: '/user/dashboardUser.html'
    }
};

// Mostrar mensajes
function showMessage(type, text, elementId = 'message') {
    const messageDiv = document.getElementById(elementId);
    if (!messageDiv) return;

    messageDiv.textContent = text;
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type}`;
    messageDiv.style.display = 'block';

    if (type !== 'error') {
        setTimeout(() => messageDiv.style.display = 'none', 3000);
    }
}

// Normalización de rutas mejorada
function normalizePath(path) {
    return path.toLowerCase()
        .replace(/(\/index|\.html)$/, '')
        .replace(/\/$/, '') || '/';
}

// Verificar si la ruta es pública
function isPublicPath(path) {
    return APP_ROUTES.PUBLIC.some(publicPath => 
        normalizePath(publicPath) === normalizePath(path)
    );
}

// Verificar sesión y redirigir
function verifyAndRedirect() {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const currentPath = normalizePath(window.location.pathname);
    
    console.log('Usuario:', user);
    console.log('Ruta actual:', currentPath);

    // Si no está logueado y accede a ruta privada
    if (!user && !isPublicPath(currentPath)) {
        console.log('Redirigiendo a index.html (no autenticado)');
        window.location.href = '/index.html';
        return;
    }

    // Si está logueado
    if (user) {
        const isAdmin = user.rol_id === ROLES.ADMIN;
        console.log(`Usuario autenticado. Rol: ${isAdmin ? 'Admin' : 'User'}`);

        // Redirigir según el rol
        if (isPublicPath(currentPath)) {
            const target = isAdmin ? APP_ROUTES.ADMIN.DASHBOARD : APP_ROUTES.USER.DASHBOARD;
            console.log(`Redirigiendo a dashboard correspondiente: ${target}`);
            window.location.href = target;
            return;
        }

        // Verificar acceso correcto según rol
        const shouldBeInAdmin = isAdmin && !currentPath.includes('/admin');
        const shouldBeInUser = !isAdmin && !currentPath.includes('/user');
        
        if (shouldBeInAdmin || shouldBeInUser) {
            const target = isAdmin ? APP_ROUTES.ADMIN.DASHBOARD : APP_ROUTES.USER.DASHBOARD;
            console.log(`Corrigiendo ruta: redirigiendo a ${target}`);
            window.location.href = target;
        }
    }
}

// Manejo de login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
        return showMessage('error', 'Por favor complete todos los campos');
    }

    try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, contrasena: password })
        });

        const data = await response.json();

        if (!response.ok) {
            return showMessage('error', data.message || 'Credenciales incorrectas');
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        showMessage('success', 'Inicio de sesión exitoso');
        
        // Redirección directa sin verificación
        const isAdmin = data.user.rol_id === ROLES.ADMIN;
        setTimeout(() => {
            window.location.href = isAdmin ? APP_ROUTES.ADMIN.DASHBOARD : APP_ROUTES.USER.DASHBOARD;
        }, 1000);
    } catch (err) {
        console.error('Login error:', err);
        showMessage('error', 'Error de conexión con el servidor');
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Solo verificar si estamos en una página de la aplicación
    if (document.getElementById('loginForm') || document.getElementById('userInfo')) {
        verifyAndRedirect();
        
        // Configurar eventos
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.addEventListener('submit', handleLogin);

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = '/index.html';
        });

        // Mostrar info de usuario en dashboards
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) userInfo.textContent = `Bienvenido, ${user.nombre}`;
        }
    }
});