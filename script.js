// Charge les utilisateurs à partir du stockage local s'ils existent, sinon initialise avec des utilisateurs par défaut
let users = JSON.parse(localStorage.getItem('users')) || [];
// Ajoutez cette ligne au début de votre script.js pour initialiser le tableau de logs
let transactionLogs = JSON.parse(localStorage.getItem('transactionLogs')) || [];

// Si aucun utilisateur n'est présent dans le stockage local, ajoute des utilisateurs par défaut
if (users.length === 0) {
    users.push(
        { username: 'user', password: 'password', isAdmin: false, balance: 0 },
        { username: '0629482089267', password: 'Thomas280808', isAdmin: false, balance: 0 },
        { username: 'Admin', password: 'Pepeci67310', isAdmin: true, balance: 1000 }
    );

    // Enregistre les utilisateurs dans le stockage local
    localStorage.setItem('users', JSON.stringify(users));
}

let currentUser = null;

// Charge l'utilisateur courant à partir du stockage local s'il existe
const storedUser = JSON.parse(localStorage.getItem('currentUser'));
if (storedUser) {
    const foundUser = users.find(u => u.username === storedUser.username);
    if (foundUser) {
        currentUser = foundUser;
    }
}

function logTransaction(sender, receiver, amount, type) {
    const logEntry = {
        sender: sender,
        receiver: receiver,
        amount: amount,
        type: type, // "transfer", "purchase", "addFunds", or "withdrawFunds"
        date: new Date().toLocaleString()
    };
    transactionLogs.push(logEntry);

    // Enregistrer les logs dans le stockage local
    localStorage.setItem('transactionLogs', JSON.stringify(transactionLogs));

    // Ajouter un log de transaction à la section des logs pour le côté du sender
    addLogToSection(`${sender} a effectué une transaction de ${amount} € vers ${receiver} le ${logEntry.date}`, sender, receiver);

    // Ajouter un log de transaction à la section des logs pour le côté du receiver
    addLogToSection(`${receiver} a reçu une transaction de ${amount} € de ${sender} le ${logEntry.date}`, sender, receiver);
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;

        // Enregistrer les informations de connexion dans le stockage local
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // document.getElementById('login-section').style.display = 'none'; // Supprimez cette ligne
        // document.getElementById('signup-section').style.display = 'none'; // Supprimez cette ligne
        // ... rest of the code
    } else {
        alert('Nom d\'utilisateur ou mot de passe incorrect. Veuillez contacter votre banque pour obtenir un compte si vous n\'avez pas de compte.');
        // document.getElementById('login-section').style.display = 'none'; // Supprimez cette ligne
        // document.getElementById('signup-section').style.display = 'block'; // Supprimez cette ligne
        document.getElementById('logs-section').style.display = 'none';
        updateBalance();
    }
}


