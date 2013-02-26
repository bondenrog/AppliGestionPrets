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
	db.transaction(DB_getPrets, DB_transaction_error);
	db = null;
}

function DB_populate(tx){
	tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('MacBook','Francky Vincent', date('now'), 5)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('PC Vaio','Sarah Croche', date('now'), 5)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('ZZ Top','Steven Wells', date('now'), 2)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('Cartes','Adam Smith', date('now'), 4)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('Monopoly','Jean Michel', date('now'), 4)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('Cable USB','Christine Wells', date('now'), 5)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('Audi TT','Bobby Belair', date('now'), 7)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('50€','Brandon Mills', date('now'), 6)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('Harry Potter','Harry Rose', date('now'), 1)");
}

function DB_populate_success(){
	alert("INFO : La base de données a été remplie avec succès");
}

// Création des tables de la base de données
function DB_createTables(tx)
{
	console.log("createTables");
	
	tx.executeSql('DROP TABLE IF EXISTS Categorie');
	var sql = 
		"CREATE TABLE IF NOT EXISTS Categorie ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"intitule VARCHAR(50) " +		
		")";
    tx.executeSql(sql);
    
    console.log("Table CATEGORIE created");
    
    tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Livres')");
    tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Musiques')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Films')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Jeux')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Informatique')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Argent')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Autres')");  
	
	var sql = 
		"CREATE TABLE IF NOT EXISTS Pret ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"title VARCHAR(50), " +
		"descName VARCHAR(50), " +
		"date DATE," +
		"id_categorie INTEGER, " +	
		"FOREIGN KEY(id_categorie) REFERENCES Categorie(id)" +
		")";
    tx.executeSql(sql);
    
    console.log("Table PRET created");
}

// Succès de la création des tables de la base de données
function DB_createTables_success() {
	db.transaction(DB_getCategories, DB_transaction_error);
	db.transaction(DB_getPrets, DB_transaction_error);
}

// Erreur de base de données
function DB_transaction_error(tx, error) {
    alert("Database Error: " + error);
}

// Lecture des catégories dans la base de données
function DB_getCategories(tx) {
	var sql = "SELECT * FROM Categorie";
	tx.executeSql(sql, [], DB_getCategorie_success);
}

// Affichage des catégories dans le HTML
function DB_getCategorie_success(tx, results) {
    var len = results.rows.length;
	console.log("exec query getCategorie");
	$('#listeCategories').append('<option value="'+0+'"></option>'); //ligne vide pour la liste catégorie page ajout
    for (var i=0; i<len; i++) {
    	var cat = results.rows.item(i);
    	$('#listeCategories').append('<option value="'+cat.id+'">'+ cat.intitule + '</option>'); //liste catégorie page ajout
		$('#listePrets').append('<li data-role="list-divider" id="'+cat.id+'">'+cat.intitule+'</li>'); //liste prets page consultation
    }
}

// Lecture des prêts dans la base de données
function DB_getPrets(tx) {
	var sql = "SELECT * FROM Pret ";
	tx.executeSql(sql, [], DB_getPrets_success);
}

// Affichage des prêts dans le HTML
function DB_getPrets_success(tx, results) {
    var len = results.rows.length;
    
	console.log("exec query getPrets");
	
   for (var i=0; i<len; i++) {
		//recuperation du pret courant
    	var pret = results.rows.item(i);
    	
		//recuperation date SQL du pret
    	var YMD = pret.date.split("-");
        var sqlDate = new Date();
        sqlDate.setTime(0); // mise à zéro de l'heure
        sqlDate.setFullYear(parseInt(YMD[0]), parseInt(YMD[1]) - 1, parseInt(YMD[2]));
        
		//recuperation date JS d'aujourd'hui
        var jsDateNow = new Date();
        jsDateNow.setTime(0); // mise à zéro de l'heure
        var dateNow = new Date();
        jsDateNow.setFullYear(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate());
        
		//calcul durée
        var WNbJours = jsDateNow.getTime() - sqlDate.getTime();
        var duree = Math.ceil(WNbJours/(1000*60*60*24));
        
    	/*console.log(pret.date + " - " + sqlDate + " - " + sqlDate.toLocaleDateString() + " - " + jsDateNow );*/
    	
    	$content = $('<li><a href="#detail" data-transition="none"'+'onclick=getPret('+pret.id+')>' +
					'<h2>' + pret.title + '</h2>' +
					'<p><strong>' + pret.descName + '</strong></p>' +
					/*'<p class="ui-li-aside">12/02/2012</p>' + */
					'<span class="ui-li-count"> En prêt depuis le ' + YMD[2] + '/' + YMD[1] + '/' + YMD[0] + ' (' + duree +' jours)</span>' +
					'</a></li>');
		/*$content.find("a").click(function(){
		getPret(pret);
		});*/
		$('#' + pret.id_categorie).after($content);

    }
}

//Lecture d'un pret
function getPret(id)
{
	DB_openDatabase();
	
	db.transaction(function(tx){
		DB_getPret(tx, id);
	}, DB_transaction_error);
	db = null;
}

//Lecture d'un prêt dans la base de données
function DB_getPret(tx, id) {
	var sql = "SELECT * FROM Pret WHERE id="+id;
	tx.executeSql(sql, [], DB_getPret_success);
}

//Affichage des détails du prêt dans le HTML
function DB_getPret_success(tx, results) {
	console.log("exec query getPret");
	var pret = results.rows.item(0);
	$('#detailcontent').empty();	
	$('#detailcontent').append(
	'<h2>' + pret.id + ' - ' + pret.title + '</h2>' +
	'<p><strong>' + pret.descName + '</strong></p>' +
	'<p>' + pret.date + '</p>' +
	'<p>' + pret.id_categorie + '</p>');	
}	

function validateForm(){
  // si la valeur du champ prenom est non vide
  if($('#intitule').text() != "" && $('#listeCategories').text() != "" && $('#listeContacts').text() != "") {
    // les données sont ok, on peut envoyer le formulaire    
    return true;
  }
  else {
    // sinon on affiche un message
    alert("Merci de saisir les champs du formulaire !");
    // et on indique de ne pas envoyer le formulaire
    return false;
  }
}

// Création d'un prêt avec les informations du formulaire
function createPret(){
		console.log("exec query createPret FORM");
		DB_openDatabase();
		var intitule = $('#intitule').val();
		var categorie = $('#listeCategories option:selected').val();	
		var contact = $('#listeContacts option:selected').text();

		db.transaction(function(tx){
			DB_createPret(tx, intitule, contact, categorie);
		}, DB_transaction_error, DB_createPret_success);
}

// Création d'un pret dans la base de données
function DB_createPret(tx, intitule, contact, categorie) { // mettre params
	console.log("exec query createPret");
	var sql = "INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('"+intitule+"','"+contact+"', date('now'), '"+categorie+"')";
	tx.executeSql(sql);
}

// Mise à jours de l'affichage des prêts
function DB_createPret_success(){
	$('#listePrets').empty();
	db.transaction(DB_getPrets, DB_transaction_error);
	alert('INFOS : Le prêt a été inséré avec succès');	
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
	$('#listeContacts').append('<option value="'+ 0 +'></option>');
	for (var i=0; i<contacts.length; i++) {
		$('#listeContacts').append('<option value="'+ i+1 +'">' + contacts[i].displayName + '</option>');
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


