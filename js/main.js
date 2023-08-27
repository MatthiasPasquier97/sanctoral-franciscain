$(document).ready(function(){
  //window.location.reload();
  const cookieValue = document.cookie.split('; ').find((row) => row.startsWith('fontSize='))?.split('=')[1];
  if (cookieValue != undefined) {
    document.getElementById("global_container").style.fontSize = cookieValue + "px";
  }
});


$(document).ready(function(){
  $("#projection").click(function(){
    toggleFullScreen();
  });
  $("#stop_projection").click(function(){
    toggleFullScreen();
  });
  $(document).on('mozfullscreenchange webkitfullscreenchange fullscreenchange',function(){
    breviary_toggle_fullscreen();
  });
  $("#settings").click(function(){
    $(".settings_menu").toggleClass("displayNone");
  });
  $("#hymne_toggle").click(function(){
    $("[id=hymne]").each(function(){
      $(this).toggleClass("displayNone");
    })
  });
  $("#hymne_toggleMob").click(function(){
    $("[id=hymne]").each(function(){
      $(this).toggleClass("displayNone");
    })
  });
});

function breviary_toggle_fullscreen(){
  $('.full_screen').toggleClass("displayNone");
  $('.main_site').toggleClass("displayNone");
  update_anchors();
}


function toggleFullScreen() {
  console.log("fs");
  if (!document.fullscreenElement &&    // alternative standard method
  !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
   if (document.documentElement.requestFullscreen) {
     document.documentElement.requestFullscreen();
   } else if (document.documentElement.mozRequestFullScreen) {
     document.documentElement.mozRequestFullScreen();
   } else if (document.documentElement.webkitRequestFullscreen) {
     document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
   }
  } else {
    if (document.cancelFullScreen) {
       document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
       document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}

function zoom_in(){
  var obj = document.getElementById("global_container");
  var newVal = Math.min((parseFloat(obj.style.fontSize, 10) + 1), 40);
  obj.style.fontSize = newVal + "px";
  var exp = new Date(new Date().setDate(new Date().getDate() + 1000));
  document.cookie = "fontSize=" + newVal + "; SameSite=Lax; Expires=" + exp.toUTCString() + " Secure";
}

function zoom_out(){
  var obj = document.getElementById("global_container");
  var newVal = Math.max((parseFloat(obj.style.fontSize, 10) - 1), 10);
  obj.style.fontSize = newVal + "px";
  var exp = new Date(new Date().setDate(new Date().getDate() + 1000));
  document.cookie = "fontSize=" + newVal + "; SameSite=Lax; Expires=" + exp.toUTCString() + " Secure";
}


// menu sub-menu
$(document).ready(function() {
  $("#plus").click(function(){
    $(".dropdown").addClass("active");
  });

/*  $("#submenu").click(function(){
    $(".dropdown").addClass("active");
  });
*/

  $(document).on("click", function(a) {
    if ($(a.target).is("#plus, #submenu") === false) {
      if (!(document.getElementById('menuZoom').contains(a.target))){
        $(".dropdown").removeClass("active");
      }

    }
  });
});

// menu mobile
$(document).ready(function() {
  $("#calendar").click(function(){
    $("body").addClass("calendar-open");
    $('body').addClass("background-open")
  });

  $("#setting").click(function(){
    $("body").addClass("setting-open");
    $('body').addClass("background-open")
  });

  $("#menu-mobile").click(function(){
    $("body").addClass("menu-open");
    $('body').addClass("background-open")
  });

  $("#multiple-choice").click(function(){
    $("body").addClass("multiple-choice-open");
    $('body').addClass("background-open")
  });

  $("#background, span.close").click(function(){
    $("body").removeClass("calendar-open");
    $("body").removeClass("setting-open");
    $("body").removeClass("menu-open");
    $('body').removeClass("background-open");
    $('body').removeClass("multiple-choice-open");
  });

});
