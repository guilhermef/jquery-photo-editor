(function( $ ){

  $.fn.JPhotoEditor = function( options ) {  

    var $this = $(this)

    var settings = {
      editableClass : '.editable',
    };

    return this.each(function() {        
      if ( options ) { 
        $.extend( settings, options );
      }
      
      $(this).pixastic("brightness", {brightness:50,contrast:0.5})
      debugger;

    });

  };
})( jQuery );