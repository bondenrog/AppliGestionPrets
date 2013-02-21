var dbCreated = false;

// On attend que cordova se charge avant de lancer quoi que ce soit
document.addEventListener("deviceready", onDeviceReady, false);

//Cordova est pr�t donc on lance le script
function onDeviceReady() {
	console.log("opening database");
    db = window.openDatabase("DB_Pret", "1.0", "DB_Pret", 200000);
    console.log("database opened");
    
    if (dbCreated)
    	db.transaction(getPrets, transaction_error);
    else
    	db.transaction(populateDB, transaction_error, populateDB_success);
}

function transaction_error(tx, error) {
    alert("Database Error: " + error);
}

function populateDB_success() {
	dbCreated = true;
    db.transaction(getPrets, transaction_error);
}

function getPrets(tx) {
	var sql = "SELECT * FROM Pret ";
	tx.executeSql(sql, [], getPrets_success);
}

function getPrets_success(tx, results) {
    var len = results.rows.length;
    for (var i=0; i<len; i++) {
    	var pret = results.rows.item(i);
    	$('#listePrets').append('<li><a href="#detail" data-transition="none">'+pret.title+'</a></li>');
		/*$('#employeeList').append('<li><a href="employeedetails.html?id=' + employee.id + '">' +
				'<img src="pics/' + employee.picture + '" class="list-icon"/>' +
				'<p class="line1">' + employee.firstName + ' ' + employee.lastName + '</p>' +
				'<p class="line2">' + employee.title + '</p>' +
				'<span class="bubble">' + employee.reportCount + '</span></a></li>');*/
    }
	db = null;
}

function populateDB(tx)
{
	console.log("populateDB");
	
	tx.executeSql('DROP TABLE IF EXISTS Pret');
	var sql = 
		"CREATE TABLE IF NOT EXISTS Pret ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"title VARCHAR(50), " +
		"firstName VARCHAR(50), " +
		"lastName VARCHAR(50) " +		
		")";
    tx.executeSql(sql);
    console.log("database created");
    tx.executeSql("INSERT INTO Pret (id,title,firstName,lastName) VALUES (10,'PC3','Steven','Wells')");
    tx.executeSql("INSERT INTO Pret (id,title,firstName,lastName) VALUES (9,'PC2','Steven','Wells')");
    tx.executeSql("INSERT INTO Pret (id,title,firstName,lastName) VALUES (8,'PC1','Steven','Wells')");
    tx.executeSql("INSERT INTO Pret (id,title,firstName,lastName) VALUES (7,'CD','Steven','Wells')");
    tx.executeSql("INSERT INTO Pret (id,title,firstName,lastName) VALUES (6,'Cartes','Steven','Wells')");
    tx.executeSql("INSERT INTO Pret (id,title,firstName,lastName) VALUES (5,'Dés','Steven','Wells')");
    tx.executeSql("INSERT INTO Pret (id,title,firstName,lastName) VALUES (4,'Cable USB','Steven','Wells')");
    tx.executeSql("INSERT INTO Pret (id,title,firstName,lastName) VALUES (3,'BMW','Steven','Wells')");
    tx.executeSql("INSERT INTO Pret (id,title,firstName,lastName) VALUES (2,'Argent','Steven','Wells')");
    tx.executeSql("INSERT INTO Pret (id,title,firstName,lastName) VALUES (1,'Livre1','Steven','Wells')");
    
}