//import {date_disponible, resume_du, office_du} from "./sanctoral_functions.js";

$(document).ready(function(){
  var date = new Date();
  $('#date').val(date.toDateInputValue());
  $('#dateMob').val(date.toDateInputValue());
  if (date.getHours() < 9){
    $('#office').val("laudes");
    $('#officeMob').val("laudes");
  }else if (date.getHours() < 19){
    $('#office').val("vepres");
    $('#officeMob').val("vepres");
  }else {
    $('#office').val("complies");
    $('#officeMob').val("complies");
  }
  var date = $('#date').val();
  var office = $('#office').val();
  update_office_list(office, date);
  $('#date').change(function(){
    date = $(this).val();
    $('#dateMob').val(date);
    zone =  update_office_list(office, date); 
  });
  $('#dateMob').change(function(){
    date = $(this).val();
    $('#date').val(date);
    zone =  update_office_list(office, date); 
  });
  $('#office').change(function(){
    office = $(this).val();
    $('#officeMob').val(office);
    zone = update_office_list(office, date);
  });
  $('#officeMob').change(function(){
    office = $(this).val();
    $('#office').val(office);
    zone = update_office_list(office, date);
  });
  $('.office_choice').click(function(){
    zone = $("input[type='radio'][name='radio_office']:checked").val();
    var index = $("input[type='radio'][name='radio_office']:checked").index('input[name=radio_office]');
    $("input[type='radio'][name='radio_office_mob']")[index].checked=true;
    update_office();
  });
  $('.office_choice_mob').click(function(){
    zone = $("input[type='radio'][name='radio_office_mob']:checked").val();
    var index = $("input[type='radio'][name='radio_office_mob']:checked").index('input[name=radio_office_mob]');
    $("input[type='radio'][name='radio_office']")[index].checked=true;
    update_office();
  });

  $('#psaume_invitatoire_select').change(function(){
    $('#psaume_invitatoire_selectMob').val($("#psaume_invitatoire_select").val());
    zone =  update_office_list(office, date); 
  });
  $('#psaume_invitatoire_selectMob').change(function(){
    $('#psaume_invitatoire_select').val($("#psaume_invitatoire_selectMob").val());
    zone =  update_office_list(office, date); 
  });
});



Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    //console.log(local.toJSON().slice(11,13));
    return local.toJSON().slice(0,10);
});


function update_office_list(office, date){
  var fulldate = new Date(date);
  offices_disponibles = [];
  if (office_disponible(office, date2slashedDate(date))) {
    offices_disponibles = resumes_du(office, date2slashedDate(date));
  }
  var urlAelf = "https://api.aelf.org/v1/informations/" + date + "/france"

    $.ajax({url: urlAelf,
    success: function(result){
      var ligne2 = result.informations.ligne2;
      if (result.informations.ligne3 != "") {
        ligne2 = ligne2 + " - " + result.informations.ligne3
      }
      if (result.informations.zone == "romain"){
        if (fulldate.getDay() == 0 || result.informations.degre != ""){
          offices_disponibles.push({"ligne1": result.informations.ligne1.charAt(0).toUpperCase() + result.informations.ligne1.slice(1), "ligne2": ligne2, "ligne3": "Office Romain", "zone": "romain", "rang": "haut"});
        } else {
          offices_disponibles.push({"ligne1": result.informations.ligne1.charAt(0).toUpperCase() + result.informations.ligne1.slice(1), "ligne2": ligne2, "ligne3": "Office Romain", "zone": "romain", "rang": "bas"});
        }
        display_office_list(offices_disponibles);
      } else {
        offices_disponibles.push({"ligne1": result.informations.ligne1.charAt(0).toUpperCase() + result.informations.ligne1.slice(1), "ligne2": ligne2, "ligne3": "Office Français", "zone": "france", "rang": "bas"});
        var urlAelfRomain = "https://api.aelf.org/v1/" + office + "/" + date + "/romain";
        $.ajax({url: urlAelfRomain,
          success: function(result2){
            ligne2 = result2.informations.ligne2;
            if (result2.informations.ligne3 != "") {
              ligne2 = ligne2 + " - " + result2.informations.ligne3
            }
            if (fulldate.getDay() == 0 || result.informations.degre != ""){
              offices_disponibles.push({"ligne1": result2.informations.ligne1.charAt(0).toUpperCase() + result2.informations.ligne1.slice(1), "ligne2": ligne2, "ligne3": "Office Romain", "zone": "romain", "rang": "haut"});
            } else {
              offices_disponibles.push({"ligne1": result2.informations.ligne1.charAt(0).toUpperCase() + result2.informations.ligne1.slice(1), "ligne2": ligne2, "ligne3": "Office Romain", "zone": "romain", "rang": "bas"});
            }
            display_office_list(offices_disponibles);
            update_office()
          },
          error: function(result){
            display_office_error();
          },
        });
      }
    },
    error: function(result){
      display_office_error();
    }
  });
}

