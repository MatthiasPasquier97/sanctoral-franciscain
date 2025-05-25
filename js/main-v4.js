var screenLock;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js?v=3')
      .then((registration) => {
        console.log('Service Worker enregistré avec succès :', registration);
      })
      .catch((error) => {
        console.error('Échec de l’enregistrement du Service Worker :', error);
      });
  });
}

$(document).ready(function(){
  //window.location.reload();
  const cookieValue = document.cookie.split('; ').find((row) => row.startsWith('fontSize='))?.split('=')[1];
  if (cookieValue != undefined) {
    document.getElementById("global_container").style.fontSize = cookieValue + "px";
  }
  getScreenLock();
});

document.addEventListener('visibilitychange', async () => {
  if (screenLock !== null && document.visibilityState === 'visible') {
    screenLock = await navigator.wakeLock.request('screen');
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
  var exp = new Date(new Date().setDate(new Date().getDate() + 90));
  document.cookie = "fontSize=" + newVal + "; SameSite=Lax; Expires=" + exp.toUTCString() + " Secure";
}

function zoom_out(){
  var obj = document.getElementById("global_container");
  var newVal = Math.max((parseFloat(obj.style.fontSize, 10) - 1), 10);
  obj.style.fontSize = newVal + "px";
  var exp = new Date(new Date().setDate(new Date().getDate() + 90));
  document.cookie = "fontSize=" + newVal + "; SameSite=Lax; Expires=" + exp.toUTCString() + " Secure";
}

function isScreenLockSupported() {
  return ('wakeLock' in navigator);
}

async function getScreenLock() {
  if(isScreenLockSupported()){
    try {
       screenLock = await navigator.wakeLock.request('screen');
    } catch(err) {
       console.log(err.name, err.message);
    }
  }
}


// menu sub-menu
$(document).ready(function() {
  $(document).on("click", function(a) {
    if ($(a.target).is("#plus, #submenu") === false) {
      if (!(document.getElementById('menuZoom').contains(a.target))){
        $(".dropdown").removeClass("active");
      }
    }else{
      $(".dropdown").addClass("active");
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


// PWA install prompt (on Chrome)

let deferredEvent;

const isInAppMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true ||
  /*window.matchMedia('(display-mode: fullscreen)').matches ||
  window.navigator.fullscreen === true;*/

window.addEventListener('beforeinstallprompt', (e) => {
  // prevent the browser from displaying the default install dialog
  e.preventDefault();  
  // Stash the event so it can be triggered later when the user clicks the button

  // Show the install button
  const installButton = document.getElementById('install_button');
  const installButtonMob = document.getElementById('install_button_mob');
  installButton.style.display = 'block';
  installButtonMob.style.display = 'block';
  deferredEvent = e;
});

window.addEventListener('load', () => {
  // Check if the app is already installed
  if (!isInAppMode()) {
    const installButton = document.getElementById('install_button');
    const installButtonMob = document.getElementById('install_button_mob');
    installButton.style.display = 'block';
    installButtonMob.style.display = 'block';
    // Hide the install button
/*    if( /Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent) ) {
      const installButton = document.getElementById('install_button');
      installButton.style.display = 'block';
    }
*/  }
});

function install_prompt(){
  if(deferredEvent) {
    deferredEvent.prompt();
    update_office_installation();
  } else {
    update_office_installation();
  }
}



//Dark / light mode switch
function toggleTheme(){
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
};

// Load user preference on startup
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});
