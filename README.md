<h1>Matcha</h1>
<h3>Setup</h3>
<h4>Pre-requis</h4>
<p>-Node.JS v6.10.0<br></p>
<p>-MongoDB v3.4.2<br></p>
<h4>Setup</h4>
<p>Dans un terminal:<br></p>
<p>-Entrer: `git clone http://github.com/Remaii/Matcha.git` ,⏎<br></p>
<p>-Entrer: `cd Matcha` ,⏎<br></p>
<p>-Entrer: `npm install` ,⏎<br></p>
<p>/!\-Entrer dans un autre terminal: `mongod [--db-path] --port 28000` ,⏎<br></p>
<p>-Entrer: `node generateur.js [nombre d'utilisateur voulu]` ex: `node generateur.js 10` ,⏎<br></p>
<p>-Entrer: `npm run start` ,⏎<br></p>
<h5>Rendez-vous sûr: `http://localhost:3000` , créer un utilisateur, enjoy!<br></h5>

<h3>Status:🚧</h3>

<h4>Inscription / Connection</h4>
<p>-avec Mail, nom d'Utilisateur, Mot de Passe sécurisé✅</p>
<p>-Login:✅</p>
<p>-Logout:✅</p>
<p>-Reinitialisé son Mot de Passe:❌</p>

<h4>Profil de l'utilisateur</h4>
<p>-Modifier son Prenom:✅</p>
<p>-Modifier son Nom:❌</p>
<p>-Modifier son mail:❌</p>
<p>-Modifier son sexe:✅</p>
<p>-Modifier sa sexualité:✅</p>
<p>-Modifier sa biographie (500 caractères):✅</p>
<p>-Ajouter/Supprimer ses Tags:✅</p>
<p>-Ajouter/Supprimer ses photos maximum 5:❌</p>
<p>-Voir les profils des utilisateurs qui ont liker:❌</p>
<p>-Localiser l'utilisateur:❌</p>
<p>-Score de popularité:❌</p>

<h4>Parcours</h4>
<p>-Affiche uniquement les profils "interessant" suivant la sexualité:❌, par defult trie par localisation:❌</p>
<p>-Affichage intelligent (zone geographique:❌, maximum de tag:❌, maximum poplarité:❌)</p>
<p>-Trie possible de la liste des profile par age:❌, localisation:❌, poplarité:❌, tag en commun:❌</p>
<p>-Trie possible de la liste des profile par INTERVALE d'age:❌, localisation:❌, poplarité:❌, tag en commun:❌</p>
<p>--Voir les autres profile:❌</p>
<p>--Liker un profile:❌</p>
<p>--Tchatter avec un autre utilisateur:❌</p>

<h4>Recherche</h4>
<p>-Par intervalle d'âge:❌</p>
<p>-Par intervalle de score de popularité:❌</p>
<p>-Par tags:❌</p>
<p>-Localisation:❌</p>
<p>-Résultat triable comme le parcours:❌</p>

<h4>Profil des Autres</h4>
<p>-Rendu des informations:❌</p>
<h5>Quand un utilisateur regarde le profil d'un autre:</h5>
<p>-Si il possède minimum 1 photo, Liker:❌, Engager le Tchat(*):❌</p>
<p>-Voir le statut de connection:❌</p>
<p>-Reporter faux compte:❌</p>
<p>-Bloquer:❌</p>
<p>-Voir si l'utilisateur Like en retour:❌</p>

<h4>Tchat</h4>
<p>-(*) "Connecter" 2 profils par les likes:❌</p>
<p>-(*2)</p>

<h4>Notifications en cas de</h4>
<p>-Like reçu:❌</p>
<p>-Visite sur de mon profil:❌</p>
<p>-Nouveau message(tchat):❌</p>
<p>-Like en retour d'un like:❌</p>
<p>-Dislike reçu:❌</p>
<p>-(*2)Les notifications sont visible partout:❌</p>

<h4>Bonus</h4>
<p>-Charger les images a partir de facebook/google+:❌</p>
<p>-Carte des utilisateurs interactive:❌</p>
<p>-Ajout de tag à la base de donnée:✅</p>

<h6> Consignes éliminatoires </h6>
<p>-Injection SQL:✅(MongoDB)</p>
<p>-Aucune erreur:🚧</p>
<p>-Mot de Passe crypter:✅(whirlpool)</p>