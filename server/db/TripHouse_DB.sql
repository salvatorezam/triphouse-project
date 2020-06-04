CREATE DATABASE IF NOT EXISTS Prova_TripHouse_DB;
USE TripHouse_DB;

CREATE TABLE IF NOT EXISTS UtenteRegistrato (
	ID_UR CHAR(8) PRIMARY KEY,
    nome VARCHAR(40),
    cognome VARCHAR(40),
    sesso CHAR(1) CHECK(sesso = 'M' OR sesso = 'F' OR sesso = 'N'),
    data_nascita DATE,
    citta_nascita VARCHAR(20),
    prov_nascita VARCHAR(20),
    email VARCHAR(50),
    telefono VARCHAR(12),
    citta_res VARCHAR(20),
    prov_res VARCHAR(20),
    ind_res VARCHAR(30),
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
	tipo_all_gen VARCHAR(20),
	tipo_all_spec VARCHAR(20),
	num_ospiti_max INT(2),
	num_camere INT(2),
	num_letti INT(2),
	num_bagni INT(2),
	citta VARCHAR(20),
	provincia VARCHAR(20),
	indirizzo VARCHAR(30), 
	distanza_centro INT(4),
--	servizi_essenziali,
	estintore BOOLEAN,
	rilevatore_fumo BOOLEAN,
	allarme_antincendio BOOLEAN,
	salvavita BOOLEAN,
	cucina BOOLEAN,
	lavanderia BOOLEAN,
	salone BOOLEAN,
	studio BOOLEAN,
	balcone BOOLEAN,
	giardino BOOLEAN,
	piscina BOOLEAN,
	terrazza BOOLEAN,
--	FOTO,
	descrizione_alloggio TEXT,
	note TEXT,
	titolo VARCHAR(40),
	ora_check_in TIME,
	ora_check_out TIME,
	divieto_fumo BOOLEAN,
	divieto_animali BOOLEAN,
	divieto_feste BOOLEAN,
	tasse DECIMAL,
	prezzo DECIMAL
--	servizi_aggiuntivi
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