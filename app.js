const BOOKSTORE_ADDRESS = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8"; 
const BOOKNFT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";

const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			}
		],
		"name": "buyBook",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_durationInSeconds",
				"type": "uint256"
			}
		],
		"name": "rentBook",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_bookNFTAddress",
				"type": "address"
			},
			{
				"internalType": "address payable",
				"name": "_authorAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "authorAddress",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "bookNFTContract",
		"outputs": [
			{
				"internalType": "contract BookNFT",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "purchasePrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "rentalEndTimes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rentalPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const BOOKNFT_ABI = [
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function approve(address to, uint256 tokenId) public",
    "function setApprovalForAll(address operator, bool approved) public",
    "function isApprovedForAll(address owner, address operator) public view returns (bool)",
    "function transferFrom(address from, address to, uint256 tokenId) public"
];

const SEPOLIA_CHAIN_ID = '0xaa36a7';

let ALL_BOOKS = [];

// ============================================
// SISTEMA DE NOTIFICACIONES
// ============================================

function createNotificationContainer() {
    if (document.getElementById('notificationContainer')) return;
    
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.innerHTML = `
        <style>
            #notificationContainer {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: none;
                justify-content: center;
                align-items: center;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                backdrop-filter: blur(5px);
            }
            
            .notification-box {
                background: linear-gradient(135deg, #2e3047 0%, #1a1b2e 100%);
                border-radius: 20px;
                padding: 40px 50px;
                text-align: center;
                color: white;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-30px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateY(30px) scale(0.9);
                }
            }
            
            .notification-icon {
                font-size: 4em;
                margin-bottom: 20px;
            }
            
            .notification-icon.loading {
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.7; }
            }
            
            .notification-title {
                font-size: 1.5em;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .notification-message {
                font-size: 1em;
                color: #aaa;
                margin-bottom: 20px;
                line-height: 1.5;
            }
            
            .notification-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-top: 4px solid #5d50e8;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 20px auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .notification-progress {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                height: 8px;
                overflow: hidden;
                margin-top: 20px;
            }
            
            .notification-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #5d50e8, #7b6fec, #5d50e8);
                background-size: 200% 100%;
                animation: progressMove 1.5s ease-in-out infinite;
                border-radius: 10px;
            }
            
            @keyframes progressMove {
                0% { background-position: 100% 0; }
                100% { background-position: -100% 0; }
            }
            
            .notification-hash {
                background: rgba(255, 255, 255, 0.1);
                padding: 10px 15px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 0.85em;
                word-break: break-all;
                margin-top: 15px;
            }
            
            .notification-hash a {
                color: #7b6fec;
                text-decoration: none;
            }
            
            .notification-hash a:hover {
                text-decoration: underline;
            }
            
            .notification-success {
                color: #50e85d;
            }
            
            .notification-error {
                color: #e85050;
            }
            
            .notification-warning {
                color: #e8a050;
            }
        </style>
        <div class="notification-box">
            <div class="notification-icon" id="notifIcon">⏳</div>
            <div class="notification-title" id="notifTitle">Procesando...</div>
            <div class="notification-message" id="notifMessage">Por favor espera</div>
            <div class="notification-spinner" id="notifSpinner"></div>
            <div class="notification-progress" id="notifProgress">
                <div class="notification-progress-bar"></div>
            </div>
            <div class="notification-hash" id="notifHash" style="display: none;"></div>
        </div>
    `;
    document.body.appendChild(container);
}

function showNotification(type, title, message, options = {}) {
    createNotificationContainer();
    
    const container = document.getElementById('notificationContainer');
    const icon = document.getElementById('notifIcon');
    const titleEl = document.getElementById('notifTitle');
    const messageEl = document.getElementById('notifMessage');
    const spinner = document.getElementById('notifSpinner');
    const progress = document.getElementById('notifProgress');
    const hashEl = document.getElementById('notifHash');
    
    // Resetear clases
    icon.className = 'notification-icon';
    titleEl.className = 'notification-title';
    
    switch(type) {
        case 'loading':
            icon.textContent = '⏳';
            icon.classList.add('loading');
            spinner.style.display = 'block';
            progress.style.display = 'block';
            break;
        case 'success':
            icon.textContent = '✅';
            titleEl.classList.add('notification-success');
            spinner.style.display = 'none';
            progress.style.display = 'none';
            break;
        case 'error':
            icon.textContent = '❌';
            titleEl.classList.add('notification-error');
            spinner.style.display = 'none';
            progress.style.display = 'none';
            break;
        case 'warning':
            icon.textContent = '⚠️';
            titleEl.classList.add('notification-warning');
            spinner.style.display = 'none';
            progress.style.display = 'none';
            break;
        case 'wallet':
            icon.textContent = '🦊';
            icon.classList.add('loading');
            spinner.style.display = 'block';
            progress.style.display = 'block';
            break;
    }
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Mostrar hash si existe
    if (options.hash) {
        hashEl.innerHTML = `
            <a href="https://sepolia.etherscan.io/tx/${options.hash}" target="_blank">
                🔗 ${options.hash.substring(0, 20)}...${options.hash.substring(options.hash.length - 10)}
            </a>
        `;
        hashEl.style.display = 'block';
    } else {
        hashEl.style.display = 'none';
    }
    
    container.style.display = 'flex';
    
    // Auto-cerrar si es éxito o error (después de un delay)
    if (options.autoClose) {
        setTimeout(() => {
            hideNotification();
        }, options.autoClose);
    }
}

function hideNotification() {
    const container = document.getElementById('notificationContainer');
    const box = container.querySelector('.notification-box');
    
    box.style.animation = 'slideOut 0.3s ease-in forwards';
    
    setTimeout(() => {
        container.style.display = 'none';
        box.style.animation = 'slideIn 0.3s ease-out';
    }, 300);
}

// Función helper para mostrar notificación de éxito y cerrar automáticamente
function showSuccess(title, message, options = {}) {
    showNotification('success', title, message, { autoClose: 3000, ...options });
}

function showError(title, message) {
    showNotification('error', title, message, { autoClose: 4000 });
}

function showLoading(title, message) {
    showNotification('loading', title, message);
}

function showWalletPending(title, message) {
    showNotification('wallet', title, message);
}


function openModal() {
    const modal = document.getElementById('walletModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal() {
    const modal = document.getElementById('walletModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openPhysicalModal() {
    const modal = document.getElementById('physicalModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closePhysicalModal() {
    const modal = document.getElementById('physicalModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function connectMetaMask() {
    const walletArea = document.getElementById('walletArea');
        
    if (!window.ethereum) {
        showError('MetaMask no encontrado', 'Instala MetaMask para usar esta aplicación');
        return;
    }

    try {
        closeModal();
        showLoading('Conectando...', 'Abre MetaMask para continuar');
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) { // Sepolia
            showLoading('Cambiando red...', 'Cambiando a la red Sepolia');
            const switched = await switchToSepolia();
            if (!switched) {
                showError('Red incorrecta', 'Por favor cambia a la red Sepolia manualmente');
                return;
            }
        }

        const accounts = await provider.send("eth_requestAccounts", []);
        const userAddress = accounts[0];

        // Guardar en localStorage (persistente) y sessionStorage (solo esta sesión)
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('userAddress', userAddress);
        sessionStorage.setItem('sessionConnected', 'true');

        const displayAddress = userAddress.substring(0, 6) + '...' + userAddress.substring(userAddress.length - 4);
        
        walletArea.innerHTML = `
            <span style="
                background-color: #50e85d;
                color: white; 
                padding: 8px 20px; 
                border-radius: 2px; 
                font-weight: bold;
                display: inline-flex;
                align-items: center;
                font-size: 0.9em;
            ">
                ✅ CONECTADO: ${displayAddress}
            </span>
        `;
        window.signer = provider.getSigner();
        window.userProvider = provider;
        window.userAddress = userAddress;

        showSuccess('¡Conectado!', `Wallet: ${displayAddress}`, { autoClose: 2000 });

        console.log('✅ Wallet conectada:', userAddress);

    } catch (error) {
        console.error("Error de conexión:", error);
        if (error.code === 4001) {
            showError('Conexión rechazada', 'Has rechazado la conexión en MetaMask');
        } else {
            showError('Error de conexión', 'No se pudo conectar con MetaMask');
        }
    }
}

async function switchToSepolia() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
        return true;
    } catch (error) {
        if (error.code === 4902) {
            alert('Por favor añade la red Sepolia manualmente a MetaMask');
        } else {
            console.error('Error al cambiar de red:', error);
        }
        return false;
    }
}

async function checkPersistedConnection() {
    try {
        // Usamos sessionStorage para mantener conexión SOLO durante la sesión del navegador
        // localStorage guarda si el usuario alguna vez conectó (para mostrar estado)
        const sessionActive = sessionStorage.getItem('sessionConnected');
        const savedAddress = localStorage.getItem('userAddress');
        
        if (sessionActive === 'true' && savedAddress && typeof window.ethereum !== 'undefined') {
            // Solo reconectar si hay una sesión activa (usuario ya conectó en esta pestaña/sesión)
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts' 
            });
            
            if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
                await connectMetaMaskSilent();
                console.log('✅ Reconexión de sesión exitosa');
            } else {
                // La cuenta cambió o se desconectó
                sessionStorage.removeItem('sessionConnected');
                localStorage.removeItem('walletConnected');
                localStorage.removeItem('userAddress');
            }
        }
        // Si no hay sessionActive, NO reconectamos automáticamente
        // El usuario debe hacer clic en "Conectar Billetera"
    } catch (error) {
        console.error('Error en reconexión:', error);
    }
}

async function connectMetaMaskSilent() {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        
        if (accounts.length === 0) {
            console.log('No hay cuentas conectadas');
            return;
        }
        
        const userAddress = accounts[0];
        
        // Marcar sesión como activa
        sessionStorage.setItem('sessionConnected', 'true');
        
        const displayAddress = userAddress.substring(0, 6) + '...' + userAddress.substring(userAddress.length - 4);
        const walletArea = document.getElementById('walletArea');
        
        if (walletArea) {
            walletArea.innerHTML = `
                <span style="
                    background-color: #50e85d;
                    color: white; 
                    padding: 8px 20px; 
                    border-radius: 2px; 
                    font-weight: bold;
                    display: inline-flex;
                    align-items: center;
                    font-size: 0.9em;
                ">
                    ✅ CONECTADO: ${displayAddress}
                </span>
            `;
        }
        
        window.signer = provider.getSigner();
        window.userProvider = provider;
        window.userAddress = userAddress;
        
    } catch (error) {
        console.error('Error en reconexión silenciosa:', error);
    }
}


