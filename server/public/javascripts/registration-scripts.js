// Eseguiamo il codice jQuery solo dopo che il documento è stato caricato completamente
$(document).ready(function() {

    // Gestione del titolo della sezione 'Nato/a a:' --------------------------------------------------
    $('.gender').on('input', function(ev) {
        if ('F'.localeCompare($(this).val()) == 0)
            $("#p-nato").text("Nata a:");
        else
            $("#p-nato").text("Nato a:");
    });

     // Gestione dell'inserimento della password ------------------------------------------------------
    let numeri = /([0-9])/;
    let alfabeto = /([a-zA-Z])/;
    let caratteriSpeciali = /([~,!,@,#,$,%,^,&,*,-,_,+,=,?,>,<])/;

    $('#password').on('input', function(ev) {
        $('password2').val('').attr('placeholder', 'Password');
        if($('#password').val().length<8) 
            $('#password-strength-status').removeClass().addClass('weak-password text-danger').text('Password debole.');
        else if($('#password').val().match(numeri) && $('#password').val().match(alfabeto) && $('#password').val().match(caratteriSpeciali))         
            $('#password-strength-status').removeClass().addClass('strong-password text-success').text('Password forte.');
        else 
            $('#password-strength-status').removeClass().addClass('medium-password text-warning').text('Password media.');
        
    });

    $('#password2').change(function(ev) { 
        if ($(this).val() != $('#password').val()) {
            $(this).siblings('div').removeClass().html('&nbsp');
            $(this).val('').attr('placeholder', 'Password non coincidenti!').focus();
        }
        else 
            $(this).siblings('div').removeClass().addClass('text-success').text('Le password coincidono!');     
    });

    $('#regform').submit(function(ev) {
        
        $('#password').val(require('crypto').createHash('sha512').update($('#password').val()).digest('hex'));
        return true;
    });
 });