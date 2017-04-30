# Matcha v0.0.1
## Setup
### Pré-requis

* Node.JS v6.10.0
* MongoDB v3.4.2


### Setup
#### Dans un terminal:
* Entrer: <code>git clone http://github.com/Remaii/Matcha.git</code> ,⏎
* Entrer: <code>cd Matcha</code> ,⏎
* Entrer: <code>npm install</code> ,⏎
* Entrer dans un autre terminal: <code>mongod [--db-path] --port 28000</code> ,⏎
* Entrer: <code>node gen.js [nombre d'utilisateur voulu]</code> ex: <code>node gen.js 10</code> ,⏎
* Entrer: <code>npm run start</code> ,⏎
* Rendez-vous sur: <code>http://localhost:3000</code> , créer un utilisateur, enjoy!


## Status:🚧

### Inscription / Connection 75%end
* avec Mail, nom d'Utilisateur, Mot de Passe sécurisé✅
* Login:✅
* Logout:✅
* Reinitialisé son Mot de Passe:❌


### Profil de l'utilisateur 100%end
* Modifier son prénom:✅
* Modifier son Nom:✅
* Modifier son mail:✅
* Modifier son sexe:✅
* Modifier sa sexualité:✅
* Modifier sa biographie (500 caractères):✅
* Ajouter/Supprimer ses Tags:✅
* Ajouter/Supprimer ses photos maximum 6:✅
* Voir les utilisateurs qui ont liké:✅
* Localiser l'utilisateur:✅(geoip2)
* Score de popularité:✅ (((nombre de like + nombre de visite)/* - nombre de bloquage*/) / nombre de False)


### Parcours 18%end
* Affiche uniquement les profils "interessant" suivant la sexualité:✅, par defaut trie par localisation:✅(rayon de 200km)
* Affichage intelligent (zone géographique:❌, maximum de tags:❌, maximum poplarité:❌)
* Trie possible de la liste des profils par âge:❌, localisation:❌, poplarité:❌, tag en commun:❌
* Trie possible de la liste des profils par INTERVALE d'âge:❌, localisation:❌, poplarité:❌, tag en commun:❌
* -Voir les autres profils:✅
* -Liker un profil:✅
* -Tchatter avec un autre utilisateur:✅

### Recherche 80%end
* Par intervalle d'âge:✅
* Par intervalle de score de popularité:❌
* Par tags:✅ (Possède l'un de ces tags)
* Localisation:✅(L'utilisateur peut choisir le rayon de recherche)
* Résultat triable comme le parcours:✅

### Profil des autres 14%end
* Rendu des informations:✅(prénom, nom, âge, orientation sexuel, sexe, tags, bio)
Quand un utilisateur regarde le profil d'un autre:
* Si il possède minimum 1 photo, Liker:✅, Engager le Tchat(*):✅(par la barre de navigation + (*))
* Voir le statut de connection:❌
* Reporter faux compte:✅
* Bloquer:✅
* Voir si l'utilisateur Like en retour:✅ (Notification "Match with ...")

### Tchat 0%end
* (*) "Connecter" 2 profils par les likes:✅
* (*2)

### Notifications en cas de 0%end
* Like reçu:✅
* Visite sur de mon profil:❌
* Nouveau message(tchat):❌
* Like en retour d'un like:❌
* Dislike reçu:❌
* (*2)Les notifications sont visibles partout:✅

### Bonus
* Choisir son avatar parmis ses photos:✅
* Definir une autre localisation:❌
* Compte admin, possibilité de supprimer les tags:❌
* Charger les images a partir de facebook/google+:❌
* Carte des utilisateurs interactive:❌
* Ajout de tag à la base de donnée:✅

### Consignes éliminatoires
* Injection SQL:✅(MongoDB)
* Aucune erreur:🚧
* Mot de Passe crypter:✅(whirlpool)