// ✅ CORREGIDO: Usar BOOKSTORE_ADDRESS en lugar de CONTRACT_ADDRESS
async function buyBook(tokenId, priceEth) {
    if (!window.signer) {
        showError('Billetera no conectada', 'Por favor, conéctate a tu billetera primero.');
        setTimeout(() => openModal(), 1500);
        return;
    }

    try {
        showLoading('Preparando compra...', 'Verificando disponibilidad del libro');
        
        const bookNFTContract = new ethers.Contract(BOOKNFT_ADDRESS, BOOKNFT_ABI, window.signer);
        const bookStoreContract = new ethers.Contract(BOOKSTORE_ADDRESS, CONTRACT_ABI, window.signer);

        const owner = await bookNFTContract.ownerOf(tokenId);
        const isApproved = await bookNFTContract.isApprovedForAll(owner, BOOKSTORE_ADDRESS);

        if (!isApproved) {
            showError('Libro no disponible', 'Este libro no ha sido aprobado para venta. Contacta al administrador.');
            return;
        }

        const priceWei = ethers.utils.parseEther(priceEth.toString());
        
        showWalletPending('Confirma en MetaMask', 'Aprueba la transacción en tu billetera');
        
        const tx = await bookStoreContract.buyBook(tokenId, { 
            value: priceWei,
            gasLimit: 300000 
        }); 
        
        showLoading('Procesando compra...', 'Esperando confirmación en la blockchain');
        
        // Guardar transacción como pendiente
        if (typeof window.saveTransaction === 'function') {
            window.saveTransaction({
                type: 'compra',
                tokenId: tokenId,
                amount: priceEth.toString(),
                hash: tx.hash,
                status: 'pending'
            });
        }
        
        await tx.wait(); 
        
        // Actualizar estado a success
        updateTransactionStatus(tx.hash, 'success');
        
        showSuccess('¡Compra realizada!', 'El NFT del libro ahora es tuyo', { hash: tx.hash, autoClose: 5000 });
        
    } catch (error) {
        console.error("Error de transacción:", error);
        
        if (error.code === 4001) {
            showError('Transacción cancelada', 'Has rechazado la transacción en MetaMask');
        } else if (error.message.includes('insufficient funds')) {
            showError('Fondos insuficientes', 'No tienes suficiente ETH en tu wallet');
        } else if (error.reason) {
            showError('Error del contrato', error.reason);
        } else {
            showError('Error de transacción', 'No se pudo completar la compra. Intenta de nuevo.');
        }
    }
}