function logout() {
    currentUser = null;
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('signup-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('balance-section').style.display = 'none';
    document.getElementById('transaction-section').style.display = 'none';

    // Masquer la section des transactions lors de la déconnexion
    document.getElementById('logs-section').style.display = 'none';
}

function updateBalance() {
    const balanceElement = document.getElementById('balance');
    const balanceAmount = currentUser.balance;

    // Ajoutez un signe négatif devant le montant
    const formattedBalance = balanceAmount >= 0 ? `+${balanceAmount}` : `${balanceAmount}`;

    // Appliquez la classe CSS pour la couleur rouge des soldes négatifs
    if (balanceAmount < 0) {
        balanceElement.classList.add('negative');
    } else {
        balanceElement.classList.remove('negative');
    }

    balanceElement.innerText = `${formattedBalance} €`;
}

function addFunds() {
    if (isAdmin()) {
        const username = prompt('Entrez le nom d\'utilisateur du compte à créditer :');
        const userToAddFunds = users.find(u => u.username === username);

        if (userToAddFunds && !userToAddFunds.isAdmin) {
            const amount = parseFloat(prompt('Entrez le montant à ajouter :'));
            if (!isNaN(amount) && amount > 0) {
                userToAddFunds.balance += amount;
                updateBalance();
                alert(`Fonds ajoutés avec succès au compte de ${username}. Nouveau solde : ${userToAddFunds.balance} €`);

                // Mettre à jour le stockage local avec les modifications
                localStorage.setItem('users', JSON.stringify(users));

                // Ajouter un log de transaction pour l'argent ajouté
                logTransaction(currentUser.username, username, amount, 'addFunds');

                // Ajouter le log à la section des logs
                addLogToSection(`${currentUser.username} a ajouté ${amount} € au compte de ${username} le ${new Date().toLocaleString()}`);
            } else {
                alert('Veuillez entrer un montant valide.');
            }
        } else {
            alert('Utilisateur non trouvé ou ne peut pas recevoir de fonds.');
        }
    } else {
        alert('Vous n\'avez pas les autorisations pour cette fonctionnalité.');
    }
}

function withdrawFunds() {
    if (isAdmin()) {
        const username = prompt('Entrez le nom d\'utilisateur du compte à débiter :');
        const userToWithdrawFunds = users.find(u => u.username === username);

        if (userToWithdrawFunds && !userToWithdrawFunds.isAdmin) {
            const amount = parseFloat(prompt('Entrez le montant à retirer :'));
            if (!isNaN(amount) && amount > 0) {
                userToWithdrawFunds.balance -= amount;
                updateBalance();
                alert(`Fonds retirés avec succès du compte de ${username}. Nouveau solde : ${userToWithdrawFunds.balance} €`);

                // Mettre à jour le stockage local avec les modifications
                localStorage.setItem('users', JSON.stringify(users));

                // Ajouter un log de transaction
                logTransaction(currentUser.username, username, amount, 'withdrawFunds');
            } else {
                alert('Montant invalide.');
            }
        } else {
            alert('Utilisateur non trouvé ou ne peut pas être débité.');
        }
    } else {
        alert('Vous n\'avez pas les autorisations pour cette fonctionnalité.');
    }
}

function modifyAccountAdmin() {
    if (isAdmin()) {
        const username = prompt('Entrez le nom d\'utilisateur du compte à modifier :');
        const userToModify = users.find(u => u.username === username);

        if (userToModify && !userToModify.isAdmin) {
            const newUsername = prompt('Entrez le nouveau nom d\'utilisateur (laissez vide pour ne pas modifier) :');
            const newPassword = prompt('Entrez le nouveau mot de passe (laissez vide pour ne pas modifier) :');

            if (newUsername !== null && newUsername !== '') {
                userToModify.username = newUsername;
            }

            if (newPassword !== null && newPassword !== '') {
                userToModify.password = newPassword;
            }

            alert(`Compte de ${username} modifié avec succès.`);

            // Mettre à jour l'affichage des informations de l'utilisateur
            displayUserInfo();
        } else {
            alert('Utilisateur non trouvé ou ne peut pas être modifié.');
        }
    } else {
        alert('Vous n\'avez pas les autorisations pour cette fonctionnalité.');
    }
}

// Fonction pour afficher les informations de l'utilisateur dans la section admin
function displayUserInfo() {
    const userInfoSection = document.getElementById('user-info-section');

    // Effacer le contenu existant
    userInfoSection.innerHTML = '';

    // Afficher les informations de l'utilisateur actuel
    if (currentUser) {
        const userInfo = document.createElement('p');
        userInfo.textContent = `Nom d'utilisateur : ${currentUser.username}, Solde : ${currentUser.balance} €`;
        userInfoSection.appendChild(userInfo);
    }
}

function isAdmin() {
    return currentUser && currentUser.isAdmin;
}

function accessAdmin() {
    const adminPassword = prompt('Entrez le mot de passe administrateur :');

    // Vérifier si le mot de passe est correct
    if (adminPassword === 'Pepeci67310') {
        currentUser = users.find(u => u.username === 'Admin');

        // Enregistrer les informations de connexion dans le stockage local
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        document.getElementById('login-section').style.display = 'none';
        document.getElementById('signup-section').style.display = 'none';
        document.getElementById('admin-section-header').style.display = 'block'; // Mettez à jour l'ID ici
        document.getElementById('balance-section').style.display = 'block';
        document.getElementById('transaction-section').style.display = 'block';
        updateBalance();
    } else {
        alert('Mot de passe incorrect.');
    }
}

function addAdmin() {
    if (isAdmin()) {
        const newAdminUsername = prompt('Entrez le nom d\'utilisateur du nouveau administrateur :');
        const newAdminPassword = prompt('Entrez le mot de passe du nouveau administrateur :');

        if (newAdminUsername && newAdminPassword) {
            // Vérifier si le nom d'utilisateur est déjà pris
            if (!users.some(u => u.username === newAdminUsername)) {
                const newAdmin = { username: newAdminUsername, password: newAdminPassword, isAdmin: true, balance: 0 };
                users.push(newAdmin);

                // Enregistrer les utilisateurs mis à jour dans le stockage local
                localStorage.setItem('users', JSON.stringify(users));

                alert('Nouvel administrateur ajouté avec succès.');
            } else {
                alert('Ce nom d\'utilisateur est déjà pris. Veuillez choisir un autre nom.');
            }
        } else {
            alert('Veuillez remplir tous les champs.');
        }
    } else {
        alert('Vous n\'avez pas les autorisations pour cette fonctionnalité.');
    }
}

function transferFunds() {
    if (currentUser) {
        const targetUsername = prompt('Entrez le nom d\'utilisateur du bénéficiaire :');
        const targetUser = users.find(u => u.username === targetUsername);

        if (targetUser && targetUser.username !== currentUser.username) {
            const amount = parseFloat(prompt('Entrez le montant à transférer :'));

            if (!isNaN(amount) && amount > 0 && currentUser.balance >= amount) {
                currentUser.balance -= amount;
                targetUser.balance += amount;

                // Mettre à jour le stockage local avec les modifications
                localStorage.setItem('users', JSON.stringify(users));

                alert(`Transfert de ${amount} € à ${targetUsername} effectué avec succès.`);
                updateBalance();

                // Ajouter un log de transaction
                logTransaction(currentUser.username, targetUsername, amount, 'transfer');
            } else {
                alert('Montant invalide ou solde insuffisant.');
            }
        } else {
            alert('Bénéficiaire non trouvé ou invalide.');
        }
    } else {
        alert('Vous devez être connecté pour effectuer un transfert.');
    }
}

function purchase() {
    const amount = parseFloat(document.getElementById('amount').value);

    if (!isNaN(amount) && amount > 0 && currentUser.balance >= amount) {
        // Mettez à jour le solde de l'utilisateur
        currentUser.balance -= amount;
        updateBalance();

        alert(`Achat de ${amount} € effectué avec succès.`);

        // Mettre à jour le stockage local avec les modifications
        localStorage.setItem('users', JSON.stringify(users));

        // Ajouter un log de transaction
        logTransaction(currentUser.username, 'Admin', amount, 'purchase');

        // Ajouter le log à la section des logs
        addLogToSection(`${currentUser.username} a effectué un achat de ${amount} € le ${new Date().toLocaleString()}`, currentUser.username, 'Admin');
    } else {
        alert('Montant invalide ou solde insuffisant.');
    }
}

function addLogToSection(logText, sender, receiver) {
    const logsSection = document.getElementById('transaction-logs');
    const logItem = document.createElement('li');

    // Ajoutez le nouvel élément au début de la liste seulement si l'utilisateur actuel est le destinataire
    if (currentUser && (currentUser.username === sender || currentUser.username === receiver)) {
        logItem.textContent = logText;
        logsSection.insertBefore(logItem, logsSection.firstChild);
    }
}
