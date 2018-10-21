$(function () {
    $(".input-group input").focus(function () {

        $(this).parent(".input-group").each(function () {
            $("label", this).css({
                "font-size": "13px",
            })
            
        })
    }).blur(function () {
        if ($(this).val() == "") {

            $(this).css({"background":"#111",})

            $(this).parent(".input-group").each(function () {
                $("label", this).css({
                    "font-size": "18px",
                })
            });
        } else {
            $(this).css({"background":"#212121",})
        }
    });
});