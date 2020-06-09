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
        this.num_ospiti_max = null;
        this.distanza_centro = null;
        this.num_letti_singoli= null;
        this.num_letti_matrimoniali = null;
        this.num_camere = null;
        this.num_bagni = null;
        this.cucina = null;
        this.lavanderia = null;
        this.aria_condizionata = null;
        this.wifi = null;
        this.colazione = null;
        this.asciugacapelli = null;
        this.tv = null;
        this.carta_igienica = null;
        this.sapone_mani_corpo = null;
        this.asciugamano = null;
        this.accappatoio = null;
        this.cuscino = null;
        this.lenzuola = null;
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