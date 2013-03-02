// On attend que cordova se charge avant de lancer quoi que ce soit
document.addEventListener("deviceready", onDeviceReady, false);

//Cordova est prêt donc on lance le script
function onDeviceReady() {

	// Gestion du backbutton
	document.addEventListener("backbutton", function(e){
		//Si on est sur la page home ou consultation, on quitte
		if( ($.mobile.activePage.is('#home')) || ($.mobile.activePage.is('#consultation')) ){
		    e.preventDefault();
		    navigator.app.exitApp();
		}
		// Sinon on revient en arrière
		else {
		    navigator.app.backHistory()
		}
		}, false);
	
	// Ouverture de la base de données
	DB_openDatabase();

	// Création de la base de données et création des différents éléments HTML
	db.transaction(DB_createTables, DB_transaction_error, DB_createTables_success);

	// Récupération des contacts du téléphone
    getContacts();	

    // Application prête à fonctionner donc on cache le splashscreen
	navigator.splashscreen.hide();
}

//**********************************//
// Gestion Base de données
//**********************************//

// Ouverture de la bdd
function DB_openDatabase(){
	console.log("opening database");
    db = window.openDatabase("DB_Pret_BONDENROG", "1.0", "DB_Pret_BONDENROG", 200000);
    console.log("database opened");
}

//Erreur de base de données
function DB_transaction_error(tx, error) {
    alert("Database Error: " + error);
}

// Insertion de prêts pour le test de l'application
function populateDB(){
	console.log("populateDB");
	DB_openDatabase();
	db.transaction(DB_populate, DB_transaction_error, DB_populate_success);
	updateListview();
	db = null;
}
// Insertion de prêts dans la base de données
function DB_populate(tx){
	tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('MacBook','Francky Vincent', date('now', 'start of month'), 3)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('PC Vaio','Sarah Croche', date('now','-1 day'), 3)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('ZZ Top','Steven Wells', date('now', '-2 days'), 6)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('Cartes','Adam Smith', date('now', '-24 days'), 4)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('Monopoly','Jean Michel', date('now', '-58 days'), 4)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('Cable USB','Christine Wells', date('now', '-24 days'), 3)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('Audi TT','Bobby Belair', date('now', '-74 days'), 7)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('50€','Brandon Mills', date('now', '-22 days'), 1)");
    tx.executeSql("INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('Harry Potter','Harry Rose', date('now', '-8 days'), 5)");
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
    
    tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Argent')");
    tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Films')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Informatique')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Jeux')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Livres')");
	tx.executeSql("INSERT INTO Categorie (intitule) VALUES ('Musiques')");
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
function DB_createTables_success() {
	// Succès de la création des tables de la base de données
	// donc maj de la listview des prêts
	updateListview();
}

// Lecture des catégories dans la base de données
function DB_getCategories(tx) {
	var sql = "SELECT * FROM Categorie";
	tx.executeSql(sql, [], DB_getCategories_success);
}
function DB_getCategories_success(tx, results) {
	console.log("exec query getCategories");
	var len = results.rows.length;
	
	// Affichage des catégories dans le HTML
	$('#listeCategories').empty();
	$('#listePrets').empty();
	
	$('#listeCategories').append('<option value="0"></option>'); //ligne vide pour la liste catégorie page ajout
    for (var i=0; i<len; i++) {
    	var cat = results.rows.item(i);
    	$('#listeCategories').append('<option value="'+cat.id+'">'+ cat.intitule + '</option>'); //liste catégorie page ajout
		$('#listePrets').append('<li data-role="list-divider" id="'+cat.id+'">'+cat.intitule+'</li>'); //liste prets page consultation
    }
    
    // on essaye un refresh car bcp de pb
	try
	{
		$('#listePrets').listview('refresh');
	}
	catch(err)
	{
		console.log(err.message);
	}
}

// Lecture des prêts dans la base de données
function DB_getPrets(tx) {
	var sql = "SELECT * FROM Pret ORDER BY date DESC";
	tx.executeSql(sql, [], DB_getPrets_success);
}
function DB_getPrets_success(tx, results) {
    console.log("exec query getPrets");
	var len = results.rows.length;    
    
    // Affichage des prêts dans le HTML
    for (var i=0; i<len; i++) {
		// Récupération du pret courant
    	var pret = results.rows.item(i);
    	
		// Récupération date SQL du pret
    	var YMD = pret.date.split("-");
        var sqlDate = new Date();
        sqlDate.setTime(0); // mise à zéro de l'heure
        sqlDate.setFullYear(parseInt(YMD[0]), parseInt(YMD[1]) - 1, parseInt(YMD[2]));
        
		// Récupération date JS d'aujourd'hui
        var jsDateNow = new Date();
        jsDateNow.setTime(0); // mise à zéro de l'heure
        var dateNow = new Date();
        jsDateNow.setFullYear(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate());
        
		// Calcul de la durée en jours
        // C'est pourquoi, on les a mis à la même heure :
        // Un prêt enregistrer à 23h30, sera considéré comme datant d'un jour passé minuit
        var WNbJours = jsDateNow.getTime() - sqlDate.getTime();
        var duree = Math.ceil(WNbJours/(86400000)); //86400000 = 1000*3600*24
        
    	//console.log(pret.date + " - " + sqlDate + " - " + sqlDate.toLocaleDateString() + " - " + jsDateNow );
    	
    	// Ajout du prêt dans la listview
    	$content = $('<li><a onclick="getPret('+pret.id+')">' +
					'<h2>' + pret.title + '</h2>' +
					'<p><strong>' + pret.descName + '</strong></p>' +
					/*'<p class="ui-li-aside">' + YMD[2] + '/' + YMD[1] + '/' + YMD[0] + '</p>' +*/
					'<span class="ui-li-count"> En prêt depuis ' + (duree<2 ? duree +' jour' :  duree +' jours') + '</span>' +
					'</a></li>');    	
		$('#' + pret.id_categorie).after($content);
    }
    
    // on essaye un refresh car bcp de problème
	try
	{
		$('#listePrets').listview('refresh');
	}
	catch(err)
	{
		console.log(err.message);
	}
}

