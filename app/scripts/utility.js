;(function(window){

var center = function () {
    this.css("position", "fixed");
    this.css("top", ( $(window).height() - $(this).height() ) / 2 + "px");
    this.css("left",( $(window).width() - this.width() ) / 2 + $(window).scrollLeft() + "px");
    return this;
};

var isLandscape = function() {
    return ($(window).width() > $(window).height());
};

/**
 * public functions
 */
window.jQuery.fn.center = center;
window.isLandscape = isLandscape;

})(window);