function display_office_list(offices_disponibles){
  var innerHtml = "";
  var innerHtmlMob = "";
  var id = 1;
  var topOffice = 1;
  var firstZone = ""
  if (offices_disponibles.length > 1) {
    $('#multiple-choice').attr('stroke', '#fc5a03');
    $('#multiple-choice').css('opacity', '.9');
  } else {
    $('#multiple-choice').attr('stroke', '#000000');
    $('#multiple-choice').css('opacity', '.5');
  }
  for (office of offices_disponibles){
    if (office.rang == "haut"){
      topOffice = id;
    }
    if (office.rang == "Mémoire facultative") {
      topOffice++;
    }
    id++;
  }
  id = 1;
  for (office of offices_disponibles){
    innerHtml = innerHtml + "<input type=\"radio\" id=\"" + id + "\" value=\""+ office.zone + "\" name=\"radio_office\" " + (id==topOffice?"checked":"") + " /><label for=\"" + id + "\" ><span class=\"office_button\"><p>" + office.ligne1 + "<\/p><p>" + office.ligne2 + "<\/p><p>" + office.ligne3  + "<\/p></span></label>";
    innerHtmlMob = innerHtmlMob + "<input type=\"radio\" id=\"" + id + "\" value=\""+ office.zone + "\" name=\"radio_office_mob\" " + (id==topOffice?"checked":"") + " /><label for=\"" + id + "\" ><span class=\"office_button\"><p>" + office.ligne1 + "<\/p><p>" + office.ligne2 + "<\/p><p>" + office.ligne3  + "<\/p></span></label>";
    if (id == 1){
      firstZone = office.zone;
    }
    id++;
  }
  $('.office_choice').html(innerHtml);
  $('.office_choice_mob').html(innerHtmlMob);
  update_office();
}

function display_office_error(){
  var innerHtml = "<div class=\"office_button_error\"><p>Office non diponible</p>Vérifiez la date et votre connexion internet<p></p></div>";
  $('.office_choice').html(innerHtml);
}

function select_office(zone){
  //window.location.href = window.location.href + "?office=" + $('#office').val() + "&date=" + $('#date').val() + "&zone=" + zone + "&hymne=" + $('#hymne').is(":checked") + "&invitatoire=" + $('#invitatoire').val()
}

function update_liturgical_color(color){
  switch (color) {
    case "blanc":
      $("#global").removeClass();
      $("#global").addClass("color_liturgy_white");
      break;
    case "vert":
      $("#global").removeClass();
      $("#global").addClass("color_liturgy_green");
      break;
    case "rouge":
      $("#global").removeClass();
      $("#global").addClass("color_liturgy_red");
      break;
    case "violet":
      $("#global").removeClass();
      $("#global").addClass("color_liturgy_purple");
      break;
    case "rose":
      $("#global").removeClass();
      $("#global").addClass("color_liturgy_pink");
      break;
    default:
      $("#global").removeClass();
      $("#global").addClass("color_liturgy_default");
      break;
  }
}

function update_office_class(office){
  switch (office) {
    case "lectures":
      $("#global").addClass("office_lectures");
      $("#global").removeClass("office_laudes");
      $("#global").removeClass("office_vepres");
      $("#global").removeClass("office_complies");
      break;
    case "laudes":
      $("#global").addClass("office_laudes");
      $("#global").removeClass("office_lectures");
      $("#global").removeClass("office_vepres");
      $("#global").removeClass("office_complies");
      break;
    case "vepres":
      $("#global").addClass("office_vepres");
      $("#global").removeClass("office_laudes");
      $("#global").removeClass("office_lectures");
      $("#global").removeClass("office_complies");
      break;
    case "complies":
      $("#global").addClass("office_complies");
      $("#global").removeClass("office_laudes");
      $("#global").removeClass("office_vepres");
      $("#global").removeClass("office_lectures");
      break;
    default:
      break;
  }
}