//Lecture d'un pret
function getPret(id)
{
	DB_openDatabase();
	
	db.transaction(function(tx){
		DB_getPret(tx, id);
	}, DB_transaction_error);
	
}
//Lecture d'un prêt dans la base de données
function DB_getPret(tx, id) {
	var sql = "SELECT * FROM Pret WHERE id="+id;
	tx.executeSql(sql, [], DB_getPret_success);
}
function DB_getPret_success(tx, results) {	
	console.log("exec query getPret");
	var pret = results.rows.item(0);
	
	//Lancement recherche du contact
	getContact(pret.descName);
	
	//Affichage des détails du prêt dans le HTML
	var YMD = pret.date.split("-");
	
	$('#Dtitle').empty();
	$('#Dtitle').append(pret.title);
	$('#DdescName').empty();
	$('#DdescName').append('Prêt accordé à ' + pret.descName);
	$('#Ddate').empty();
	$('#Ddate').append('Jour du prêt : '+ YMD[2] + '/' + YMD[1] + '/' + YMD[0]);
	$('#Dbutton').click(function(){deletePret(pret.id);});
	
	$.mobile.changePage('index.html#detail', { transition: "none"});
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
function DB_createPret(tx, intitule, contact, categorie) {
	console.log("exec query createPret");
	var sql = "INSERT INTO Pret (title, descName, date, id_categorie) VALUES ('"+intitule+"','"+contact+"', date('now'),'"+categorie+"')";
	tx.executeSql(sql);
}
// Mise à jour de l'affichage des prêts
function DB_createPret_success(){
	updateListview();
	alert('INFO : Le prêt a été inséré avec succès');
	clearForm();
	$.mobile.changePage('index.html#consultation', { transition: "none"});
}

//Effacer un prêt
function deletePret(id)
{
	DB_openDatabase();
	
	db.transaction(function(tx){
		DB_deletePret(tx, id);
	}, DB_transaction_error, DB_deletePret_success);

}
//Effacer un prêt dans la base de données
function DB_deletePret(tx, id) {
	var sql = "DELETE FROM Pret WHERE id="+id;
	tx.executeSql(sql);
}
//Actions après suppression d'un prêt
function DB_deletePret_success(tx, results) {
	updateListview();
	$.mobile.changePage('index.html#consultation', { transition: "none"});
}	

//**********************************//
//	Gestion Contacts
//**********************************//

// Récupère les contacts du téléphone
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
	
	$('#listeContacts').append('<option value="0"></option>');
	for (var i=0; i<contacts.length; i++) {
		$('#listeContacts').append('<option value="'+ i+1 +'">' + contacts[i].displayName + '</option>');
	}
}
// Erreur lors de la récupération des contacts du téléphone
function getContactsError(contactError) {
	alert('Error during loading phone contacts');
}

// Récupère les numéros de téléphone du contact
function getContact(name)
{
	var options = new ContactFindOptions();
	options.filter=name; 
	options.multiple=false; 
	var fields = ["displayName", "phoneNumbers"];
	navigator.contacts.find(fields, getContactSuccess, getContactError, options);
}
function getContactSuccess(contacts) {
	var numero = '';
	for (var i=0; i<contacts.length; i++) {
        for (var j=0; j<contacts[i].phoneNumbers.length; j++) {
           numero += '<p>'+contacts[i].phoneNumbers[j].type +' : <a href="tel:'+contacts[i].phoneNumbers[j].value+'">'+contacts[i].phoneNumbers[j].value+'</a></p>';
        }     
    }
	
	$('#DnumName').empty();
	$('#DnumName').append(numero);
}
// Erreur lors de la récupération des contacts du téléphone
function getContactError(contactError) {
	alert('Error during loading phone contact');
}


//**********************************//
// Divers
//**********************************//

// Validation du formulaire
function validateForm()
{
	  // si la valeur du champ prenom est non vide
	  if($('#intitule').val() == "" ){
		  alert("Merci de saisir un intitulé !");
		  return false;
	  }
	  else if($('#listeCategories').val() == "0"){
		  alert("Merci de sélectionner une catégorie !");
		  return false;
	  }
	  else if($('#listeContacts').val() == "0"){
		 alert("Merci de sélectionner un contact !");
		 return false;
	  }
	  else {
	    return true;
	  }
}

// Effacement du formulaire
function clearForm()
{
	$('#intitule').val("");
	
	$("#listeCategories").get(0).selectedIndex = 0;
	$('#listeCategories').selectmenu('refresh');
	
	$("#listeContacts").get(0).selectedIndex = 0;
	$('#listeContacts').selectmenu('refresh');
}

// Mise à jour de la listview prêt
function updateListview()
{
	$('#listePrets').empty();
	db.transaction(DB_getCategories, DB_transaction_error);
	db.transaction(DB_getPrets, DB_transaction_error);
}
