//import {date_disponible, resume_du, office_du} from "./sanctoral_functions.js";

$(document).ready(function(){
  $('#date').val(new Date().toDateInputValue());

  var date = $('#date').val();
  var office = $('#office').val();
  update_office_list(office, date);
  $('#date').change(function(){
    date = $(this).val();
    zone =  update_office_list(office, date); 
  });
  $('#office').change(function(){
    office = $(this).val();
    zone = update_office_list(office, date);
  });
  $('.office_choice').change(function(){
    zone = $("input[type='radio'][name='radio_office']:checked").val();
    update_office();
  })
  $('#psaume_invitatoire_select').change(function(){
    zone =  update_office_list(office, date); 
  });
});

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    console.log(local.toJSON().slice(11,13));
    return local.toJSON().slice(0,10);
});


function update_office_list(office, date){
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
        offices_disponibles.push({"ligne1": result.informations.ligne1.charAt(0).toUpperCase() + result.informations.ligne1.slice(1), "ligne2": ligne2, "ligne3": "Office Romain", "zone": "romain"});
        display_office_list(offices_disponibles);
      } else {
        offices_disponibles.push({"ligne1": result.informations.ligne1.charAt(0).toUpperCase() + result.informations.ligne1.slice(1), "ligne2": ligne2, "ligne3": "Office Français", "zone": "france"});
        var urlAelfRomain = "https://api.aelf.org/v1/" + office + "/" + date + "/romain";
        $.ajax({url: urlAelfRomain,
          success: function(result2){
            ligne2 = result2.informations.ligne2;
            if (result2.informations.ligne3 != "") {
              ligne2 = ligne2 + " - " + result2.informations.ligne3
            }
            offices_disponibles.push({"ligne1": result2.informations.ligne1.charAt(0).toUpperCase() + result2.informations.ligne1.slice(1), "ligne2": ligne2, "ligne3": "Office Romain", "zone": "romain"});
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
  var id = 1;
  var firstZone = ""
  for (office of offices_disponibles){
    innerHtml = innerHtml + "<input type=\"radio\" id=\"" + id + "\" value=\""+ office.zone + "\" name=\"radio_office\" " + (id==1?"checked":"") + " /><label for=\"" + id + "\" ><span class=\"office_button\"><p>" + office.ligne1 + "<\/p><p>" + office.ligne2 + "<\/p><p>" + office.ligne3  + "<\/p></span></label>";
    if (id == 1){
      firstZone = office.zone;
    }
    id++;
  }
  $('.office_choice').html(innerHtml);
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

				$(".office_content").html(html_text.texte);
        $(".office_titre").html(html_text.titre);
        $(".office_sommaire").html(html_text.sommaire);
        update_anchors();
        update_liturgical_color(html_text.couleur);
		},
		error: function(result){
			$(".office_content").html("<br><br><h1>Office non disponible</h1><br><br><br><br><br>")
		}
	});
}
