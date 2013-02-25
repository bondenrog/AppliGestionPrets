// On attend que cordova se charge avant de lancer quoi que ce soit
document.addEventListener("deviceready", onDeviceReady, false);

//Cordova est prêt donc on lance le script
function onDeviceReady() {

	DB_openDatabase();

	// Création de la base de données et création des différents éléments HTML
	db.transaction(DB_createTables, DB_transaction_error, DB_createTables_success);

	// Récupération des contacts du téléphone
    getContacts();	

	navigator.splashscreen.hide();
}

//**********************************//
// Gestion Base de données
//**********************************//

// Ouverture de la bdd
function DB_openDatabase(){
	console.log("opening database");
    db = window.openDatabase("DB_Pret", "1.0", "DB_Pret", 200000);
    console.log("database opened");
}

// Insertion de Prets pour le test de l'application
function populateDB(){
	console.log("populateDB");
	DB_openDatabase();
	db.transaction(DB_populate, DB_transaction_error, DB_populate_success);
	db.transaction(getPrets, DB_transaction_error);
}

function DB_populate(tx){
	tx.executeSql("INSERT INTO Pret (title,firstName,lastName, date, id_categorie) VALUES ('PC3','Steven','Wells', date('now'), 1)");
    tx.executeSql("INSERT INTO Pret (title,firstName,lastName, date, id_categorie) VALUES ('PC2','Steven','Wells', date('now'), 1)");
    tx.executeSql("INSERT INTO Pret (title,firstName,lastName, date, id_categorie) VALUES ('PC1','Steven','Wells', date('now'), 1)");
    tx.executeSql("INSERT INTO Pret (title,firstName,lastName, date, id_categorie) VALUES ('CD','Steven','Wells', date('now'), 1)");
    tx.executeSql("INSERT INTO Pret (title,firstName,lastName, date, id_categorie) VALUES ('Cartes','Steven','Wells', date('now'), 1)");
    tx.executeSql("INSERT INTO Pret (title,firstName,lastName, date, id_categorie) VALUES ('Dés','Steven','Wells', date('now'), 1)");
    tx.executeSql("INSERT INTO Pret (title,firstName,lastName, date, id_categorie) VALUES ('Cable USB','Steven','Wells', date('now'), 1)");
    tx.executeSql("INSERT INTO Pret (title,firstName,lastName, date, id_categorie) VALUES ('BMW','Steven','Wells', date('now'), 1)");
    tx.executeSql("INSERT INTO Pret (title,firstName,lastName, date, id_categorie) VALUES ('Argent','Steven','Wells', date('now'), 1)");
    tx.executeSql("INSERT INTO Pret (title,firstName,lastName, date, id_categorie) VALUES ('Livre1','Steven','Wells', date('now'), 1)");
}

function DB_populate_success(){
	alert("La base de données a bien été remplie");
}

// Création des tables de la base de données
function DB_createTables(tx)
{
	console.log("createTables");
	
	var sql = 
		"CREATE TABLE IF NOT EXISTS Pret ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"title VARCHAR(50), " +
		"firstName VARCHAR(50), " +
		"lastName VARCHAR(50), " +
		"date DATE," +
		"id_categorie INTEGER, " +	
		"FOREIGN KEY(id_categorie) REFERENCES Categorie(id)" +
		")";
    tx.executeSql(sql);
    
    console.log("Table PRET created");
	
	tx.executeSql('DROP TABLE IF EXISTS Categorie');
	var sql = 
		"CREATE TABLE IF NOT EXISTS Categorie ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"intitule VARCHAR(50) " +		
		")";
    tx.executeSql(sql);
    
    console.log("Table CATEGORIE created");
    
    tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Livre')");
    tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Musique')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Film')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Jeux')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Informatique')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Argent')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Autre')");  
}

// Succès de la création des tables de la base de données
function DB_createTables_success() {
    db.transaction(getPrets, DB_transaction_error);
	db.transaction(getCategories, DB_transaction_error);
}

// Erreur de base de données
function DB_transaction_error(tx, error) {
    alert("Database Error: " + error);
}

// Lecture des catégories dans la base de données
function getCategories(tx) {
	var sql = "SELECT * FROM Categorie";
	tx.executeSql(sql, [], getCategorie_success);
}

// Affichage des catégories dans le HTML
function getCategorie_success(tx, results) {
    var len = results.rows.length;
	console.log("exec query getCategorie");
    for (var i=0; i<len; i++) {
    	var cat = results.rows.item(i);
    	$('#listeCategories').append('<option>'+ cat.intitule + '</option>');
    }
	db = null;
}

// Lecture des prêts dans la base de données
function getPrets(tx) {
	var sql = "SELECT * FROM Pret ";
	tx.executeSql(sql, [], getPrets_success);
}

// Affichage des prêts dans le HTML
function getPrets_success(tx, results) {
    var len = results.rows.length;
	console.log("exec query getPrets");
    for (var i=0; i<len; i++) {
    	var pret = results.rows.item(i);
    	$('#listePrets').append('<li><a href="#detail" data-transition="none">' +
    								'<h2>' + pret.title + '</h2>' +
    								'<p><strong>' + pret.firstName + ' ' + pret.lastName + '</strong></p>' +
    								'<p class="ui-li-aside">12/02/2012</p>' +
    								'</a></li>');
		/*$('#employeeList').append('<li><a href="employeedetails.html?id=' + employee.id + '">' +
				'<img src="pics/' + employee.picture + '" class="list-icon"/>' +
				'<p class="line1">' + employee.firstName + ' ' + employee.lastName + '</p>' +
				'<p class="line2">' + employee.title + '</p>' +
				'<span class="bubble">' + employee.reportCount + '</span></a></li>');*/
    }
	db = null;
}

// Création d'un prêt avec les informations du formulaire
function createPret(form){
		DB_openDatabase();
		var nom,prenom,bla = form;
		db.transaction(function(tx){
			DB_createPret(tx, nom, prenom, bla);
		}, DB_transaction_error, DB_createPret_success);
}

// Création d'un pret dans la base de données
function DB_createPret(tx, nom, prenom, bla) {
	console.log("exec query createPret");
	tx.executeSql("INSERT INTO Pret (title,firstName,lastName) VALUES ('Babouin','Pikachu','Wells')");
}

// Mise à jours de l'affichage des prêts
function DB_createPret_success(){
	$('#listePrets').empty();
	db.transaction(getPrets, DB_transaction_error);
	alert('Le prêt a été inséré avec succès');
	
}

//**********************************//
//	Gestion Contacts
//**********************************//

//Récupère les contacts du téléphone
function getContacts()
{
	var options = new ContactFindOptions();
	options.filter=""; 
	options.multiple=true; 
	var fields = ["displayName", "phoneNumbers"];
	navigator.contacts.find(fields, getContactsSuccess, getContactsError, options);
}

// Insère les contacts du téléphone dans la liste
function getContactsSuccess(contacts) {
	for (var i=0; i<contacts.length; i++) {
		$('#listeContacts').append('<option>' + contacts[i].displayName + '</option>');
	}
}

// Erreur lors de la récupération des contacts du téléphone
function getContactsError(contactError) {
	alert('Error during loading phone contacts');
}

//**********************************//
// Divers
//**********************************//

$(function(){ // <-- this is a shortcut for $(document).ready(function(){ ... });
    $('#ajout').mouseup(function(){
		$('#listePrets').listview('refresh');
    });
});

$(function(){ // <-- this is a shortcut for $(document).ready(function(){ ... });
    $('#home').mouseup(function(){
		$('#listePrets').listview('refresh');
    });
});


