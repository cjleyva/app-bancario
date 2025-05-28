// ===========================================
// 1. VARIABLES GLOBALES Y ESTADO DE LA APLICACIÓN
// ===========================================
let currentUser = null;
let currentAccount = null;

// ===========================================
// 2. FUNCIONES PARA INTERACTUAR CON LA API
// ===========================================
/**
 * Obtiene las cuentas del usuario actual
 * @returns {Promise<Array>} Lista de cuentas
 */
async function getCuentas() {
  if (!currentUser) return;

  try {
    const response = await fetch(`http://localhost:3000/api/cuentas?usuarioId=${currentUser.id}`);
    const data = await response.json();

    if (data.success) {
      // Guardamos la primera cuenta como "cuenta actual" (simplificación)
      if (data.data.length > 0) {
        currentAccount = data.data[0];
        updateBalanceUI();
      }
      return data.data;
    } else {
      throw new Error(data.message || 'Error al obtener cuentas');
    }
  } catch (error) {
    showError(error.message);
    throw error;
  }
}

/**
 * Realiza un depósito
 * @param {number} monto 
 * @returns {Promise<Object>} Resultado de la transacción
 */
async function depositar(monto) {
  if (!currentAccount) return;

  try {
    const response = await fetch('http://localhost:3000/api/transacciones/depositar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cuentaId: currentAccount._id,
        monto: parseFloat(monto)
      }),
    });

    const data = await response.json();

    if (data.success) {
      currentAccount.saldo = data.nuevoSaldo;
      updateBalanceUI();
      showSuccess(`Depósito exitoso. Nuevo saldo: $${data.nuevoSaldo}`);
      await loadTransactions();
      return data;
    } else {
      throw new Error(data.message || 'Error al depositar');
    }
  } catch (error) {
    showError(error.message);
    throw error;
  }
}

/**
 * Realiza un retiro
 * @param {number} monto 
 * @returns {Promise<Object>} Resultado de la transacción
 */
async function retirar(monto) {
  if (!currentAccount) return;

  try {
    const response = await fetch('http://localhost:3000/api/transacciones/retirar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cuentaId: currentAccount._id,
        monto: parseFloat(monto)
      }),
    });

    const data = await response.json();

    if (data.success) {
      currentAccount.saldo = data.nuevoSaldo;
      updateBalanceUI();
      showSuccess(`Retiro exitoso. Nuevo saldo: $${data.nuevoSaldo}`);
      await loadTransactions();
      return data;
    } else {
      throw new Error(data.message || 'Error al retirar');
    }
  } catch (error) {
    showError(error.message);
    throw error;
  }
}

/**
 * Obtiene las transacciones de la cuenta actual
 * @returns {Promise<Array>} Lista de transacciones
 */
async function getTransacciones() {
  if (!currentAccount) return;

  try {
    const response = await fetch(`http://localhost:3000/api/transacciones/${currentAccount._id}`);
    const data = await response.json();

    if (data.success) {
      return data.transacciones;
    } else {
      throw new Error(data.message || 'Error al obtener transacciones');
    }
  } catch (error) {
    showError(error.message);
    throw error;
  }
}

// ===========================================
// 3. FUNCIONES PARA LA INTERFAZ DE USUARIO
// ===========================================

/**
 * Actualiza el saldo en la UI
 */
function updateBalanceUI() {
  if (!currentAccount) return;

  document.getElementById('currentBalance').textContent = `$${currentAccount.saldo}`;
  document.getElementById('lastUpdate').innerHTML = `
    <i class="fas fa-sync-alt me-1"></i>Actualizado: ${new Date().toLocaleTimeString()}
  `;
  document.getElementById('availableBalance').textContent = `$${currentAccount.saldo}`;
  document.getElementById('availableBalanceTransfer').textContent = `$${currentAccount.saldo}`;
}

/**
 * Carga las transacciones en la tabla
 */
