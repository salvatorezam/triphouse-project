	CREATE DATABASE IF NOT EXISTS TripHouse_DB;
	USE TripHouse_DB;

	CREATE TABLE IF NOT EXISTS UtenteRegistrato (
		ID_UR CHAR(36) PRIMARY KEY,
		nome VARCHAR(40) NOT NULL,
		cognome VARCHAR(40) NOT NULL,
		sesso CHAR(1) CHECK(sesso = 'M' OR sesso = 'F'),
		nazione_nascita VARCHAR(50) NOT NULL,
		citta_nascita VARCHAR(40) NOT NULL,
		data_nascita DATE NOT NULL,
		email VARCHAR(50) NOT NULL UNIQUE,
		telefono VARCHAR(20),
		stato_host BOOLEAN
	);

	CREATE TABLE IF NOT EXISTS Credenziali (
		email VARCHAR(50) PRIMARY KEY,
		salt CHAR(32) NOT NULL,
		password_hash CHAR(128) NOT NULL, 
		FOREIGN KEY (email) REFERENCES UtenteRegistrato(email)
	);

	CREATE TABLE IF NOT EXISTS RecensisciCliente (
		ID_RC VARCHAR(36) PRIMARY KEY,
		testo TEXT,
		data_rec DATE,
		scrittore VARCHAR(36) REFERENCES UtenteRegistrato(ID_UR),
		ricevente VARCHAR(36) REFERENCES UtenteRegistrato(ID_UR),
    	prenotazione VARCHAR(36) REFERENCES Prenotazione(ID_PREN),
		valutazione INT CHECK(valutazione >=1 AND valutazione <=5)
	);

	CREATE TABLE IF NOT EXISTS RecensisciAlloggio (
		ID_RA VARCHAR(36) PRIMARY KEY,
		testo TEXT,
		data_rec DATE,
		scrittore VARCHAR(36) REFERENCES UtenteRegistrato(ID_UR),
		alloggio VARCHAR(36) REFERENCES Alloggio(ID_ALL),
	    prenotazione VARCHAR(36) REFERENCES Prenotazione(ID_PREN),
		valutazione INT CHECK(valutazione >=1 AND valutazione <=5)
	);

	CREATE TABLE IF NOT EXISTS Alloggio (
		ID_ALL VARCHAR(36) PRIMARY KEY,
		proprietario VARCHAR(36) REFERENCES UtenteRegistrato(ID_UR),
		-- INFORMAZIONI DI BASE
		tipo_all VARCHAR(20),
		nome_proprietario VARCHAR(60),
		indirizzo VARCHAR(60),
		n_civico INT,
		cap INT,
		regione VARCHAR(60),
		citta VARCHAR(60),
		provincia VARCHAR(60),
		num_ospiti_max INT,
		distanza_centro CHAR(1) CHECK(distanza_centro = 'V' OR distanza_centro = 'M' OR distanza_centro = 'L'),
		--	SERVIZI,
		-- camere e bagni,
		num_letti_singoli INT,
		num_letti_matrimoniali INT,
		num_camere INT,
		num_bagni INT,
		-- spazi, accessori e altro
		cucina BOOLEAN,
		lavanderia BOOLEAN,
		aria_condizionata BOOLEAN,
		wifi BOOLEAN,
		colazione BOOLEAN,
		asciugacapelli BOOLEAN,
		tv BOOLEAN,
		-- servizi essenziali
		carta_igienica BOOLEAN,
		sapone_mani_corpo BOOLEAN,
		asciugamano BOOLEAN,
		accappatoio BOOLEAN,
		cuscino BOOLEAN,
		lenzuola BOOLEAN,
		-- TESTO
		titolo VARCHAR(40),
		descrizione_alloggio TEXT,
		descrizione_regole TEXT,
		note TEXT,
		tasse DECIMAL(13, 4),
		prezzo DECIMAL(13, 4),
		-- FOTO
		foto_0 VARCHAR(60),
		foto_1 VARCHAR(60),
		foto_2 varchar(60),
		foto_3 varchar(60),
		foto_4 varchar(60),
		foto_5 varchar(60)
	);

	CREATE TABLE IF NOT EXISTS DateIndisponibili (
		ID_DAT VARCHAR(36) PRIMARY KEY,
		data_inizio DATE,
		data_fine DATE,
		alloggio VARCHAR(36) REFERENCES Alloggio(ID_ALL)
	);

	CREATE TABLE IF NOT EXISTS Prenotazione (
		ID_PREN VARCHAR(36) PRIMARY KEY,
		utente VARCHAR(36) REFERENCES UtenteRegistrato(ID_UR),
		alloggio VARCHAR(36) REFERENCES Alloggio(ID_ALL),
		data_inizio DATE,
		data_fine DATE,
		data_pren DATE,
		prezzo_totale DECIMAL,
		stato_prenotazione VARCHAR(20),
		tipo_pagamento VARCHAR(20),
		tasse_pagate DECIMAL(13, 4)
	);

	CREATE TABLE IF NOT EXISTS DatiOspiti (
		ID_DO VARCHAR(36) PRIMARY KEY,
		nome VARCHAR(40),
		cognome VARCHAR(40),
		tipo_doc VARCHAR(20),
		num_doc VARCHAR(10),
		foto_fronte_doc VARCHAR(80), 
        foto_retro_doc VARCHAR(80),
		nazionalita VARCHAR(40),
		scadenza_doc DATE,
		eta INT,
		prenotazione VARCHAR(36) REFERENCES Prenotazione(ID_PREN)
	);

	CREATE TABLE IF NOT EXISTS DocumentiUtenteR(
		ID_DUR VARCHAR(36) PRIMARY KEY, 
		tipo_doc VARCHAR(20),
		num_doc VARCHAR(10),
		scadenza_doc DATE,
		foto_fronte_doc VARCHAR(80),
        foto_retro_doc VARCHAR(80),
        utente VARCHAR(36) REFERENCES UtenteRegistrato(ID_UR),
		prenotazione VARCHAR(36) REFERENCES Prenotazione(ID_PREN)
	);

	-- EVENT SCHEDULER PER STATO PRENOTAZIONE 

	SET GLOBAL event_scheduler = ON;

	CREATE EVENT IF NOT EXISTS `verifica_stato_pren` 
	ON SCHEDULE EVERY 1 DAY
	STARTS CURRENT_TIMESTAMP
	ON COMPLETION PRESERVE
	DO 
	UPDATE Prenotazione
	SET stato_prenotazione = 'conclusa'
	WHERE data_fine <= CURDATE();

	-- ###########
	-- POPOLAMENTO
	-- ###########

	INSERT INTO UtenteRegistrato VALUES (UUID(),'Marco','Rossi','M','Italia','Roma','1992-6-25','marco.rossi@gmail.com','+393324567898',false);
	INSERT INTO UtenteRegistrato VALUES (UUID(),'Giuseppe','Rosati','M','Italia','Roma','1991-8-25','g.rosati@gmail.com','+393324567898',true);
	INSERT INTO UtenteRegistrato VALUES (UUID(),'Nicola','Carovana','M','Italia','Roma','1996-2-20','nic.caro@gmail.com','+393324567898',false);
	INSERT INTO UtenteRegistrato VALUES (UUID(),'Piero','Alex','M','Italia','Roma','1990-11-11','piero.alex@gmail.com','+393324567898',false);

	INSERT INTO Credenziali VALUES ('marco.rossi@gmail.com','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','marcorossipass'); 
	INSERT INTO Credenziali VALUES ('g.rosati@gmail.com','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','giurosatipass');
	INSERT INTO Credenziali VALUES ('piero.alex@gmail.com','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','piealepass');

	INSERT INTO RecensisciCliente VALUES (UUID(),'ha lasciato tutto in ordine','2020-3-6','b9db1cb1-a99e-11ea-b30a-a066100a22be','b532de10-a99e-11ea-b30a-a066100a22be','495ea9e7-a9a0-11ea-b30a-a066100a22be','4');

	INSERT INTO Alloggio VALUES (UUID(),'b9db1cb1-a99e-11ea-b30a-a066100a22be','casa vacanza','Giuseppe','via p. trino',120,90100,'Lazio','Roma','RM',7,'M',1,1,3,1,true,false,true,true,false,false,true,true,true,true,true,true,true,'Casa Roma','casa in città de roma','nun se po fa nulla','state attenti ar cane',3.5,36,null,null,null,null,null,null);
	INSERT INTO Alloggio VALUES (UUID(),'b9db1cb1-a99e-11ea-b30a-a066100a22be','casa vacanza','Giuseppe','via catone',90,90100,'Lazio','Roma','RM',5,'M',1,1,3,1,true,false,true,true,false,false,true,true,true,true,true,true,true,'Casa Roma','casa in città de roma','nun se po fa nulla','state attenti ar cane',3.5,36,null,null,null,null,null,null);
	INSERT INTO Alloggio VALUES (UUID(),'b9db1cb1-a99e-11ea-b30a-a066100a22be','casa vacanza','Giuseppe','via tirolo',60,90100,'Lazio','Roma','RM',7,'M',1,1,3,1,true,false,true,true,false,false,true,true,true,true,true,true,true,'Casa Roma','casa in città de roma','nun se po fa nulla','state attenti ar cane',3.5,36,null,null,null,null,null,null);
	INSERT INTO Alloggio VALUES (UUID(),'f9687a45-ab51-11ea-84aa-9829a63eb004','casa vacanza','Giuseppe','via p. trino',120,90100,'Sicilia','Palermo','PA',7,'M',1,1,3,1,true,false,true,true,false,false,true,true,true,true,true,true,true,'Prova1','casa in città de roma','nun se po fa nulla','state attenti ar cane',3.5,36,'fileToUpload-1591822493509-409332266-prova_casa.jpg',null,null,null,null,null);
	INSERT INTO Alloggio VALUES (UUID(),'f9687a45-ab51-11ea-84aa-9829a63eb004','B&B','Giuseppe','via catone',90,90100,'Lazio','Roma','RM',5,'M',1,1,3,1,true,false,true,true,false,false,true,true,true,true,true,true,true,'Prova2','casa in città de roma','nun se po fa nulla','state attenti ar cane',3.5,36,'fileToUpload-1591822493516-370799831-prova_casa_2.jpg',null,null,null,null,null);
	INSERT INTO Alloggio VALUES (UUID(),'f9687a45-ab51-11ea-84aa-9829a63eb004','casa vacanza','Giuseppe','via tirolo',60,90100,'Lazio','Roma','RM',7,'M',1,1,3,1,true,false,true,true,false,false,true,true,true,true,true,true,true,'Prova3','casa in città de roma','nun se po fa nulla','state attenti ar cane',3.5,36,'fileToUpload-1591822493521-664964272-prova_casa_3.png',null,null,null,null,null);
	INSERT INTO Alloggio VALUES (UUID(),'f9687a45-ab51-11ea-84aa-9829a63eb004','casa vacanza','Giuseppe','via tirolo',60,90100,'Lazio','Roma','RM',7,'M',1,1,3,1,true,false,true,true,false,false,true,true,true,true,true,true,true,'Prova4','casa in città de roma','nun se po fa nulla','state attenti ar cane',3.5,36,'fileToUpload-1591822493521-664964272-prova_casa_3.png',null,null,null,null,null);
	INSERT INTO Alloggio VALUES (UUID(),'f9687a45-ab51-11ea-84aa-9829a63eb004','casa vacanza','Giuseppe','via tirolo',60,90100,'Lazio','Roma','RM',7,'M',1,1,3,1,true,false,true,true,false,false,true,true,true,true,true,true,true,'Provaaaaaaaaa','casa in città de roma','nun se po fa nulla','state attenti ar cane',3.5,36,'fileToUpload-1591822493521-664964272-prova_casa_3.png',null,null,null,null,null);

	INSERT INTO RecensisciAlloggio VALUES (UUID(),'mi sono trovato bene','2020-3-7','b532de10-a99e-11ea-b30a-a066100a22be','8b3d4384-a99f-11ea-b30a-a066100a22be','495ea9e7-a9a0-11ea-b30a-a066100a22be',4);

	INSERT INTO DateDisponibili VALUES (UUID(),'2020-7-1','2020-12-31','8b3d4384-a99f-11ea-b30a-a066100a22be');

	INSERT INTO Prenotazione VALUES (UUID(),'b532de10-a99e-11ea-b30a-a066100a22be','8b3d4384-a99f-11ea-b30a-a066100a22be','2020-2-20','2020-2-25','2020-1-2',100,'conclusa','in loco',0.0);
	INSERT INTO Prenotazione VALUES (UUID(),'b532de10-a99e-11ea-b30a-a066100a22be','8b4288f3-a99f-11ea-b30a-a066100a22be','2020-7-20','2020-7-25','2020-1-2',100,'pagata','in loco',0.0);
	INSERT INTO Prenotazione VALUES (UUID(),'b532de10-a99e-11ea-b30a-a066100a22be','8b4822bb-a99f-11ea-b30a-a066100a22be','2020-1-3','2020-1-5','2020-1-2',100,'conclusa','in loco',0.0);

	INSERT INTO DatiOspiti VALUES (UUID(),'Carmela','Mera','ID','AY009988','It','2022-01-01',32,'495ea9e7-a9a0-11ea-b30a-a066100a22be');
