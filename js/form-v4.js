//import {date_disponible, resume_du, office_du} from "./sanctoral_functions.js";

$(document).ready(function(){
  var date = new Date();
  $('#date').val(date.toDateInputValue());
  $('#dateMob').val(date.toDateInputValue());
  if (date.getHours() < 10){
    $('#office').val("laudes");
    $('#officeMob').val("laudes");
  }else if (date.getHours() < 12){
    $('#office').val("tierce");
    $('#officeMob').val("tierce");
  }else if (date.getHours() < 14){
    $('#office').val("sexte");
    $('#officeMob').val("sexte");
  }else if (date.getHours() < 16){
    $('#office').val("none");
    $('#officeMob').val("none");
  }else if (date.getHours() < 20){
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
    update_office(0);
  });
  $('.office_choice_mob').click(function(){
    zone = $("input[type='radio'][name='radio_office_mob']:checked").val();
    var index = $("input[type='radio'][name='radio_office_mob']:checked").index('input[name=radio_office_mob]');
    $("input[type='radio'][name='radio_office']")[index].checked=true;
    update_office(0);
  });

 /* $('#psaume_invitatoire_select').change(function(){
    $('#psaume_invitatoire_selectMob').val($("#psaume_invitatoire_select").val());
    zone =  update_office_list(office, date); 
  });
  $('#psaume_invitatoire_selectMob').change(function(){
    $('#psaume_invitatoire_select').val($("#psaume_invitatoire_selectMob").val());
    zone =  update_office_list(office, date); 
  });*/
});


function invitatoire_update(invit_select){
  let elements = document.getElementsByClassName("psaume_invitatoire_select");
  for (let i = 0; i < elements.length; i++) {
    elements[i].value = invit_select.value;
  }
  update_office(2);
}

function hymne_update(select_element){
  let elements = document.getElementsByClassName("hymne_select");
  for (let i = 0; i < elements.length; i++) {
    elements[i].value = select_element.value;
  }
  update_office(2);
}


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
  if (office != "messes") {
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
            update_office(0);
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
  } else {
    if (messe_disponible(date2slashedDate(date))) {
      offices_disponibles = messe_resume_du(date2slashedDate(date));
    }

    var urlAelf = "https://api.aelf.org/v1/messes/" + date + "/romain"
    $.ajax({url: urlAelf,
      success: function(result){
        var index = 0;
        for (const iterator of result.messes) {
          offices_disponibles.push({"ligne1": result.informations.ligne1.charAt(0).toUpperCase() + result.informations.ligne1.slice(1), "ligne2": iterator["nom"] == "Messe du jour" ? result.informations.ligne2 : iterator["nom"], "ligne3": "Office Romain", "zone": "romain;" + index , "rang": "bas"});
          index++;
        }
        display_office_list(offices_disponibles);
        //update_office(1);
      },
      error: function(result){
        display_office_error();
      }
    });
  }
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
    $('#multiple-choice').css('filter', 'invert(0)');
  } else {
    $('#multiple-choice').attr('stroke', '#000000');
    $('#multiple-choice').css('opacity', '.5');
    $('#multiple-choice').css('filter', '');
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
  update_office(0);
}

