(function( $ ){

  $.fn.JPhotoEditor = function( options ) {  

    var $this = $(this);
    var $container = $this.wrap("<div class='editor-container'>").parent();
    var image = function(){
        return $container.find(".editable");
    };
    
    var inputs = {
        brightness : $("<input id='brightness-contrast' type='button' name='brightness-contrast' value='brightness/contrast'/>"),
    }
    
    var templates = {
      brightness : function(){
        return ["<div class='brightness-contrast-control'>",
           "<div id='preview'></div>",
           "<div class='controllers'>",
             "<span class='title'>brightness</span>",
             "<div class='control brightness'></div>",
             "<span class='title'>contrast</span>",
             "<div class='control contrast'></div>",
           "</div>",
         "</div>"
        ].join("");
      },
    }
    
    var settings = {
        previewSize : 200,
        editableClass : '.editable',
    };
    
    return this.each(function() {        
      if ( options ) { 
        $.extend( settings, options );
      }
      
      function _preview(){
          var $preview_canvas = image().clone();
          var originalContext = image()[0].getContext("2d");
          var imageData = originalContext.getImageData(0, 0, image().width(), image().height());
          var cloneContext = $preview_canvas[0].getContext("2d");
          cloneContext.putImageData(imageData, 0, 0);

          return $preview_canvas.pixastic("resize", _definePreviewSize());
      }
      function _drawInputs(){
          $container.append(inputs.brightness);
      };
      
      function _definePreviewSize(){
          var result = {};
          if(image().width() > image().height()){
              result.width = settings.previewSize;
              result.height = (image().height() * settings.previewSize) / image().width();
          }else{
              result.height = settings.previewSize;
              result.width = (image().width() * settings.previewSize) / image().height()
          };
          return result;
      };
      
      function _changePreview(event, ui){
        var contrast = $(this).parent().find(".control.contrast").slider("value");
        var brightness = $(this).parent().find(".control.brightness").slider("value");
        console.log(brightness, contrast);
        var preview = _preview().pixastic("brightness", {brightness:brightness, contrast:contrast});
        $(this).parent().parent().find("#preview").empty().append(preview);
      };
      
      function _open_brightness_dialog(){
        
        
        $(templates.brightness()).dialog({
          resizable: false,
          modal: true,
          title:"brightness/contrast",
          open: function(event,ui){
            $(this).find("#preview").append(_preview());
            $(this).find(".control.brightness").slider({
              min: -150,
              animate:true,
              max: 150,
              change: _changePreview
            });
            $(this).find(".control.contrast").slider({
              animate:true,
              min: -1,
              step:0.1,
              max: 1,
              change: _changePreview
            });
            
          },
          buttons: {
            Save: function() {
              var contrast = $(this).parent().find(".control.contrast").slider("value");
              var brightness = $(this).parent().find(".control.brightness").slider("value");
              var preview = image().pixastic("brightness", {brightness:brightness, contrast:contrast});
              $( this ).dialog( "close" );
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            }
          }
        });
      }
      
      
      function _bind_actions(){
          inputs.brightness.click(function(){
              _open_brightness_dialog();
          })
      };
      
      function _init_canvas(){
          image().pixastic("brightness");
      }
      _init_canvas();
      _drawInputs();
      _bind_actions();
    });
    

  };
})( jQuery );