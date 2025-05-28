document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión y rol
    checkAdminAccess();
    
    // Cargar datos del dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        loadAdminDashboard();
    }
    
    // Cargar lista de usuarios
    if (window.location.pathname.includes('usuarios.html')) {
        loadUsers();
        setupUserForm();
    }
    
    // Configurar logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function checkAdminAccess() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = '/';
        return;
    }
    
    // Aquí debes comparar con el ID real de tu rol de admin
    const adminRoleId = 'ID_DEL_ROL_ADMIN_EN_TU_DB'; // Reemplaza esto
    
    if (user.rol_id !== adminRoleId) {
        window.location.href = '/user/dashboard.html';
    }
}

async function loadAdminDashboard() {
    try {
        const token = localStorage.getItem('token');
        
        // Cargar estadísticas
        const statsResponse = await fetch('/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            document.getElementById('totalUsers').textContent = stats.totalUsers;
            document.getElementById('todayTransactions').textContent = stats.todayTransactions;
            document.getElementById('totalBalance').textContent = `$${stats.totalBalance.toLocaleString()}`;
        }
        
        // Cargar transacciones recientes
        const transactionsResponse = await fetch('/api/admin/transactions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (transactionsResponse.ok) {
            const transactions = await transactionsResponse.json();
            const tableBody = document.getElementById('transactionsTable');
            tableBody.innerHTML = '';
            
            transactions.forEach(txn => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${txn._id}</td>
                    <td>${txn.userName}</td>
                    <td>${txn.type}</td>
                    <td>$${txn.amount.toFixed(2)}</td>
                    <td>${new Date(txn.date).toLocaleString()}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            const tableBody = document.getElementById('usersTable');
            tableBody.innerHTML = '';
            
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user._id}</td>
                    <td>${user.nombre}</td>
                    <td>${user.email}</td>
                    <td>${user.rol_id === 'ID_DEL_ROL_ADMIN_EN_TU_DB' ? 'Administrador' : 'Usuario'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning me-2 edit-user" data-id="${user._id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-user" data-id="${user._id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Configurar eventos para botones de editar/eliminar
            document.querySelectorAll('.edit-user').forEach(btn => {
                btn.addEventListener('click', () => editUser(btn.dataset.id));
            });
            
            document.querySelectorAll('.delete-user').forEach(btn => {
                btn.addEventListener('click', () => deleteUser(btn.dataset.id));
            });
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

function setupUserForm() {
    const saveBtn = document.getElementById('saveUserBtn');
    saveBtn.addEventListener('click', saveUser);
}

async function saveUser() {
    try {
        const token = localStorage.getItem('token');
        const userId = document.getElementById('userId').value;
        const formData = {
            nombre: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            rol_id: document.getElementById('userRole').value
        };
        
        const password = document.getElementById('userPassword').value;
        if (password) formData.contrasena = password;
        
        const url = userId ? `/api/admin/users/${userId}` : '/api/admin/users';
        const method = userId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            loadUsers();
            bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
        } else {
            const error = await response.json();
            alert(error.mensaje || 'Error guardando usuario');
        }
    } catch (error) {
        console.error('Error guardando usuario:', error);
    }
}

async function editUser(userId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            
            document.getElementById('modalTitle').textContent = 'Editar Usuario';
            document.getElementById('userId').value = user._id;
            document.getElementById('userName').value = user.nombre;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.rol_id;
            document.getElementById('userPassword').value = '';
            
            const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error editando usuario:', error);
    }
}

async function deleteUser(userId) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            loadUsers();
        } else {
            const error = await response.json();
            alert(error.mensaje || 'Error eliminando usuario');
        }
    } catch (error) {
        console.error('Error eliminando usuario:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}