// ✅ CORREGIDO: Usar BOOKSTORE_ADDRESS en lugar de CONTRACT_ADDRESS
async function rentBook(tokenId, priceEth) {
    if (!window.signer) {
        showError('Billetera no conectada', 'Por favor, conéctate a tu billetera primero.');
        setTimeout(() => openModal(), 1500);
        return;
    }

    try {
        showLoading('Preparando renta...', 'Configurando acceso por 7 días');
        
        const durationSeconds = 7 * 24 * 60 * 60;
        const priceWei = ethers.utils.parseEther(priceEth.toString());
        
        const bookStoreContract = new ethers.Contract(BOOKSTORE_ADDRESS, CONTRACT_ABI, window.signer);
        
        showWalletPending('Confirma en MetaMask', 'Aprueba la transacción en tu billetera');
        
        const tx = await bookStoreContract.rentBook(
            tokenId, 
            durationSeconds,
            { 
                value: priceWei,
                gasLimit: 200000 
            }
        );
        
        showLoading('Procesando renta...', 'Esperando confirmación en la blockchain');
        
        // Guardar transacción como pendiente
        if (typeof window.saveTransaction === 'function') {
            window.saveTransaction({
                type: 'renta',
                tokenId: tokenId,
                amount: priceEth.toString(),
                hash: tx.hash,
                status: 'pending',
                duration: '7 días'
            });
        }
        
        await tx.wait(); 
        
        // Actualizar estado a success
        updateTransactionStatus(tx.hash, 'success');
        
        showSuccess('¡Renta realizada!', 'Tienes acceso al libro por 7 días', { hash: tx.hash, autoClose: 5000 });
        
    } catch (error) {
        console.error("Error de transacción de renta:", error);
        
        if (error.code === 4001) {
            showError('Transacción cancelada', 'Has rechazado la transacción en MetaMask');
        } else if (error.reason) {
            showError('Error del contrato', error.reason);
        } else {
            showError('Error de transacción', 'No se pudo completar la renta. Intenta de nuevo.');
        }
    }
}

