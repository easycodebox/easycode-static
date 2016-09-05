;(function($){
	$.fn.UI_resizable = function(settings, param){
		if (typeof settings == 'string'){
			return $.fn.UI_resizable.methods[settings](this, param);
		}
		
		function resize(e){
			var resizeData = e.data;
			var settings = $(resizeData.target).UI_resizable("settings");
			if (resizeData.dir.indexOf('e') != -1) {
				var width = resizeData.startWidth + e.pageX - resizeData.startX;
				width = Math.min(
							Math.max(width, utils.val(settings.minWidth)),
							utils.val(settings.maxWidth)
						);
				resizeData.width = width;
			}
			if (resizeData.dir.indexOf('s') != -1) {
				var height = resizeData.startHeight + e.pageY - resizeData.startY;
				height = Math.min(
						Math.max(height, utils.val(settings.minHeight)),
						utils.val(settings.maxHeight)
				);
				resizeData.height = height;
			}
			if (resizeData.dir.indexOf('w') != -1) {
				var width = resizeData.startWidth - e.pageX + resizeData.startX;
				width = Math.min(
							Math.max(width, utils.val(settings.minWidth)),
							utils.val(settings.maxWidth)
						);
				resizeData.width = width;
				resizeData.left = resizeData.startLeft + resizeData.startWidth - resizeData.width;
			}
			if (resizeData.dir.indexOf('n') != -1) {
				var height = resizeData.startHeight - e.pageY + resizeData.startY;
				height = Math.min(
							Math.max(height, utils.val(settings.minHeight)),
							utils.val(settings.maxHeight)
						);
				resizeData.height = height;
				resizeData.top = resizeData.startTop + resizeData.startHeight - resizeData.height;
			}
		}
		
		function applySize(e){
			var resizeData = e.data;
			var t = $(resizeData.target);
			t.css({
				left: resizeData.left,
				top: resizeData.top
			});
			if (t.outerWidth() != resizeData.width){t.outerWidth(resizeData.width);}
			if (t.outerHeight() != resizeData.height){t.outerHeight(resizeData.height);}
		}
		
		function doDown(e){
			$.fn.UI_resizable.isResizing = true;
			$(e.data.target).UI_resizable("settings").onStartResize.call(e.data.target, e);
			return false;
		}
		
		function doMove(e){
			resize(e);
			if ($(e.data.target).UI_resizable("settings").onResize.call(e.data.target, e) != false){
				applySize(e)
			}
			return false;
		}
		
		function doUp(e){
			$.fn.UI_resizable.isResizing = false;
			resize(e, true);
			$(e.data.target).UI_resizable("settings").onStopResize.call(e.data.target, e);
			applySize(e);
			$(document).unbind('.resizable');
			$('body').css('cursor','');
//			$('body').css('cursor','auto');
			return false;
		}
		
		return this.each(function(){
			var state = $.data(this, 'ui-resizable');
			if (state) {
				$(this).unbind('.resizable');
				settings = $.extend(state.settings, settings || {});
			} else {
				var attrSetting = (new Function( "return " + $(this).attr("setting") ))() || {};
				settings = $.extend({}, $.fn.UI_resizable.defaults, settings || {}, attrSetting);
				$.data(this, 'ui-resizable', {
					settings: settings
				});
			}
			
			if (settings.disabled == true) {
				return;
			}
			
			// bind mouse event using namespace resizable
			$(this).bind('mousemove.resizable', {target:this}, function(e){
//				if (isResizing) return;
				if ($.fn.UI_resizable.isResizing){return}
				var dir = getDirection(e);
				if (dir == '') {
					$(e.data.target).css('cursor', '');
				} else {
					$(e.data.target).css('cursor', dir + '-resize');
				}
			}).bind('mouseleave.resizable', {target:this}, function(e){
				$(e.data.target).css('cursor', '');
			}).bind('mousedown.resizable', {target:this}, function(e){
				var dir = getDirection(e);
				if (dir == '') return;
				
				function getCssValue(css) {
					var val = parseInt($(e.data.target).css(css));
					if (isNaN(val)) {
						return 0;
					} else {
						return val;
					}
				}
				
				var data = {
					target: e.data.target,
					dir: dir,
					startLeft: getCssValue('left'),
					startTop: getCssValue('top'),
					left: getCssValue('left'),
					top: getCssValue('top'),
					startX: e.pageX,
					startY: e.pageY,
					startWidth: $(e.data.target).outerWidth(),
					startHeight: $(e.data.target).outerHeight(),
					width: $(e.data.target).outerWidth(),
					height: $(e.data.target).outerHeight(),
					deltaWidth: $(e.data.target).outerWidth() - $(e.data.target).width(),
					deltaHeight: $(e.data.target).outerHeight() - $(e.data.target).height()
				};
				$(document).bind('mousedown.resizable', data, doDown);
				$(document).bind('mousemove.resizable', data, doMove);
				$(document).bind('mouseup.resizable', data, doUp);
				$('body').css('cursor', dir+'-resize');
			});
			
			// get the resize direction
			function getDirection(e) {
				var tt = $(e.data.target);
				var dir = '';
				var offset = tt.offset();
				var width = tt.outerWidth();
				var height = tt.outerHeight();
				var edge = settings.edge;
				if (e.pageY > offset.top && e.pageY < offset.top + edge) {
					dir += 'n';
				} else if (e.pageY < offset.top + height && e.pageY > offset.top + height - edge) {
					dir += 's';
				}
				if (e.pageX > offset.left && e.pageX < offset.left + edge) {
					dir += 'w';
				} else if (e.pageX < offset.left + width && e.pageX > offset.left + width - edge) {
					dir += 'e';
				}
				
				var handles = settings.handles.split(','),
					second = '';	//second作为备选方案
				for(var i=0; i<handles.length; i++) {
					var handle = handles[i].replace(/(^\s*)|(\s*$)/g, '');
					if (handle == 'all' || handle == dir) {
						return dir;
					}else if(handle.length == 1 && dir.indexOf(handle) > -1){
						second = handle;
					}
				}
				return second;
			}
			
			
		});
	};
	
	$.fn.UI_resizable.methods = {
			settings: function(jq){
			return $.data(jq[0], 'ui-resizable').settings;
		},
		enable: function(jq){
			return jq.each(function(){
				$(this).UI_resizable({disabled:false});
			});
		},
		disable: function(jq){
			return jq.each(function(){
				$(this).UI_resizable({disabled:true});
			});
		}
	};
	
	$.fn.UI_resizable.defaults = {
		disabled:false,
		handles:'n, e, s, w, ne, se, sw, nw, all',
		minWidth: 10,
		minHeight: 10,
		maxWidth: 10000,//$(document).width(),
		maxHeight: 10000,//$(document).height(),
		edge:5,
		onStartResize: function(e){
		},
		onResize: function(e){
		},
		onStopResize: function(e){
		}
	};
	
	$.fn.UI_resizable.isResizing = false;
	
})(jQuery);
