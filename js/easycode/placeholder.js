/**
 * @author WangXiaoJin
 * $('input[placeholder]').placeholder();
 * <input type="text" placeholder="username">
 * 
 */
(function($){
  	//feature detection
  	var hasPlaceholder = 'placeholder' in document.createElement('input');
 
  	$.fn.placeholder = function(options) {
    	//merge in passed in options, if any
    	var options = $.extend(true, {}, $.fn.placeholder.defaults, options);
    	//first test for native placeholder support before continuing
    	//feature detection inspired by ye olde jquery 1.4 hawtness, with paul irish
    	return (hasPlaceholder) ? this : this.each(function( ind ) {
	      	var $this = $(this),
	          	inputVal = $.trim($this.val()),
	          	inputWidth = $this.width(),
	          	inputHeight = $this.outerHeight(),
	          	//grab the inputs id for the <label @for>, or make a new one from the Date
	         	inputId = (this.id) ? this.id : 'placeholder' + (+new Date()) + ind,
	          	placeholderText = $this.attr('placeholder'),
	          	placeholder = $('<label for='+ inputId +'>'+ placeholderText + '</label>');
	       
	      	//stuff in some calculated values into the css object
	      	if(this.type == "text"){
	      		options.css['height'] = inputHeight;
	      		options.css['line-height'] = inputHeight + "px";
	      		options.css['width'] = inputWidth;
	      	}else{
	      		options.css['height'] = inputHeight;
	      		options.css['width'] = inputWidth - 18;
	      	}
	
          	placeholder.css(options.css);
      		//place the placeholder
	  		$this.wrap(options.inputWrapper);
	 		$this.attr('id', inputId).after(placeholder);
	 
	  		//if the input isn't empty
	  		if(inputVal){
	    		placeholder.hide();
	  		}
	  		$this.bind({
	  			"focus.placeholder": function(){
		    		if (!$this.val().trim()){
		      			placeholder.hide();
		    		}
		  		},
		  		"blur.placeholder": function(){
		    		if (!$this.val().trim()){
		      			placeholder.show();
		    		}
		  		}
	  		});
		});
	};
	
	$.placeholder = {
		
		/**
		 * 重置提示信息
		 */
		resetTip: function(doms) {
			return $(doms).each(function(){
				var val = $(this).val().trim(),
					id = $(this).attr("id"),
					$place = $("label[for=" + id + "]");
				if(!val)
					$place.show();
				else
					$place.hide();
			});
		}
		
	};
	
  	$.fn.placeholder.defaults = {
    	//you can pass in a custom wrapper
    	inputWrapper: '<div style="position:relative"></div>',
    	css: {
      		'color':'#bababa',
      		'position': 'absolute',
      		'left':'5px',
      		'top':'0',
      		'overflow': 'hidden'
		}
  	};
})(jQuery);

