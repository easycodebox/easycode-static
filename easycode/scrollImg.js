(function ($) {
	$.fn.UI_scrollImg = function (settings, param) {
		if (typeof settings == "string") {
			var method = $.fn.UI_scrollImg.methods[settings];
			if (method) {
				return method(this, param);
			}
		}
		settings = $.extend({}, defaults, settings);
		return this.each(function () {
			var data = $.data(this, "ui-scrollImg");
			if (data) {
				$.extend(data.settings, settings);
			} else {
				data = $.data(this, "ui-scrollImg", {settings: settings});
			}
			bindEvent(this);
		});
	};
	$.fn.UI_scrollImg.methods = {
		settings: function (jq) {
			return $.data(jq[0], "ui-scrollImg").settings;
		},
		setCanMoved: function(jq) {
			jq.each(function(){
				setCanMoved(this);
			});
		}
	};
	var defaults = {
		simpleZomm: false,	//true=简单的放大缩小图片，不调整图片位置
		scale: 0.02,		//滚轮没动一次增加20%
		canMoved: true,		//是否能移动图片
		MovedKey: "left",	//移动图片的鼠标键 left/right
		wrapHtml: '<div class="scroll-img-wrap" style="position: relative;overflow:hidden;border: 1px solid #0000FF;" ></div>'
	};
	
	function bindEvent(target) {
		var settings = $(target).UI_scrollImg("settings");
		$(target).unbind(".scrollImg");
		
		function zoom(scale){
			$(this).width($(this).width() * (1 + scale));
			$(this).height($(this).height() * (1 + scale));
		}
		function placePosition(event){
			var x = event.pageX ? event.pageX : event.clientX + document.body.scrollLeft - document.body.clientLeft,
				y = event.pageY ? event.pageY : event.clientY + document.body.scrollTop - document.body.clientTop,
				$div = $(this).parent(".scroll-img-wrap"),
				pOffset = $div.offset(),
				d_w = ($div.width()/2 - (x - pOffset.left))*settings.scale,
				d_h = ($div.height()/2 - (y - pOffset.top))*settings.scale;
			$(this).css({top: d_h + parseFloat($(this).css("top")), left: d_w + parseFloat($(this).css("left"))});
		}
		var removeMaxCss = false;
		if(utils.browser.firefox){
			$(target).bind("DOMMouseScroll.scrollImg", function(event){
				//重置图片位置
				if(!settings.simpleZomm)
					placePosition.call(this, event.originalEvent);
				var d = event.originalEvent.detail;
				if(d > 0) {
					zoom.call(this, -settings.scale);
				}
				else {
					zoom.call(this, settings.scale);
				}
				if(!removeMaxCss){
					$(this).css({"max-height": "none", "max-width": "none"});
					removeMaxCss = true;
				}
				return false;
			});
		}else{
			$(target).bind("mousewheel.scrollImg",function(event){
				//重置图片位置
				if(!settings.simpleZomm)
					placePosition.call(this, event.originalEvent);
				var d = event.originalEvent.wheelDelta;
				if(d < 0){
					zoom.call(this, -settings.scale);
				}
				else{
					zoom.call(this, settings.scale);
				}
				if(!removeMaxCss){
					$(this).css({"max-height": "none", "max-width": "none"});
					removeMaxCss = true;
				}
				return false;
			});
		}
		//图片能够被移动
		if(!settings.simpleZomm && settings.canMoved){
			setCanMoved(target);
		}
	}
	
	function setCanMoved(target) {
		var settings = $(target).UI_scrollImg("settings");
		if(settings.wrapHtml){
			var $wrap = $(settings.wrapHtml).css({width: $(target).width(), height: $(target).height()});
			$(target).wrap($wrap).css({position: "absolute", left: "0px", top: "0px"});
		}
		var moving = false,
				x,y,top,left;
		$(target).bind("mousedown.scrollImg", function(event){
			if(event.which == 1){
				$(this).css("cursor", "move");
				moving = true;
				x = event.pageX ? event.pageX : event.clientX + document.body.scrollLeft - document.body.clientLeft;
				y = event.pageY ? event.pageY : event.clientY + document.body.scrollTop - document.body.clientTop;
				top = $(this).css("top");
				left = $(this).css("left");
			}
			return false;
		}).bind("mouseup.scrollImg", function(event){
			if(event.which == 1){
				$(this).css("cursor", "default");
				moving = false;
			}
			return false;
		}).bind("mouseleave.scrollImg", function(event){
			//增加mouseleave事件是为了鼠标快速离开图片并不触发mouseup事件
			$(this).css("cursor", "default");
			moving = false;
			return false;
		}).bind("mousemove.scrollImg", function(event){
			if(moving){
				var tmp_x = event.pageX ? event.pageX : event.clientX + document.body.scrollLeft - document.body.clientLeft,
					tmp_y = event.pageY ? event.pageY : event.clientY + document.body.scrollTop - document.body.clientTop;
				$(this).css({top: (tmp_y - y) + parseFloat(top), left: (tmp_x - x) + parseFloat(left)});
			}
			return false;
		});
	}
})(jQuery);
