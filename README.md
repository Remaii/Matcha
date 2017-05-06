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
* Entrer: <code>node gen.js all [nombre d'utilisateur voulu]</code> ex: <code>node gen.js all 1000</code> ,⏎
* Entrer: <code>npm run start</code> ,⏎
* Rendez-vous sur: <code>http://localhost:3000</code> , créer un utilisateur, enjoy!


## Status:🚧94%

### 100% Inscription / Connection
* avec Mail, nom d'Utilisateur, Mot de Passe sécurisé✅
* Login:✅
* Logout:✅
* Reinitialisé son Mot de Passe:✅, Changer son mot de passe✅


### 92% Profil de l'utilisateur
* Modifier son prénom:✅
* Modifier son Nom:✅
* Modifier son mail:✅
* Modifier son sexe:✅
* Modifier sa sexualité:✅
* Modifier sa biographie (500 caractères):✅
* Ajouter/Supprimer ses Tags:✅
* Ajouter/Supprimer ses photos maximum 6:✅
* Voir les utilisateurs qui ont liké:✅
* Definir une autre localisation:❌
* Localiser l'utilisateur:✅(googlemaps api) || ✅(geoip2)
* Score de popularité:✅ (((nombre de like + nombre de visite)) / nombre de False)


### 100% Parcours
* Affiche uniquement les profils "interessant" suivant la sexualité:✅, par defaut trie par localisation:✅(rayon de 50km)
* Affichage intelligent (zone géographique✅) ou (ponderation avec✅✅✅: localisation(situé a moin de 50km +1pts), maximum de tags(+1pts/tag en commun), +score de popularité(pts), +1pts si l'age es ±5ans)
* Trie possible de la liste des profils par âge:✅, localisation:✅, poplarité:✅, tag en commun:✅
* -Voir les autres profils:✅
* -Liker un profil:✅
* -Tchatter avec un autre utilisateur:✅

### 66% Recherche
* Trie possible de la liste des profils par INTERVALE d'âge:✅, localisation:✅,poplarité:❌, Possède l'un de ces tags:✅
* Localisation:✅(L'utilisateur peut choisir le rayon de recherche)
* Résultat triable comme le parcours:❌

### 100% Profil des autres
* Rendu des informations:✅(prénom, nom, âge, orientation sexuel, sexe, tags, bio)
Quand un utilisateur regarde le profil d'un autre:
* Si il possède minimum 1 photo, Liker:✅, Engager le Tchat(*):✅(par la barre de navigation + (*))
* Voir le statut de connection:✅
* Reporter faux compte:✅
* Bloquer:✅
* Voir si l'utilisateur Like en retour:✅ (Notification)

### 100% Tchat
* (*) "Connecter" 2 profils par les likes:✅
* (*2)

### 100% Notifications en cas de:
* Like reçu:✅ (👍)
* Visite sur de mon profil:✅ (🔍)
* Nouveau message(tchat):✅ (📝)
* Like en retour d'un like:✅ (💞)
* Dislike reçu:✅ (👎) (il faut liker pour dislike)
* (*2)Les notifications sont visibles partout:✅

#### Bonus 
* Choisir son avatar parmis ses photos:✅
* Compte admin, possibilité de supprimer les tags:❌
* Charger les images a partir de facebook/google+:❌
* Carte des utilisateurs interactive:❌
* Ajout de tag à la base de donnée:✅

#### Consignes éliminatoires
* Injection SQL:✅(MongoDB)
* Aucune erreur:🚧
* Mot de Passe crypter:✅(whirlpool + "doit etre composé au minimum, d'1 majuscule, d'1 chiffre, avoir une longueur de 5 caractère minimum")

#### Générateur de profile: (Option)
* all => génère le nombre donnée d'utilisateur et ajoute les tags <code>node gen.js all [1 à 500]</code>
* user => génère uniquement le nombre donnée d'utilisateur <code>node gen.js user [1 à 5000]</code>
* tag => ajoute uniquement les tags à la base de donné <code>node gen.js tag</code>

