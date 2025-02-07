function debounce(method, delay) {
    clearTimeout(method._tId);
    method._tId= setTimeout(function(){
        method();
    }, delay);
}

$(window).scroll(function() {
    update_anchors();
    debounce(update_scroll_menu, 50);
});

// Code we want to trigger on scroll
function handleScroll() {
    console.log('scroll');
    //update_anchors();
    update_scroll_menu();
  }


function update_anchors(){
    var docViewTop = 150;
    if (window.matchMedia("(max-width: 900px)").matches) {
        docViewTop = 100;
    }
    var docViewBottom = docViewTop + $(window).height();
    var firstElement = false;
    var windowScroll = window.scrollY + docViewTop;
    var nbTextParts = Math.ceil($(".text_part").length/2);
    $(".text_part").each(function(index){
        var elemTop = $(this).offset().top;
        var elemBottom = elemTop + $(this).height();
        if ((elemTop != 0)) {
            if (($(window).scrollTop() + $(window).height() + 50 >= $(document).height())) {
                if (index == nbTextParts - 1) {
                    $('a[href^="#' + $(this).attr('id') + '"]').addClass("anchor_selected");
                } else {
                    $('a[href^="#' + $(this).attr('id') + '"]').removeClass("anchor_selected");
                }
            } else {
                if ((windowScroll <= elemBottom)) {
                    if (!firstElement) {
                        $('a[href^="#' + $(this).attr('id') + '"]').addClass("anchor_selected");
                        firstElement = true;
                    } else {
                        $('a[href^="#' + $(this).attr('id') + '"]').removeClass("anchor_selected");
                    }
                } else {
                    $('a[href^="#' + $(this).attr('id') + '"]').removeClass("anchor_selected");
                }
            }
        }
    });
}

function update_scroll_menu(){
    const container = document.getElementsByClassName("office_sommaire")[1];
    const selected = document.getElementsByClassName("anchor_selected")[0];
    container.scrollTo(selected.offsetLeft - (container.clientWidth/2) + (selected.scrollWidth/2), 0);
    //container.scrollLeft = selected.offsetLeft;
}