function display_office_error(){
  //var innerHtml = "<div class=\"office_button_error\"><p>Office non disponible</p></div>";
  $('.office_choice').html("");
  $(".office_biographie").each(function(){$(this).html("")});
  $(".office_titre").each(function(){$(this).html("")});
  $(".office_sommaire").each(function(){$(this).html("<ul><li><a href='.' class='anchor_selected'>Retour à la date actuelle</li></ul>")});
  update_liturgical_color("noir");
  $(".office_content").html("<h1>Cet office n'est pas disponible</h1><p>Si vous voyez cet écran, vous n'avez pas de connexion à internet ou vous avez sélectionné une date éloignée de plusieurs mois de la date du jour. Pour l'une de ces raisons, l'office demandé ne peut pas être affiché.</p><p>Si vous êtes connectés à internet, vous pouvez afficher un office plus proche de la date actuelle en sélectionnant une nouvelle date, ou en appuyant sur le bouton de retour qui vous ramènera à l'office le plus proche de votre heure actuelle.</p><p>Si vous n'êtes pas connectés à internet, BreF propose la consultation des offices hors ligne des 7 jours suivants la date actuelle, à la condition que ceux-ci aient été chargés auparavant en visitant l'application en étant connecté à internet.</p>");
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


function update_office(scroll=0){
  var date = $('#date').val();
  var office = $('#office').val();
  var zone = $("input[type='radio'][name='radio_office']:checked").val();
	const hymne = true;
  let elements = document.getElementsByClassName("psaume_invitatoire_select");
	var invitatoire = elements.length > 0 ? elements[0].value : 94;  


	var urlAelf = "https://api.aelf.org/v1/" + office + "/" + date + "/" + zone.split(";")[0];

	var contenu_franciscain = null;
	if (office != "messes") {
    if (zone.startsWith("franciscain")) {
		  contenu_franciscain = office_du(office, date2slashedDate(date), zone.split(";")[1]);
		  urlAelf = "https://api.aelf.org/v1/" + office + "/" + date + "/romain"
		  zone = "franciscain";
    }
  } else {
    if (zone.startsWith("franciscain")) {
		  contenu_franciscain = messe_du(date2slashedDate(date));
		  urlAelf = "https://api.aelf.org/v1/" + office + "/" + date + "/romain"
		  zone = "franciscain";
    }
	}

	$.ajax({url: urlAelf,
		success: function(result){

      if (office != "messes") {
        let elements_hymne = document.getElementsByClassName("hymne_select");
        //Si pas encore de selecteurs affiché, ou si update de type retour à zéro, on choisit l'hymne d'aelf
        var hymne_selected = (elements_hymne.length > 0 ) ? elements_hymne[0].value : result[office].hymne.titre;
        if (scroll == 0){ 
          hymne_selected = result[office].hymne.titre;
        }
      }


			var html_text = create_office_html(office, date, zone, hymne, invitatoire, result, contenu_franciscain, hymne_selected);

				$(".office_content").each(function(){$(this).html(html_text.texte)});
        $(".office_titre").each(function(){$(this).html(html_text.titre)});
        $(".office_sommaire").each(function(){$(this).html(html_text.sommaire)});
        //this probably should be done in breviaire.js for consistency
        if (contenu_franciscain != null){
          $(".office_biographie").each(function(){$(this).html("<div class='text_part biographie' id='biographie'><h2>" + contenu_franciscain.informations.titre + "</h2>" + contenu_franciscain.biographie + "</div><hr>")});  
        }else{
          $(".office_biographie").each(function(){$(this).html("")});
        }
        update_anchors();
        update_liturgical_color(html_text.couleur);
        update_office_class(office);
        switch (scroll) {
          case 0:
            var element_to_scroll_to = document.getElementById('firstScroll');
            if (window.scrollY < 1000) {
              setTimeout(function(){
                //timeout to avoid scrolling to the wrong position on initial load
                element_to_scroll_to.scrollIntoView({behavior: "instant"});
              }, 10);
            } else {
              element_to_scroll_to.scrollIntoView({behavior: "smooth"});
            }
            break;
          case 1:
            var element_to_scroll_to = document.getElementById('firstScroll');
            element_to_scroll_to.scrollIntoView({behavior: "instant"});
            break;
          case 2:
            //no scroll (like for invitatoire)
            break;
          default:
            break;
        }
        if (office == "laudes") {
          let elements = document.getElementsByClassName("psaume_invitatoire_select");
          for (let i = 0; i < elements.length; i++) {
            elements[i].value = invitatoire;
          }
        }
        if (office == "laudes" || office == "vepres" || office == "lectures") {
          let elements = document.getElementsByClassName("hymne_select");
          for (let i = 0; i < elements.length; i++) {
            elements[i].value = hymne_aelf2bref(hymne_selected);
          }
        }
		},
		error: function(result){
			display_office_error();
      //$(".office_content").html("<br><br><h1>Office non disponible</h1><br><br><br><br><br>")
		}
	});
}

function update_office_credits(){
  var texte_final = '<div class="office_text" id="office_text">';
  var sommaire = '<div class="office_sommaire" id="office_sommaire"><ul>';
  var titre = '<div class="office_titre" id="office_titre">';
  titre = titre.concat("<h1>Informations</h1></div>")
 
  texte_final = texte_final.concat("<div class='text_part' id='credits'>");
  sommaire = sommaire.concat("<li><a href='.'>Retour à la date actuelle</a></li>");
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

  $(".office_biographie").each(function(){$(this).html("")});
  $(".office_content").each(function(){$(this).html(texte_final)});
  $(".office_titre").each(function(){$(this).html(titre)});
  $(".office_sommaire").each(function(){$(this).html(sommaire)});
  $("body").removeClass("menu-open");
  $('body').removeClass("background-open");
  window.scrollTo(0, 0);
  update_anchors();
  update_liturgical_color("vert");
  update_office_class(office);
}


function update_office_installation(){
  var texte_final = '<div class="office_text" id="office_text">';
  var sommaire = '<div class="office_sommaire" id="office_sommaire"><ul>';
   sommaire = sommaire.concat("<li><a href='.'>Retour à la date actuelle</a></li>");

  texte_final = texte_final.concat("<div class='text_part' id='installation'>");
  sommaire = sommaire.concat("<li><a href='#installation'>Installation</a></li>");

  //texte_final = texte_final.concat("<h2> Installation </h2>");
  texte_final = texte_final.concat("Pour installer cette application sur votre téléphone. <br><br>");
  texte_final = texte_final.concat("<h3> iOS </h3>");
  texte_final = texte_final.concat('<ul><li> Appuyer sur le bouton "Partage" (<span class="material-symbols-outlined">ios_share</span>)<li>Appuyer sur "Ajouter à l\'écran d\'accueil" (<span class="material-symbols-outlined">add_box</span>)<li>Appuyer sur "Ajouter"</ul>');

  texte_final = texte_final.concat("<h3> Android </h3>");
  texte_final = texte_final.concat('<ul><li> Appuyer sur le bouton "Plus d\'informations" (<span class="material-symbols-outlined">more_vert</span>)<li>Appuyer sur "Installer l\'application" (<span class="material-symbols-outlined">install_mobile</span>)<li>Appuyer sur "Installer"</ul>');

  texte_final = texte_final.concat("</div>");


  $(".office_biographie").each(function(){$(this).html("")});
  $(".office_content").each(function(){$(this).html(texte_final)});
  $(".office_titre").each(function(){$(this).html("")});
  $(".office_sommaire").each(function(){$(this).html(sommaire)});
  $("body").removeClass("menu-open");
  $('body').removeClass("background-open");
  window.scrollTo(0, 0);
  update_anchors();
  update_liturgical_color("vert");
  update_office_class(office);
}

function update_office_consecrations(){
  var texte_final = '<div class="office_text" id="office_text">';
  var sommaire = '<div class="office_sommaire" id="office_sommaire"><ul>';
  var titre = '<div class="office_titre" id="office_titre">';
  titre = titre.concat("<h1>Consécrations à Marie</h1></div>")
 
  texte_final = texte_final.concat("<div class='text_part' id='maximilien' style='margin-top: 0px;'>");
  sommaire = sommaire.concat("<li><a href='.'>Retour à la date actuelle</a></li>");
  sommaire = sommaire.concat("<li><a href='#maximilien'>St Maximilien-Marie Kolbe</a></li>");

  texte_final = texte_final.concat("<h2> Consécration de St Maximilien-Marie Kolbe </h2>");
  texte_final = texte_final.concat("Immaculée Conception, Reine du ciel et de la terre, Refuge des pécheurs et Mère très aimante, à qui Dieu voulut confier tout l’ordre de la Miséricorde, me voici à tes pieds, moi, pauvre pécheur.<br>");
  texte_final = texte_final.concat("<br>Je t’en supplie, accepte mon être tout entier comme ton bien et ta propriété ; agis en moi selon ta volonté, en mon âme et mon corps, en ma vie, ma mort et mon éternité.<br>");
  texte_final = texte_final.concat("<br>Dispose avant tout de moi comme tu le désires, pour que se réalise enfin ce qui est dit de toi : « La Femme écrasera la tête du serpent » et aussi « Toi seule vaincras les hérésies dans le monde entier ».<br>");
  texte_final = texte_final.concat("<br>Qu’en tes mains toutes pures, si riches de miséricorde, je devienne un instrument de ton amour, capable de ranimer et d’épanouir pleinement tant d’âmes tièdes ou égarées.<br>");
  texte_final = texte_final.concat("<br>Ainsi s’étendra sans fin le Règne du Coeur divin de Jésus. Vraiment, ta seule présence attire les grâces qui convertissent et sanctifient les âmes, puisque la Grâce jaillit du Coeur divin de Jésus sur nous tous, en passant par tes mains maternelles.<br>");
  texte_final = texte_final.concat("<br>Amen.");

  texte_final = texte_final.concat("</div>");



  texte_final = texte_final.concat("<div class='text_part' id='mariemamere'>");
  sommaire = sommaire.concat("<li><a href='#mariemamere'>Ô Marie ma Mère</a></li>");

  texte_final = texte_final.concat("<h2> Ô Marie ma Mère </h2>");
  texte_final = texte_final.concat("Ô Marie ma Mère je me donne à toi, prends-moi dans ton cœur Immaculé. Avec toi je veux aimer Jésus comme tu l'aimes. Je te consacre mon corps et mon âme, mes dons et mes biens, pour que tout en moi glorifie le Seigneur. Puisque je t'appartiens, fais de moi ce qu'il te plaira ; je suis ton enfant et je t'aime.");

  texte_final = texte_final.concat("</div>");



  texte_final = texte_final.concat("<div class='text_part' id='louis'>");
  sommaire = sommaire.concat("<li><a href='#louis'>St Louis-Marie Grignion de Monfort</a></li>");

  texte_final = texte_final.concat("<h2> Consécration de St Louis-Marie Grignion de Monfort </h2>");
  texte_final = texte_final.concat("Je te choisis aujourd'hui, ô Marie, en présence de toute la Cour céleste pour ma Mère et ma Reine.<br>");
  texte_final = texte_final.concat("<br>Je te livre et consacre, en toute soumission et amour mon corps et mon âme, mes biens intérieurs et extérieurs, et la valeur même de mes bonnes actions passées, présentes et futures, te laissant un entier et plein droit de disposer de moi et de tout ce qui m'appartient sans exception, selon ton bon plaisir, à la plus grande Gloire de Dieu dans le temps et l'éternité. <br>");
  texte_final = texte_final.concat("<br>Amen.");

  texte_final = texte_final.concat("</div>");



  texte_final = texte_final.concat("<div class='text_part' id='mission'>");
  sommaire = sommaire.concat("<li><a href='#mission'>Mission de l'Immaculée</a></li>");

  texte_final = texte_final.concat("<h2> Consécration quotidienne de la Mission de l'Immaculée </h2>");
  texte_final = texte_final.concat("Vierge Immaculée, ma mère, Marie, je renouvelle aujourd’hui et pour toujours, la consécration de tout mon être, pour que tu disposes de moi pour le salut des âmes. <br>");
  texte_final = texte_final.concat("<br>Je te demande seulement, ô ma reine et mère de l’Église, de participer fidèlement à ta mission pour que s’établisse le règne de Jésus dans le monde. <br>");
  texte_final = texte_final.concat("<br>Je t’offre donc, ô cœur immaculé de Marie, les prières, les actions et les sacrifices de ce jour.<br>");


  texte_final = texte_final.concat("</div>");


  texte_final = texte_final.concat("<div class='text_part' id='familles'>");
  sommaire = sommaire.concat("<li><a href='#familles'>Consécration des familles</a></li>");

  texte_final = texte_final.concat("<h2> Consécration des familles </h2>");
  texte_final = texte_final.concat("Immaculée Conception, Reine du Ciel et de la Terre, Refuge des pécheurs et Mère très aimante, à qui Dieu voulut confier tout l'ordre de la Miséricorde, nous voici à tes pieds, nous, pauvres pécheurs.<br>");
  texte_final = texte_final.concat("<br>En ce jour, ô Notre-Dame, nous renouvelons la Consécration de tout nous-mêmes à ton Cœur Immaculé. Nous te confions toutes nos familles et celles du monde entier, en particulier les plus fragiles, et celles qui sont persécutées à cause de leur foi. Nous te confions nos enfants, nos personnes âgées, nos malades et tous nos défunts.<br>");  
  texte_final = texte_final.concat("<br>Fais de toutes nos familles des foyers qui s'ouvrent à l'écoute de la Parole de Dieu et à la pratique des sacrements, avec la joie de vivre dans la foi, l'espérance et la charité. Qu'elles soient ton bien et ta propriété.<br>");  
  texte_final = texte_final.concat("<br>Agis en chacun de leurs membres selon ta volonté en leurs âmes, en leurs corps, en leurs vies, leurs morts et leur éternité. Qu'en tes mains toutes pures, si riches de miséricorde, Ils reçoivent les sept dons du Saint Esprit et tous les charismes nécessaires pour se donner à l'évangélisation du monde, dans tous les domaines de l'activité humaine.<br>");  
  texte_final = texte_final.concat("<br>Ainsi s'étendra sans fin, le règne du Cœur Divin de Jésus. Vraiment ta seule présence attire les grâces qui convertissent et sanctifient les âmes, puisque la Grâce jaillit du Coeur Sacré de Jésus sur nous tous, en passant par tes mains maternelles.<br>");  
  texte_final = texte_final.concat("<br>Amen.");


  $(".office_biographie").each(function(){$(this).html("")});
  $(".office_content").each(function(){$(this).html(texte_final)});
  $(".office_titre").each(function(){$(this).html("")});
  $(".office_sommaire").each(function(){$(this).html(sommaire)});
  $("body").removeClass("menu-open");
  $('body').removeClass("background-open");
  window.scrollTo(0, 0);
  update_anchors();
  update_liturgical_color("vert");
  update_office_class(office);
}