// Función para actualizar el estado de una transacción guardada
function updateTransactionStatus(txHash, newStatus) {
    if (!window.userAddress) return;
    
    const key = 'bookchain_transactions_' + window.userAddress.toLowerCase();
    const saved = localStorage.getItem(key);
    
    if (saved) {
        const transactions = JSON.parse(saved);
        const txIndex = transactions.findIndex(tx => tx.hash === txHash);
        
        if (txIndex !== -1) {
            transactions[txIndex].status = newStatus;
            localStorage.setItem(key, JSON.stringify(transactions));
            console.log('✅ Estado de transacción actualizado:', txHash, newStatus);
        }
    }
}

async function processPhysicalPurchase() {
    const name = document.getElementById('buyerName')?.value || '';
    const city = document.getElementById('city').value;
    const cp = document.getElementById('cp').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    if (!city || !cp || !address || !phone) {
        showError('Datos incompletos', 'Por favor, llena todos los campos de envío.');
        return;
    }

    // Cerrar modal de datos
    closePhysicalModal();
    
    // Mostrar procesando
    showLoading('Procesando pago...', 'Verificando datos de envío');
    
    // Simular procesamiento de pago (2 segundos)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mostrar confirmación
    showLoading('Confirmando pedido...', 'Generando orden de envío');
    
    // Simular confirmación (1.5 segundos)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generar un ID de orden simulado
    const orderId = 'PHYSICAL-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Guardar transacción física en el historial
    if (typeof window.saveTransaction === 'function' && window.userAddress) {
        window.saveTransaction({
            type: 'compra_fisica',
            tokenId: 'N/A',
            amount: window.currentPhysicalBook ? window.currentPhysicalBook.price + ' USD' : '25 USD',
            hash: orderId,
            status: 'success',
            bookTitle: window.currentPhysicalBook ? window.currentPhysicalBook.title : 'Libro físico',
            shippingAddress: `${address}, ${city}, CP ${cp}`,
            phone: phone
        });
    }
    
    // Limpiar variable
    window.currentPhysicalBook = null;
    
    // Éxito
    showSuccess('¡Compra realizada!', `Tu libro será enviado a ${city}. Orden: ${orderId}`, { autoClose: 5000 });
}

