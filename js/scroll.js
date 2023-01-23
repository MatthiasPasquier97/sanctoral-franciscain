$(document).ready(function(){
    $(".container_site").scroll(function() {
        update_anchors();
    });    
});

function update_anchors(){
    var docViewTop = $(".container_site").offset().top;
    var docViewBottom = docViewTop + $(".container_site").height();
    var firstElement = false;
    $(".text_part").each(function(){
        var elemTop = $(this).offset().top;
        var elemBottom = elemTop + $(this).height();
        if ((elemTop != 0)) {
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
        }
    });
}