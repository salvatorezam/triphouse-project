CREATE DATABASE IF NOT EXISTS TripHouse_DB;
USE TripHouse_DB;

CREATE TABLE IF NOT EXISTS UtenteRegistrato (
	ID_UR CHAR(8) PRIMARY KEY,
    nome VARCHAR(40),
    cognome VARCHAR(40),
    sesso CHAR(1) CHECK(sesso = 'M' OR sesso = 'F' OR sesso = 'N'),
    data_nascita DATE,
	nazione_nascita VARCHAR(30),
    citta_nascita VARCHAR(20),
    prov_nascita VARCHAR(20),
    email VARCHAR(50),
    telefono VARCHAR(12),
    stato_host BOOLEAN
);

CREATE TABLE IF NOT EXISTS Credenziali (
	ID_CR CHAR(8) PRIMARY KEY, 
	password_hash VARCHAR(40), 
	utente CHAR(8) REFERENCES UtenteRegistrato(ID_UR)
);

CREATE TABLE IF NOT EXISTS RecensisciCliente (
	ID_RC CHAR(8) PRIMARY KEY,
	testo TEXT,
	data_rec DATE,
	scrittore CHAR(8) REFERENCES UtenteRegistrato(ID_UR),
	ricevente CHAR(8) REFERENCES UtenteRegistrato(ID_UR),
	valutazione INT(1) CHECK(valutazione >=1 AND valutazione <=5)
);

CREATE TABLE IF NOT EXISTS RecensisciAlloggio (
	ID_RA CHAR(8) PRIMARY KEY,
	testo TEXT,
	data_rec DATE,
	scrittore CHAR(8) REFERENCES UtenteRegistrato(ID_UR),
	alloggio CHAR(8) REFERENCES Alloggio(ID_ALL),
	valutazione INT(1) CHECK(valutazione >=1 AND valutazione <=5)
);

CREATE TABLE IF NOT EXISTS Alloggio (
	ID_ALL CHAR(8) PRIMARY KEY,
	proprietario CHAR(8) REFERENCES UtenteRegistrato(ID_UR),
	-- INFORMAZIONI DI BASE
	tipo_all VARCHAR(20),
	nome_proprietario VARCHAR(20),
	indirizzo VARCHAR(30),
	n_civico INT,
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
	--spazi, accessori e altro
	cucina BOOLEAN,
	lavanderia BOOLEAN,
	aria_condizionata BOOLEAN,
	wifi BOOLEAN,
	colazione BOOLEAN,
	asciugacapelli BOOLEAN,
	tv BOOLEAN,
	--servizi essenziali
	carta_igienica BOOLEAN,
	sapone_mani_corpo BOOLEAN,
	asciugamano BOOLEAN,
	accappatoio BOOLEAN,
	cuscino BOOLEAN,
	lenzuola BOOLEAN,
	--TESTO
	titolo VARCHAR(40),
	descrizione_alloggio TEXT,
	descrizione_regole TEXT,
	note TEXT,
	tasse DECIMAL,
	prezzo DECIMAL
--	FOTO,
);

CREATE TABLE IF NOT EXISTS DateDisponibili (
	ID_DAT CHAR(8) PRIMARY KEY,
	data_inizio DATE,
	data_fine DATE,
	alloggio CHAR(8) REFERENCES Alloggio(ID_ALL)
);

CREATE TABLE IF NOT EXISTS Prenotazione (
	ID_PREN CHAR(8) PRIMARY KEY,
	utente CHAR(8) REFERENCES UtenteRegistrato(ID_UR),
	alloggio CHAR(8) REFERENCES Alloggio(ID_ALL),
	data_inizio DATE,
	data_fine DATE,
	data_pren DATE,
	prezzo_totale DECIMAL,
	stato_prenotazione VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS DatiOspiti (
	ID_DO CHAR(8) PRIMARY KEY,
	nome VARCHAR(40),
	cognome VARCHAR(40),
	tipo_doc CHAR(2),
	num_doc VARCHAR(10),
--	Foto_doc, 
	nazionalita CHAR(2),
	eta INT(3),
	prenotazione CHAR(8) REFERENCES Prenotazione(ID_PREN)
);