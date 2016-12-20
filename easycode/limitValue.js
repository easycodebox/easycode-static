/**
 * @author WangXiaoJin
 * 
 */
(function ($) {
	
	var defaults = {
		enums: "any", 	//枚举值 例:cjk
		regular: null, 	//正则表达式，enums、regular都有值，优先regular
		flags: "g",		//"g"、"i" 和 "m"
		maxLength: null
	};
	
	$.fn.UI_limitValue = function(settings) {
		settings = settings || {};
		return this.each(function () {
			var data = $.data(this, "ui-limitValue");
			if (data) {
				$.extend(data.settings, settings);
			} else {
				settings = $.extend({}, defaults, settings);
				$.data(this, "ui-limitValue", {settings: settings});
			}
			bindEvent(this);
		});
	};
	
	$.fn.UI_limitValue.enums = {
		any: ".",
		cjk: "[\\u4E00-\\u9FA5\\uF900-\\uFA2D]",//中日韩双字节字符
		doubleChars: "[^\\x00-\\xff]",		//双字符
		chAndWord: "[\\u4E00-\\u9FA5\\uF900-\\uFA2D\\w]"//中文、数字、字母、下划线
	};
	
	function bindEvent(target) {
		var settings = $.data(target, "ui-limitValue"),
			$target = $(target);
		/*
		 * 注意：Firefox（测试版本41.0.2）一次完整的中文输入会触发两次compositionstart、compositionend、input，其他“标准”浏览器测试正常。
		 * 如有特殊需求，不希望触发两次，请参照如下IE9以下的方案，增加一个计数器。
		 **/
		$target.off(".limitValue").on("input.limitValue propertychange.limitValue", function (e) {
			var $this = $(this);
			//非IE浏览器正在中文输入中则跳出
			if($this.data("isIME")) return;
			
			//如果是IE9以下会触发propertychange事件
			if(e.type == "propertychange") {
				if(event.propertyName != "value") {
					//对象的任何属性修改都是触发propertychange事件，过滤出来源是非改变value的
					return;
				}else {
					if($this.data("counter")) {
						//当前是由$this.val(val)触发的，所以需要跳出，防止死循环
						$this.data("counter", 0);
						return;
					}else {
						$this.data("counter", 1);
					}
				}
			}
			$this.val(filterValue(this));
		});
		if(!utils.browser.ie) {
			//非IE浏览器不需要绑定此事件。因为IE下中文输入法，当词组没有确定之前是不会把英文字母输入到input框中，且不会触发oninput事件
			$target.on("compositionstart.limitValue", function(){
				$(this).data("isIME", true);
			}).on("compositionend.limitValue", function(){
				$(this).data("isIME", false).val(filterValue(this));
			});
		}
	}
	
	function filterValue(target) {
		var settings = $.data(target, "ui-limitValue").settings,
			reg = settings.regular ? settings.regular : $.fn.UI_limitValue.enums[settings.enums],
			val = $(target).val().trim(),
			patt = new RegExp(reg, settings.flags),
			result,tmp = "";
		while((result = patt.exec(val)) != null){
			if(settings.maxLength 
				&& tmp.length >= settings.maxLength)
				break;
			tmp += result[0];
		}
		return tmp;
	}
})(jQuery);