function update_office(){
  var date = $('#date').val();
  var office = $('#office').val();
  var zone = $("input[type='radio'][name='radio_office']:checked").val();
	const hymne = true;
	var invitatoire = $("#psaume_invitatoire_select").val();

	var urlAelf = "https://api.aelf.org/v1/" + office + "/" + date + "/" + zone

	var contenu_franciscain = null;
	if (zone.startsWith("franciscain")) {
		contenu_franciscain = office_du(office, date2slashedDate(date), zone.split(";")[1]);
		urlAelf = "https://api.aelf.org/v1/" + office + "/" + date + "/romain"
		zone = "franciscain";
	}

	$.ajax({url: urlAelf,
		success: function(result){
			//var infos = result['informations'];
			//var textes = result[office];
			var html_text = create_office_html(office, date, zone, hymne, invitatoire, result, contenu_franciscain);

				$(".office_content").each(function(){$(this).html(html_text.texte)});
        $(".office_titre").each(function(){$(this).html(html_text.titre)});
        $(".office_sommaire").each(function(){$(this).html(html_text.sommaire)});
        window.scrollTo(0, 0);
        update_anchors();
        update_liturgical_color(html_text.couleur);
        update_office_class(office);
		},
		error: function(result){
			$(".office_content").html("<br><br><h1>Office non disponible</h1><br><br><br><br><br>")
		}
	});
}

function update_office_credits(){
  var texte_final = '<div class="office_text" id="office_text">';
  var sommaire = '<div class="office_sommaire" id="office_sommaire"><ul>';
  var titre = '<div class="office_titre" id="office_titre">';
  titre = titre.concat("<h1>Informations</h1></div>")
 
  texte_final = texte_final.concat("<div class='text_part' id='credits'>");
  sommaire = sommaire.concat("<li><a href='#credits'>Crédits</a></li>");

  texte_final = texte_final.concat("<h2> Crédits </h2>");
  texte_final = texte_final.concat("Application développée par Matthias Pasquier et Thibaut Chourré.<br><br>");
  texte_final = texte_final.concat("Textes Liturgiques issus de <a href='http://aelf.org'>AELF</a> pour les offices romains et francais. <br>Textes liturgiques issus du Sanctoral Franciscain (© Éditions franciscaines 2016) pour les offices franciscains.<br><br>");
  texte_final = texte_final.concat("Remerciements à Alexandre, Benoît, Clara, Clémence, Hugo et Matthieu pour leur aide dans la retranscription du sanctoral franciscain.  <br><br>");
  texte_final = texte_final.concat("Remerciements à Fr. Jean-François Marie Auclair et Françoise Costa pour leur aide dans les choix liturgique et dans la compréhension du bréviaire. <br><br>");
  texte_final = texte_final.concat("<br>À Dieu toute la gloire. <br>");

  texte_final = texte_final.concat("</div>");

  texte_final = texte_final.concat("<div class='text_part' id='installation'>");
  sommaire = sommaire.concat("<li><a href='#installation'>Installation</a></li>");

  texte_final = texte_final.concat("<h2> Installation </h2>");
  texte_final = texte_final.concat("Guide pour l'installation de cette application sur votre téléphone. <br><br>");
  texte_final = texte_final.concat("<h3> IOS </h3>");
  texte_final = texte_final.concat('<ul><li>Naviguer jusqu\'à cette page dans Safari <li> Appuyer sur le bouton "Partage" (<span class="material-symbols-outlined">ios_share</span>)<li>Appuyer sur "Ajouter à l\'écran d\'accueil" (<span class="material-symbols-outlined">add_box</span>)<li>Appuyer sur "Ajouter"</ul>');

  texte_final = texte_final.concat("<h3> Android </h3>");
  texte_final = texte_final.concat('<ul><li>Naviguer jusqu\'à cette page dans Chrome <li> Appuyer sur le bouton "Plus d\'informations" (<span class="material-symbols-outlined">more_vert</span>)<li>Appuyer sur "Installer l\'application" (<span class="material-symbols-outlined">install_mobile</span>)<li>Appuyer sur "Installer"</ul>');

  texte_final = texte_final.concat("</div>");



  texte_final = texte_final.concat("</div>");

  $(".office_content").each(function(){$(this).html(texte_final)});
  $(".office_titre").each(function(){$(this).html(titre)});
  $(".office_sommaire").each(function(){$(this).html(sommaire)});
  window.scrollTo(0, 0);
  update_anchors();
  update_liturgical_color("vert");
  update_office_class(office);
}
