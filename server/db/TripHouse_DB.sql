CREATE DATABASE IF NOT EXISTS TripHouse_DB;
USE TripHouse_DB;

CREATE TABLE IF NOT EXISTS UtenteRegistrato (
	ID_UR VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(40) NOT NULL,
    cognome VARCHAR(40) NOT NULL,
    sesso CHAR(1) CHECK(sesso = 'M' OR sesso = 'F'),
	nazione_nascita VARCHAR(30) NOT NULL,
    citta_nascita VARCHAR(20) NOT NULL,
	data_nascita DATE,
    email VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    stato_host BOOLEAN
);

CREATE TABLE IF NOT EXISTS Credenziali (
	email VARCHAR(36) PRIMARY KEY,
	password_hash CHAR(128) NOT NULL, 
	FOREIGN KEY (email) REFERENCES UtenteRegistrato(email)
);

CREATE TABLE IF NOT EXISTS RecensisciCliente (
	ID_RC VARCHAR(36) PRIMARY KEY,
	testo TEXT,
	data_rec DATE,
	scrittore VARCHAR(36) REFERENCES UtenteRegistrato(ID_UR),
	ricevente VARCHAR(36) REFERENCES UtenteRegistrato(ID_UR),
	valutazione INT CHECK(valutazione >=1 AND valutazione <=5)
);

CREATE TABLE IF NOT EXISTS RecensisciAlloggio (
	ID_RA VARCHAR(36) PRIMARY KEY,
	testo TEXT,
	data_rec DATE,
	scrittore VARCHAR(36) REFERENCES UtenteRegistrato(ID_UR),
	alloggio VARCHAR(36) REFERENCES Alloggio(ID_ALL),
	valutazione INT CHECK(valutazione >=1 AND valutazione <=5)
);

CREATE TABLE IF NOT EXISTS Alloggio (
	ID_ALL VARCHAR(36) PRIMARY KEY,
	proprietario VARCHAR(36) REFERENCES UtenteRegistrato(ID_UR),
	-- INFORMAZIONI DI BASE
	tipo_all VARCHAR(20),
	nome_proprietario VARCHAR(20),
	indirizzo VARCHAR(30),
	n_civico INT,
	cap INT,	<!--nuovo-->
	regione VARCHAR(20),
	citta VARCHAR(20),
	provincia VARCHAR(20),
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
	tasse DECIMAL,
	prezzo DECIMAL
    -- FOTO
);

CREATE TABLE IF NOT EXISTS DateDisponibili (
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
	stato_prenotazione VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS DatiOspiti (
	ID_DO VARCHAR(36) PRIMARY KEY,
	nome VARCHAR(40),
	cognome VARCHAR(40),
	tipo_doc CHAR(2),
	num_doc VARCHAR(10),
--	Foto_doc, 
	nazionalita CHAR(2),
	eta INT,
	prenotazione VARCHAR(36) REFERENCES Prenotazione(ID_PREN)
);


-- ###########
-- POPOLAMENTO
-- ###########

INSERT INTO UtenteRegistrato VALUES (UUID(),'Marco','Rossi','M','1992-6-25','Italia','Roma','RM','marco.rossi@gmail.com','+393324567898',false);
INSERT INTO UtenteRegistrato VALUES (UUID(),'Giuseppe','Rosato','M','1995-7-2','Italia','Roma','RM','g.rosato@gmail.com','+3933245456898',true);
INSERT INTO UtenteRegistrato VALUES (UUID(),'Luca','Pini','M','1992-6-25','Italia','Roma','RM','luca.pini@gmail.com','+393324567898',false);
INSERT INTO UtenteRegistrato VALUES (UUID(),'Santo','Robino','M','1995-7-2','Italia','Roma','RM','robino@gmail.com','+3933245456898',false);

INSERT INTO Credenziali VALUES (UUID(),'marcorossipass','a6b914f4-a752-11ea-b30a-a066100a22be'); 

INSERT INTO RecensisciCliente VALUES (UUID(),'ha lasciato tutto in ordine','2020-3-6','d4196752-a753-11ea-b30a-a066100a22be','a6b914f4-a752-11ea-b30a-a066100a22be','4');

INSERT INTO Alloggio VALUES (UUID(),'d4196752-a753-11ea-b30a-a066100a22be','casa vacanza','Giuseppe','via p. trino',120,'Lazio','Roma','RM',7,'M',1,1,3,1,true,false,true,true,false,false,true,true,true,true,true,true,true,'Casa Roma','casa in città de roma','nun se po fa nulla','state attenti ar cane',3.5,36);
INSERT INTO Alloggio VALUES (UUID(),'d4196752-a753-11ea-b30a-a066100a22be','casa vacanza','Giuseppe','via catone',90,'Lazio','Roma','RM',5,'M',1,1,3,1,true,false,true,true,false,false,true,true,true,true,true,true,true,'Casa Roma','casa in città de roma','nun se po fa nulla','state attenti ar cane',3.5,36);
INSERT INTO Alloggio VALUES (UUID(),'d4196752-a753-11ea-b30a-a066100a22be','casa vacanza','Giuseppe','via tirolo',60,'Lazio','Roma','RM',7,'M',1,1,3,1,true,false,true,true,false,false,true,true,true,true,true,true,true,'Casa Roma','casa in città de roma','nun se po fa nulla','state attenti ar cane',3.5,36);

INSERT INTO RecensisciAlloggio VALUES (UUID(),'mi sono trovato bene','2020-3-7','a6b914f4-a752-11ea-b30a-a066100a22be','2d8cdeb2-a755-11ea-b30a-a066100a22be',4);

INSERT INTO DateDisponibili VALUES (UUID(),'2020-7-1','2020-12-31','2d8cdeb2-a755-11ea-b30a-a066100a22be');

INSERT INTO Prenotazione VALUES (UUID(),'a6b914f4-a752-11ea-b30a-a066100a22be','2d8cdeb2-a755-11ea-b30a-a066100a22be','2020-2-20','2020-2-25','2020-1-2',100,'conclusa');
INSERT INTO Prenotazione VALUES (UUID(),'a6b914f4-a752-11ea-b30a-a066100a22be','a2392a58-a7e1-11ea-b30a-a066100a22be','2020-7-20','2020-7-25','2020-1-2',100,'pagata');
INSERT INTO Prenotazione VALUES (UUID(),'a6b914f4-a752-11ea-b30a-a066100a22be','a60e1593-a7e1-11ea-b30a-a066100a22be','2020-1-3','2020-1-5','2020-1-2',100,'conclusa');

INSERT INTO DatiOspiti VALUES (UUID(),'Carmela','Mera','ID','AY009988','It',32,'485ae14d-a756-11ea-b30a-a066100a22be');