async function loadTransactions() {
  const spinner = document.getElementById('transactionsSpinner');
  const tableBody = document.getElementById('transactionsTable');
  
  spinner.style.display = 'flex';
  tableBody.innerHTML = '';

  try {
    const transacciones = await getTransacciones();
    
    if (transacciones.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4">
            No hay transacciones registradas
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = transacciones.map(trans => `
      <tr>
        <td>${new Date(trans.creado_en).toLocaleDateString()}</td>
        <td>${trans.tipo === 'ingreso' ? 'Depósito' : 'Retiro'}</td>
        <td>
          <span class="badge ${trans.tipo === 'ingreso' ? 'deposit-badge' : 'withdrawal-badge'}">
            ${trans.tipo === 'ingreso' ? 'Ingreso' : 'Retiro'}
          </span>
        </td>
        <td class="text-end ${trans.tipo === 'ingreso' ? 'text-success' : 'text-danger'}">
          ${trans.tipo === 'ingreso' ? '+' : '-'}$${trans.monto}
        </td>
        <td class="text-end">$${trans.saldo_resultante}</td>
      </tr>
    `).join('');
  } catch (error) {
    showError(error.message);
  } finally {
    spinner.style.display = 'none';
  }
}

/**
 * Muestra un mensaje de error
 * @param {string} message 
 */
function showError(message) {
  const errorAlert = document.getElementById('errorAlert');
  document.getElementById('errorMessage').textContent = message;
  errorAlert.classList.remove('d-none');
  
  setTimeout(() => {
    errorAlert.classList.add('d-none');
  }, 5000);
}

/**
 * Muestra un mensaje de éxito
 * @param {string} message 
 */
function showSuccess(message) {
  const successModal = new bootstrap.Modal(document.getElementById('successModal'));
  document.getElementById('successMessage').textContent = message;
  successModal.show();
}

// ===========================================
// 4. MANEJADORES DE EVENTOS
// ===========================================

/**
 * Maneja el envío del formulario de depósito
 */
async function handleDeposit(e) {
  e.preventDefault();
  const amount = document.getElementById('depositAmount').value;
  const btn = document.getElementById('confirmDepositBtn');
  const spinner = document.getElementById('depositSpinner');
  
  btn.disabled = true;
  spinner.style.display = 'inline-block';
  
  try {
    await depositar(amount);
    bootstrap.Modal.getInstance(document.getElementById('depositModal')).hide();
    document.getElementById('depositForm').reset();
  } finally {
    btn.disabled = false;
    spinner.style.display = 'none';
  }
}

/**
 * Maneja el envío del formulario de retiro
 */
async function handleWithdraw(e) {
  e.preventDefault();
  const amount = document.getElementById('withdrawAmount').value;
  const btn = document.getElementById('confirmWithdrawBtn');
  const spinner = document.getElementById('withdrawSpinner');
  
  btn.disabled = true;
  spinner.style.display = 'inline-block';
  
  try {
    await retirar(amount);
    bootstrap.Modal.getInstance(document.getElementById('withdrawModal')).hide();
    document.getElementById('withdrawForm').reset();
  } finally {
    btn.disabled = false;
    spinner.style.display = 'none';
  }
}

/**
 * Maneja el cierre de sesión
 */
function handleLogout() {
  currentUser = null;
  currentAccount = null;
  window.location.href = 'login.html'; // Cambia esto según tu estructura
}

/**
 * Maneja la actualización de transacciones
 */
async function handleRefreshTransactions() {
  const btn = document.getElementById('refreshTransactionsBtn');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Actualizando...';
  
  await loadTransactions();
  
  btn.innerHTML = '<i class="fas fa-sync-alt me-1"></i>Actualizar';
}

// ===========================================
// 5. INICIALIZACIÓN DE LA APLICACIÓN
// ===========================================

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
async function initApp() {
  // Configurar manejadores de eventos
  document.getElementById('depositForm').addEventListener('submit', handleDeposit);
  document.getElementById('withdrawForm').addEventListener('submit', handleWithdraw);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('refreshTransactionsBtn').addEventListener('click', handleRefreshTransactions);

  // Simulamos un login automático (en un caso real sería después de un formulario)
  try {
    await login('carlos@example.com'); // Cambia esto por el email real
    await getCuentas();
    await loadTransactions();
  } catch (error) {
    console.error('Error inicializando la app:', error);
  }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);