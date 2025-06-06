// ===========================================
// 1. VARIABLES GLOBALES Y ESTADO DE LA APLICACIÓN
// ===========================================
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let currentAccount = JSON.parse(localStorage.getItem('account')) || null;

// ===========================================
// 2. FUNCIONES PARA INTERACTUAR CON LA API
// ===========================================
/**
 * Actualiza la información del usuario en la UI
 */
function updateUserInfo() {
  if (!currentUser || !currentAccount) {
    showError('No se encontró información del usuario o cuenta');
    return;
  }

  // Mostrar información del usuario en la barra de navegación
  const userInfoElement = document.getElementById('userInfo');
  if (userInfoElement) {
    userInfoElement.innerHTML = `
      <i class="fas fa-user-circle me-2"></i>
      ${currentUser.nombre}
    `;
  }

  // Mostrar información de la cuenta
  document.getElementById('currentBalance').textContent = `$${currentAccount.saldo}`;
  document.getElementById('accountNumber').textContent = currentAccount.numero_cuenta;
  document.getElementById('availableBalance').textContent = `$${currentAccount.saldo}`;
  document.getElementById('availableBalanceTransfer').textContent = `$${currentAccount.saldo}`;
  
  // Actualizar la fecha
  document.getElementById('lastUpdate').innerHTML = `
    <i class="fas fa-sync-alt me-1"></i>Actualizado: ${new Date().toLocaleTimeString()}
  `;
}

/**
 * Realiza un depósito
 * @param {number} monto 
 * @returns {Promise<Object>} Resultado de la transacción
 */
async function depositar(monto) {
  if (!currentAccount) return;

  try {
    const response = await fetch('http://localhost:3003/api/transactions/transacciones/depositar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cuentaId: currentAccount._id,
        monto: parseFloat(monto)
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Actualizar el saldo localmente
      currentAccount.saldo = data.nuevoSaldo;
      localStorage.setItem('account', JSON.stringify(currentAccount));
      
      updateUserInfo();
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
    const response = await fetch('http://localhost:3003/api/transactions/transacciones/retirar', {
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
 * Realiza una transferencia
 * @param {string} cuentaDestino 
 * @param {number} monto 
 * @returns {Promise<Object>} Resultado de la transacción
 */
async function transferir(cuentaDestino, monto) {
  if (!currentAccount) return;
  
  try {
    const response = await fetch('http://localhost:3003/api/transactions/transacciones/transferir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        numeroCuentaOrigen: currentAccount.numero_cuenta,
        numeroCuentaDestino: cuentaDestino,
        monto: parseFloat(monto)
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al transferir');
    }
    
    // Actualizar el saldo localmente
    currentAccount.saldo = data.nuevoSaldoOrigen;
    localStorage.setItem('account', JSON.stringify(currentAccount));
    
    updateBalanceUI();
    showSuccess(`Transferencia exitosa. Nuevo saldo: $${data.nuevoSaldoOrigen}`);
    await loadTransactions();
    
    return data;
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
    const response = await fetch(`http://localhost:3003/api/transactions/transacciones/${currentAccount._id}`);
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
  const tableBody = document.getElementById('transactionsTable');
  
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

    tableBody.innerHTML = transacciones.map(trans => {
      let tipoLabel = '';
      let tipoBadge = '';
      let signo = '';

      switch (trans.tipo) {
        case 'ingreso':
          tipoLabel = 'Depósito';
          tipoBadge = 'deposit-badge';
          signo = '+';
          break;
        case 'retiro':
          tipoLabel = 'Retiro';
          tipoBadge = 'withdrawal-badge';
          signo = '-';
          break;
        case 'transferencia':
          tipoLabel = 'Transferencia';
          tipoBadge = 'transfer-badge'; // crea una clase en CSS si quieres estilos únicos
          signo = '-'; // o '+', depende de cómo manejes esto
          break;
        case 'deposito':
          tipoLabel = 'Depósito Bancario';
          tipoBadge = 'deposit-badge'; // puedes usar la misma clase
          signo = '+';
          break;
        default:
          tipoLabel = trans.tipo;
          tipoBadge = 'unknown-badge';
          signo = '';
      }

      return `
        <tr>
          <td>${new Date(trans.creado_en).toLocaleDateString()}</td>
          <td>${tipoLabel}</td>
          <td><span class="badge ${tipoBadge}">${tipoLabel}</span></td>
          <td class="text-end ${signo === '+' ? 'text-success' : 'text-danger'}">
            ${signo}$${trans.monto}
          </td>
          <td class="text-end">$${trans.saldo_resultante}</td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    showError(error.message);
  } finally {
    const btn = document.getElementById('refreshTransactionsBtn');
    btn.innerHTML = '<i class="fas fa-sync-alt me-1"></i>Actualizar';
    btn.disabled = false;
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
 * Maneja el envío del formulario de transferencia
 */
async function handleTransfer(e) {
  e.preventDefault();
  const cuentaDestino = document.getElementById('transferAccount').value.trim();
  const monto = document.getElementById('transferAmount').value;
  const btn = document.getElementById('confirmTransferBtn');
  const spinner = document.getElementById('transferSpinner');
  
  btn.disabled = true;
  spinner.style.display = 'inline-block';
  
  try {
    // Validación básica
    if (!cuentaDestino || !monto) {
      throw new Error('Debes completar todos los campos');
    }
    
    if (cuentaDestino === currentAccount.numero_cuenta) {
      throw new Error('No puedes transferir a tu propia cuenta');
    }
    
    await transferir(cuentaDestino, monto);
    bootstrap.Modal.getInstance(document.getElementById('transferModal')).hide();
    document.getElementById('transferForm').reset();
  } catch (error) {
    showError(error.message);
  } finally {
    btn.disabled = false;
    spinner.style.display = 'none';
  }
}

/**
 * Maneja el cierre de sesión
 */
function handleLogout() {
  localStorage.removeItem('user');
  localStorage.removeItem('account');
  window.location.href = '/index.html';
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
  // Verificar si hay usuario logueado
  if (!currentUser) {
    window.location.href = '/index.html';
    return;
  }

  // Configurar manejadores de eventos
  document.getElementById('depositForm').addEventListener('submit', handleDeposit);
  document.getElementById('withdrawForm').addEventListener('submit', handleWithdraw);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('refreshTransactionsBtn').addEventListener('click', handleRefreshTransactions);
  document.getElementById('transferForm').addEventListener('submit', handleTransfer);

  // Mostrar información del usuario
  updateUserInfo();
  
  // Cargar transacciones
  await loadTransactions();
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);