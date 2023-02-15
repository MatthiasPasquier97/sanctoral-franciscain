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
  var obj = document.getElementById("office_text");
  var topVal = parseFloat(obj.style.fontSize, 10);
  obj.style.fontSize = (topVal * 1.1) + "vw";
}

function zoom_out(){
  var obj = document.getElementById("office_text");
  var topVal = parseFloat(obj.style.fontSize, 10);
  obj.style.fontSize = (topVal * 0.9) + "vw";
}


// menu sub-menu
$(document).ready(function() {
  $("#plus").click(function(){
    $(".dropdown").toggleClass("active");
  });

  $(document).on("click", function(a) {
    if ($(a.target).is(".dropdown, #plus, #submenu") === false) {
      $(".dropdown").removeClass("active");
    }
  });
});