class Alloggio{

    constructor(){
        this.proprietario = null ;
        this.tipo_all = null; 
        this.nome_proprietario = null;
        this.indirizzo = null;
        this.n_civico = null;
        this.cap = null;
        this.regione = null;
        this.citta = null; 
        this.provincia = null; 
        this.num_ospiti = null;
        this.distanza_centro = null;
        this.num_letti_singoli= null;
        this.num_letti_matrimoniali = null;
        this.num_camere = null;
        this.num_bagni = null;
        this.cucina = false;
        this.lavanderia = false;
        this.aria_condizionata = false;
        this.wifi = false;
        this.colazione = false;
        this.asciugacapelli = false;
        this.tv = false;
        this.carta_igienica = false;
        this.sapone_mani_corpo = false;
        this.asciugamano = false;
        this.accappatoio = false;
        this.cuscino = false;
        this.lenzuola = false;
        this.titolo = null;
        this.descrizione_alloggio = null;
        this.descrizione_regole = null;
        this.note = null;
        this.tasse = null;
        this.prezzo = null;
        
        console.log('alloggio istanziato');
    }
}

module.exports = Alloggio;