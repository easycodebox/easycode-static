/**
 * @author WangXiaoJin
 * 
 */
(function ($) {
	function init(target) {
		var settings = $(target).UI_numberbox("settings"),
			originalVal = $.data(target, "ui-numberbox").value;
		if (originalVal || originalVal === 0) {
		    $(target).val(settings.formatter.call(target, originalVal));
		}else {
			$(target).val("");
		}
		$.data(target, "ui-numberbox").originalVal = originalVal;
	}
	function getValue(target) {
		return $(target).val();
	}
	function setValue(target, val) {
		var settings = $(target).UI_numberbox("settings"),
			oldVal = $.data(target, "ui-numberbox").value,
			fmtVal;
		if((!val || !(val = val.trim())) && val !== 0) {
			if(settings.notEmpty) {
				val = settings.min ? settings.min : 0;
				fmtVal = settings.formatter.call(target, val);
			}else
				fmtVal = val = "";
		}else {
			val = settings.parser.call(target, val);
			fmtVal = settings.formatter.call(target, val);
		}
		$.data(target, "ui-numberbox").value = val;
		$(target).val(fmtVal);
		if (oldVal != val) {
			settings.onChange.call(target, val, oldVal);
		}
	}
	function bindEvent(target) {
		var settings = $(target).UI_numberbox("settings");
		$(target).off(".numberbox").on({
		    "keypress.numberbox": function (e) {
		        return settings.filter.call(target, e);
		    },
		    "blur.numberbox": function () {
		        setValue(target, getValue(target));
		    },
		    "focus.numberbox": function () {
		        setValue(target, getValue(target));
		    },
		    "keydown.numberbox": function (e) {
		        if (e.keyCode == 13) {
		            setValue(target, getValue(target));
		        }
		    }
		});
	}
	$.fn.UI_numberbox = function (settings, param) {
		if (typeof settings == "string") {
			var method = $.fn.UI_numberbox.methods[settings];
			if (method) {
				return method(this, param);
			}
		}
		settings = $.extend({}, defaults, settings);
		return this.each(function () {
			var data = $.data(this, "ui-numberbox");
			if (data) {
				$.extend(data.settings, settings);
			} else {
				var	value = settings.initValue || settings.initValue === 0 ? settings.initValue : $(this).val().trim();
				data = $.data(this, "ui-numberbox", {settings: settings,value: value});
				$(this).css({imeMode:"disabled"});
			}
			bindEvent(this);
			init(this);
		});
	};
	$.fn.UI_numberbox.methods = {
		settings:function (jq) {
			return $.data(jq[0], "ui-numberbox").settings;
		}, destroy:function (jq) {
			return jq.each(function () {
				$.removeData(this, "ui-numberbox");
				$(this).remove();
			});
		}, fix:function (jq) {
			return jq.each(function () {
				setValue(this, $(this).val());
			});
		}, setValue:function (jq, val) {
			return jq.each(function () {
				setValue(this, val);
			});
		}, getValue:function (jq) {
			return getValue(jq[0]);
		}, clear:function (jq) {
			return jq.each(function () {
				var data = $.data(this, "ui-numberbox");
				data.value = "";
				$(this).val("");
			});
		}, reset:function (jq) {
			return jq.each(function () {
				$(this).numberbox("setValue", $.data(this, "ui-numberbox").originalVal);
			});
		}
	};
	var defaults = {
		initValue:null, 	//存的是没有格式化的值,不带前后缀 12.00
		notEmpty: false,//不能为空。 当notEmpty=true时，控件获得的值是空字符窜，则有min就设置为min，没min就设置为0的格式化值
		min:null, 		//最小值
		max:null, 		//最大值
		precision: 0,
	    removeZero: false,  //是否删除小数后面的0
		decimalSeparator:".", 
		groupSeparator:"", 
		prefix:"", 
		suffix:"", 
		filter:function (e) {
			var settings = $(this).UI_numberbox("settings");
			if (e.which == 45) {
				return ($(this).val().indexOf("-") == -1 ? true : false);
			}
			var c = String.fromCharCode(e.which);
			if (c == settings.decimalSeparator) {
				return ($(this).val().indexOf(c) == -1 ? true : false);
			} else {
				if (c == settings.groupSeparator) {
					return true;
				} else {
					if ((e.which >= 48 && e.which <= 57 && e.ctrlKey == false && e.shiftKey == false) || e.which == 0 || e.which == 8) {
						return true;
					} else {
						if (e.ctrlKey == true && (e.which == 99 || e.which == 118)) {
							return true;
						} else {
							return false;
						}
					}
				}
			}
		}, formatter:function (val) {
			if (!val && val !== 0) {
				return val;
			}
			val = val.toString();
			var settings = $(this).UI_numberbox("settings");
			if (typeof (settings.min) == "number" && val < settings.min) {
			    val = utils.fmtDecimal(settings.min, settings.precision, settings.removeZero);
			} else if (typeof (settings.max) == "number" && val > settings.max) {
			    val = utils.fmtDecimal(settings.max, settings.precision, settings.removeZero);
			}
		    var inte = utils.fmtDecimal(val, settings.precision, settings.removeZero),
				decimal = "",
				index = val.indexOf(settings.decimalSeparator);
			if (index >= 0) {
				inte = val.substring(0, index);
				decimal = val.substring(index + 1, val.length);
			}
			if (settings.groupSeparator) {
				var reg = /(\d+)(\d{3})/;
				while (reg.test(inte)) {
					inte = inte.replace(reg, "$1" + settings.groupSeparator + "$2");
				}
			}
			if (decimal) {
				return settings.prefix + inte + settings.decimalSeparator + decimal + settings.suffix;
			} else {
				return settings.prefix + inte + settings.suffix;
			}
		}, parser:function (val) {
			val = val.toString().trim();
			var settings = $(this).UI_numberbox("settings");
			if (val && utils.parseFloat(val) != val) {
				if (settings.prefix) {
					val = $.trim(val.replace(new RegExp("\\" + $.trim(settings.prefix), "g"), ""));
				}
				if (settings.suffix) {
					val = $.trim(val.replace(new RegExp("\\" + $.trim(settings.suffix), "g"), ""));
				}
				if (settings.groupSeparator) {
					val = $.trim(val.replace(new RegExp("\\" + settings.groupSeparator, "g"), ""));
				}
				val = val.replace(/\s/g, "");
			}
			var value = utils.fmtDecimal(val, settings.precision, settings.removeZero);
			if (typeof (settings.min) == "number" && value < settings.min) {
			    value = utils.fmtDecimal(settings.min, settings.precision, settings.removeZero);
			} else if (typeof (settings.max) == "number" && value > settings.max) {
			    value = utils.fmtDecimal(settings.max, settings.precision, settings.removeZero);
			}
			return value;
		}, onChange:function (val, oldVal) {
		}
	};
})(jQuery);

