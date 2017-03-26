# Matcha
## Setup
### Pré-requis

-Node.JS v6.10.0

-MongoDB v3.4.2


### Setup
#### Dans un terminal:
* Entrer: <code>git clone http://github.com/Remaii/Matcha.git</code> ⏎
* Entrer: <code>cd Matcha</code> ⏎
* Entrer: <code>npm install</code> ⏎
* Entrer dans un autre terminal: <code>mongod [--db-path] --port 28000</code> ⏎
* Entrer: <code>node générateur.js [nombre d'utilisateur voulu]</code> ⏎
* Entrer: <code>npm run start</code> ⏎
* Rendez-vous sur: <http://localhost:3000>, créer un utilisateur, enjoy!


## Status:🚧

### Inscription / Connection

* avec Mail, nom d'Utilisateur, Mot de Passe sécurisé✅

* Login:✅

* Logout:✅

* Reinitialisé son Mot de Passe:❌


### Profil de l'utilisateur

* Modifier son Prénom:✅

* Modifier son Nom:❌

* Modifier son mail:❌

* Modifier son sexe:✅

* Modifier sa sexualité:✅

* Modifier sa biographie (500 caractères):✅

* Ajouter/Supprimer ses Tags:✅

* Ajouter/Supprimer ses photos maximum 5:❌

* Voir les profils des utilisateurs qui ont liké:❌

* Localiser l'utilisateur:❌

* Score de popularité:❌


### Parcours

* Affiche uniquement les profils "interessant" suivant la sexualité:❌, par défaut trie par localisation:❌

* Affichage intelligent (zone géographique:❌, maximum de tags:❌, maximum poplarité:❌)

* Trie possible de la liste des profils par âge:❌, localisation:❌, poplarité:❌, tag en commun:❌

* Trie possible de la liste des profils par INTERVALE d'âge:❌, localisation:❌, poplarité:❌, tag en commun:❌

* Voir les autres profils:❌

* Liker un profil:❌

* Tchatter avec un autre utilisateur:❌


### Recherche

* Par intervalle d'âge:❌

* Par intervalle de score de popularité:❌

* Par tags:❌

* Localisation:❌

* Résultat triable comme le parcours:❌


### Profil des Autres

* Rendu des informations:❌

#### Quand un utilisateur regarde le profil d'un autre:

* Si il possède minimum 1 photo, Liker:❌, Engager le Tchat(*):❌

* Voir le statut de connection:❌

* Reporter faux compte:❌

* Bloquer:❌

* Voir si l'utilisateur Like en retour:❌


### Tchat

* (*) "Connecter" 2 profils par les likes:❌

* (*2)


### Notifications en cas de

* Like reçu:❌

* Visite sur de mon profil:❌

* Nouveau message(tchat):❌

* Like en retour d'un like:❌

* Dislike reçu:❌

* (*2)Les notifications sont visible partout:❌


### Bonus

* Charger les images a partir de facebook/google+:❌

* Carte des utilisateurs interactive:❌

* Ajout de tags à la base de donnée:✅


### Consignes éliminatoires

* Injection SQL:✅(MongoDB)

* Aucune erreur:🚧

* Mot de Passe crypter:✅(whirlpool)