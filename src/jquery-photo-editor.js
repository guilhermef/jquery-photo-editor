(function( $ ){

  $.fn.JPhotoEditor = function( options ) {  

    var $this = $(this);
    var $container = $this.wrap("<div class='editor-container'>").parent();
    var image = function(){
        return $container.find(".editable");
    };
    var preview = function(){
        var $preview_canvas = image().clone();
        var originalContext = image()[0].getContext("2d");
        var imageData = originalContext.getImageData(0, 0, image().width(), image().height());
        var cloneContext = $preview_canvas[0].getContext("2d");
        cloneContext.putImageData(imageData, 0, 0);
        
        return $preview_canvas.pixastic("resize", {width:150, height:150});
    }
    
    var inputs = {
        brightness : $("<input id='brightness' type='button' name='brightness' value='brightness'/>"),
    }
    
    var settings = {
      editableClass : '.editable',
    };
    
    return this.each(function() {        
      if ( options ) { 
        $.extend( settings, options );
      }
      
      
      function _drawInputs(){
          $container.append(inputs.brightness);
      };
      
      function _bind_actions(){
          inputs.brightness.click(function(){
              $("body").append(preview());
              // image().pixastic("brightness", {brightness:$(this).val()});
          })
      };
      
      function _init_canvas(){
          image().pixastic("brightness");
      }
      // function _open_brightness_dialog(){
      //     $("")
      // };
      
      _init_canvas();
      _drawInputs();
      _bind_actions();
    });
    

  };
})( jQuery );