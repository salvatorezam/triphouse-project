class prenotazione {
    constructor(){
        this.utente=null;
        this.alloggio=null;
        this.data_inizio=null;
        this.data_fine=null;
        this.data_pren=null;
        this.prezzo_totale=null;
        this.stato_prenotazione=null;
        this.tipo_pagamento=null;

        console.log('prenotazione istanziata');
    }
}

module.exports=prenotazione;