// Variable para guardar el libro físico actual (se usa desde compra.html)
window.currentPhysicalBook = null;

async function loadBookData() {
    try {
        const response = await fetch('./books.json');
        
        if (!response.ok) {
            console.error('Error al cargar books.json:', response.statusText);
            throw new Error('No se pudo cargar books.json');
        }
        
        ALL_BOOKS = await response.json();
        console.log("✅ Datos de libros cargados:", ALL_BOOKS.length, "libros");

        return ALL_BOOKS;

    } catch (error) {
        console.error("❌ Fallo al cargar la base de datos de libros:", error);
        return [];
    }
}

async function loadUserLibrary() {
    const container = document.getElementById('userBooksContainer');
    
    if (!container) {
        console.warn('Container userBooksContainer no encontrado');
        return;
    }
    
    if (ALL_BOOKS.length === 0) {
        container.innerHTML = `<p style="color: orange; font-weight: bold;">Cargando catálogo...</p>`;
        await loadBookData();
    }

    if (ALL_BOOKS.length === 0) {
        container.innerHTML = `<p style="color: red;">Error: No se encontraron libros en el catálogo.</p>`;
        return;
    }

    let tableContent = '';
    
    ALL_BOOKS.forEach(book => {
        const isOwned = false;
        const hasRentOption = book.rentPriceEth && book.rentPriceEth > 0;
        
        let buyButtonHtml, rentButtonHtml;
        
        if (isOwned) {
            buyButtonHtml = `<button class="action-btn" disabled style="background-color: #888;">Ya lo posees</button>`;
            rentButtonHtml = `<button class="action-btn" disabled style="background-color: #888;">N/A</button>`;
        } else {
            if (book.priceEth) {
                buyButtonHtml = `<a href="compra.html"><button class="action-btn">Comprar (${book.priceEth} ETH)</button></a>`;
            } else if (book.priceUsd) {
                buyButtonHtml = `<a href="compra.html"><button class="action-btn">Comprar ($${book.priceUsd})</button></a>`;
            } else {
                buyButtonHtml = `<button class="action-btn" disabled>No disponible</button>`;
            }
            
            rentButtonHtml = hasRentOption 
                ? `<a href="renta.html"><button class="action-btn" style="background-color: #e8a050;">Rentar (${book.rentPriceEth} ETH)</button></a>`
                : `<button class="action-btn" disabled style="background-color: #888;">No disponible</button>`;
        }

        tableContent += `
            <div class="book-list-item">
                <div style="width: 25%; font-weight: bold;">${book.title}</div>
                <div style="width: 25%;">${book.author}</div>
                <div style="width: 25%;">
                    ${buyButtonHtml}
                </div>
                <div style="width: 25%;">
                    ${rentButtonHtml}
                </div>
            </div>
        `;
    });
    
    const libraryHtml = `
        <div class="book-list-header">
            <div style="width: 25%; font-weight: bold;">Nombre</div>
            <div style="width: 25%; font-weight: bold;">Autor</div>
            <div style="width: 25%; font-weight: bold;">Comprar</div>
            <div style="width: 25%; font-weight: bold;">Rentar</div>
        </div>
        ${tableContent}
    `;

    container.innerHTML = libraryHtml;
}

if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('userAddress');
            sessionStorage.removeItem('sessionConnected');
            window.location.reload();
        } else {
            localStorage.setItem('userAddress', accounts[0]);
            window.location.reload();
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}


window.addEventListener('load', async () => { 
    console.log('🚀 Iniciando BookChain...');
    
    await loadBookData();
    await checkPersistedConnection();
    
    window.processPhysicalPurchase = processPhysicalPurchase;
    window.openPhysicalModal = openPhysicalModal;
    window.closePhysicalModal = closePhysicalModal;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.connectMetaMask = connectMetaMask;
    window.buyBook = buyBook;
    window.rentBook = rentBook;
    window.loadUserLibrary = loadUserLibrary;

    if (document.getElementById('userBooksContainer')) {
        loadUserLibrary();
    }
    
    console.log('✅ BookChain inicializado correctamente');
});

console.log('📚 BookChain App cargada');