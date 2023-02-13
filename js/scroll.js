
$(document).ready(function(){
    $(window).scroll(function() {
        update_anchors();
    }); 
});

function update_anchors(){
    //var docViewTop = $(window).offset().top;
    var docViewTop = 155;
    var docViewBottom = docViewTop + $(window).height();
    var firstElement = false;
    var windowScroll = window.scrollY + 155;
    var nbTextParts = $(".text_part").length/2
    $(".text_part").each(function(index){
        console.log(index);
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
/*
            if (((elemTop <= docViewBottom) && (elemBottom >= docViewTop))) {
                if (!firstElement) {
                    $('a[href^="#' + $(this).attr('id') + '"]').addClass("anchor_selected");
                    firstElement = true;
                } else {
                    $('a[href^="#' + $(this).attr('id') + '"]').removeClass("anchor_selected");
                }
            } else {
                $('a[href^="#' + $(this).attr('id') + '"]').removeClass("anchor_selected");
            }
        }*/
    });
}