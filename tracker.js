var request = require("request")
var express = require('express')
var fs = require('fs')
var sendmail = require('sendmail')()
var exec = require('child_process').exec

var app = express()

function checkPlaces() {
    request({
      uri: "http://www.tgsevenements.com/billeterie-lien-etape1-16.htm",
    }, function(error, response, body) {

        var nbrRouge = body.split('<div> Stock : <div style="background-color: #00ff42; width:50px; height: 10px;"><div style="background-color: #ff1b1b; width:')[1].split('px; height: 10px;float:left;"></div>')[0];
        var nbr = nbrRouge / 50 * 100;
        var nbrArrondi = Math.round(nbr*100)/100
        var nbrrestant = 100 - nbrArrondi
        console.log(nbrArrondi + "% des places prises");
        console.log(nbrrestant + "% des places restantes");

        var ladate = Date.now() / 1000 | 0
        var delai = 86400
        var lastdate = fs.readFileSync('lastmailsent', 'utf8')
        var resultDate = ladate - lastdate;

        if (resultDate > delai){
            fs.writeFile('./lastmailsent', ladate, function (err) {
              if (err) throw err;
              console.log('Date sauvegardée');
            });

            exec('echo "Nombre de places disponibles : ' + nbrrestant + '%" | mail -s "Alerte places TGS" soapmctravich@gmail.com', function (error, stdout, stderr) {
                console.log("Envoi du mail journalier " + stdout);
                console.log("Erreur: " + stderr);
            });
        }else{
            console.log("Date d'aujourd'hui: " + ladate + " lastdate: " + lastdate + " Result: " + resultDate);
        }
    });

    setTimeout(checkPlaces, 60*60*1000);
}

setTimeout(checkPlaces, 1);

app.listen(8080);
