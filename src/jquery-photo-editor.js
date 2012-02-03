/*
 * jQuery Photo Editor v0.1
 *
 * Copyright 2012, Guilherme Souza (https://github.com/guilhermef/jquery-photo-editor)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * dependencies:
 *  jquery - 1.7.1+
 *  jquery.ui - 1.8.17+
 *  jquery.ui.dialog
 *  jquery.ui.slider
 *  pixastic.js
 *  
 */
(function( $ ){

  $.fn.JPhotoEditor = function( options ) {  

    var $this = $(this);
    var selection;
    var $container = $this.wrap("<div class='editor-container'>").parent();
    var image = function(){
        return $container.find(".editable");
    };
    
    var inputs = {
        resize : $("<input id='resize' type='button' name='resize' value='resize'/>"),
        brightness : $("<input id='brightness-contrast' type='button' name='brightness-contrast' value='brightness/contrast'/>"),
        crop : $("<input id='crop' type='button' name='crop' value='crop'/>"),
        rotate_cw : $("<input id='rotate-cw' type='button' name='rotate-cw' value='clockwise'/>"),
        rotate_ccw : $("<input id='rotate-ccw' type='button' name='rotate-ccw' value='counterclockwise'/>"),
        save : $("<input id='save-image' type='button' name='save-image' value='save'/>"),
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
      resize : function(){
        return ["<div class='resize-control'>",
           "<div class='controllers'>",
             "<div class='width-show'>",
               "<span class='title'>width: </span>",
               "<span class='width'></span>",
               "<span>px</span>",
             "</div>",
             "<div class='height-show'>",
               "<span class='title'>height: </span>",
               "<span class='height'></span>",
               "<span>px</span>",
             "</div>",
             "<span class='title'>width: </span>",
             "<input id='width' type='text' size='4' name='width' />",
             "<span class='title'>height: </span>",
             "<input id='height' type='text' size='4' name='height' />",
             "<div class='suggestion'>",
             "</div>",
           "</div>",
         "</div>"
        ].join("");
      },
    }
    
    var settings = {
        previewSize : 200,
        after_save : function(){},
    };
    
    return this.each(function() {        
      if ( options ) { 
        $.extend( settings, options );
      }
      
      function _cloneImage(){
        var $new_canvas = image().clone();
        var originalContext = image()[0].getContext("2d");
        var imageData = originalContext.getImageData(0, 0, image().width(), image().height());
        var cloneContext = $new_canvas[0].getContext("2d");
        cloneContext.putImageData(imageData, 0, 0);
        return $new_canvas;
      };
      
      function _preview(){
          return _cloneImage().pixastic("resize", _definePreviewSize());
      }
      function _drawInputs(){
          var $controllers = $("<div class='options' />");
          $controllers.append(inputs.rotate_ccw);
          $controllers.append(inputs.rotate_cw);
          $controllers.append(inputs.resize);
          $controllers.append(inputs.crop);
          $controllers.append(inputs.brightness);
          $controllers.append(inputs.save);
          $controllers.appendTo($container);
      };
      
      function _bindSelectBox(){
        if(selection){
          selection.cancelSelection();
        };
        
        selection = image().imgAreaSelect({instance: true,handles: true});
        $(document).keydown(function(e){
          if(e.keyCode == 16){
            selection.setOptions({instance: true,handles: true, aspectRatio:"1:1"});
            selection.update();
          };
        });
        
        $(document).keyup(function(e){
          if(e.keyCode == 16){
            selection.setOptions({instance: true,handles: true, aspectRatio: false});
            selection.update();
          }
        });
        
      };
      
      function _updateImage(action, options){
        image().pixastic(action, options);
        _bindSelectBox();
      };
      
      function _rule_of_thumb(x1, y1, x2){
        return (x2 * y1) / x1;
      };
      
      function _definePreviewSize(){
          var result = {};
          if(image().width() > image().height()){
              result.width = settings.previewSize;
              result.height = _rule_of_thumb(image().width(), settings.previewSize, image().height())
          }else{
              result.height = settings.previewSize;
              result.width = _rule_of_thumb(image().height(), settings.previewSize, image().width())
          };
          return result;
      };
      
      function _changePreview(event, ui){
        var contrast = $(this).parent().find(".control.contrast").slider("value");
        var brightness = $(this).parent().find(".control.brightness").slider("value");
        var preview = _preview().pixastic("brightness", {brightness:brightness, contrast:contrast});
        $(this).parent().parent().find("#preview").empty().append(preview);
      };
      
      function _openBrightnessDialog(){
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
              _updateImage("brightness", {brightness:brightness, contrast:contrast})
              $( this ).dialog( "close" );
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            }
          }
        });
      };
      
      function _openResizeDialog(){
        $(templates.resize()).dialog({
          resizable: false,
          modal: true,
          title:"resize",
          width:190,
          open: function(event,ui){
            $(this).find(".width-show .width").html(image().width());
            $(this).find(".height-show .height").html(image().height());
            
            $(this).find("input").keyup(function(){
              var $input = $(this);
              var result = 0;
              var side = "";
              if(!isNumber($input.val()))
                return false;
              if(isNumber($input.parent().find("#width").val()) && isNumber($input.parent().find("#height").val()))
                return false;
              if ($input.attr("id") == "width"){
                side = "height";
                result = _rule_of_thumb(image().width(), $input.val(), image().height());
              }else{
                side = "width";
                result = _rule_of_thumb(image().height(), $input.val(), image().width());
              };
              $(this).parent().find(".suggestion").html("suggested "+side+": "+parseInt(result));
            });
          },
          buttons: {
            Save: function() {
              var width = $(this).find("input#width").val();
              var height = $(this).find("input#height").val();
              if (!isNumber(width) || !isNumber(height)){
                return false;
              };
              _updateImage("resize", {width:width, height:height})
              $( this ).dialog( "close" );
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            }
          }
        });
      }
      
      function _rotateImage(value){
        return _updateImage("rotate", {angle:value});
      };
      
      function _cropImage(){
        var selected_area = selection.getSelection();
        if(selected_area.width == "0"){
          alert("select a rectangular region before cropping.");
          return false;
        };
        _updateImage("crop", _selectionArea(selected_area));
      };
      
      function _selectionArea(selected_area){
        return {rect : 
                 {left : selected_area.x1, 
                  top : selected_area.y1, 
                  width : selected_area.width, 
                  height : selected_area.height
                 }
               }
        
      };
      
      function _postImage(url, image_bin){
        inputs.save.attr("disabled", "disabled");
        $.ajax(url,{
          data: {image:image_bin},
          type: "POST",
          complete : function(jqXHR, textStatus){
                      inputs.save.removeAttr("disabled");
                      settings.after_save(jqXHR, textStatus);
                    },
        });
      };
      
      function _saveImage(){
        var current_image = image()[0].toDataURL('image/jpeg');
        var thumb = current_image;
        var save_image_url = settings.save_image_url || image().data("save-image-url");
        var save_thumb_url = settings.save_thumb_url || image().data("save-thumb-url");
        var selected_area = selection.getSelection();
        if(!selected_area.width == "0"){
          thumb = _cloneImage().pixastic("crop", _selectionArea(selected_area))[0].toDataURL('image/jpeg');
        };
        _postImage(save_image_url, current_image);
        _postImage(save_thumb_url, thumb);
      };
      
      function _bindActions(){
          inputs.rotate_ccw.click(function(){
            _rotateImage(90);
          });
          inputs.rotate_cw.click(function(){
            _rotateImage(-90);
          });
          inputs.crop.click(function(){
            _cropImage();
          })
          inputs.brightness.click(function(){
            _openBrightnessDialog();
          })
          inputs.resize.click(function(){
            _openResizeDialog();
          });
          inputs.save.click(function(){
            _saveImage();
          });
      };
      
      function _initCanvas(){
          var $img_tag = image();
          var $new_canvas = $("<canvas />").appendTo($container);
          var img = new Image();  
          img.src = $img_tag.attr("src");
          img.onload = function(){
            $new_canvas.attr("width", image().width());
            $new_canvas.attr("height", image().height());
            $new_canvas.attr("class", image().attr("class"));
            $new_canvas[0].getContext("2d").drawImage(img,0,0);
            $img_tag.remove();
          };  
      };
      
      _initCanvas();
      _bindSelectBox();
      _drawInputs();
      _bindActions();
    });
    
    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    

  };
})( jQuery );