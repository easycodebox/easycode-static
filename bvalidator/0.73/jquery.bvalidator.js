/*!
 * jQuery bValidator plugin
 *
 * http://code.google.com/p/bvalidator/
 *
 * Copyright (c) 2012 Bojan Mauser
 *
 * Released under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 *
 * $Id: jquery.bvalidator.js 125 2014-03-14 00:22:10Z bmauser $
 */

(function($){

	// constructor
	$.fn.bValidator = function(overrideOptions, instanceName){
		return this.each(function(){
			new bValidator($(this), overrideOptions, instanceName);
   		});
	};

	// bValidator class
	bValidator = function(mainElement, overrideOptions, instanceName){

		// default options
		var options = {

			zh2char:			 false,		//一个中文当两个字符
			singleError:         false,		// validate all inputs at once
			//offset:              {x:-23, y:-4},	// offset position for error message tooltip
			offset:              {x:-27, y:-6},	// offset position for error message tooltip
			//position:            {x:'right', y:'top'}, // error message placement x:left|center|right  y:top|center|bottom
			position:            {x:'right', y:'top'}, // error message placement x:left|center|right  y:top|center|bottom
			//template:            '<div class="{errMsgClass}"><em/>{message}</div>', // template for error message
			template: 			'<div class="{errMsgClass}"><div class="bvalidator_bootstraprt_arrow"></div><div class="bvalidator_bootstraprt_cont1">{message}</div></div>',    // template for error message
			//templateCloseIcon:   '<div style="display:table"><div style="display:table-cell">{message}</div><div style="display:table-cell"><div class="{closeIconClass}">x</div></div></div>', // template for error message container when showCloseIcon option is true
			templateCloseIcon: '<table width="100%" cellspacing="0" cellpadding="0"><tr><td>{message}</td><td><div class="{closeIconClass}">&#215;</div></td></tr></table>', // template for error message container when showCloseIcon option is true
			showCloseIcon:       true,	// put close icon on error message
			showErrMsgSpeed:    'normal',	// message's fade-in speed 'fast', 'normal', 'slow' or number of milliseconds
			scrollToError:       true,	// scroll to first error
			// css class names
			//classNamePrefix:     'bvalidator_',	// prefix for css class names
			classNamePrefix:     'bvalidator_bootstraprt_',	// prefix for css class names
			closeIconClass:      'close_icon',	// close error message icon class
			errMsgClass:         'errmsg',		// error message class
			errorClass:          'invalid',		// input field class name in case of validation error
			validClass:          '',		// input field class name in case of valid value

			lang: 'zh', 				// default language for error messages 
			errorMessageAttr:    'validator-msg',// name of the attribute for overridden error message
			validateActionsAttr: 'validator', // name of the attribute which stores info what validation actions to do
			validateOnAttr: 'validator-on',//在input标签中设置此标签的验证触发时机，会覆盖validateOn属性，可以设置validateOn中的任何一个属性
			forceValidAttr:      'validator-forcevalid', // name of the attribute which which makes validator to act like the field is valid
			modifyActionsAttr:   'validator-modifier',
			paramsDelimiter:     ':',		// delimiter for validator action options inside []
			actionsDelimiter:    ',',		// delimiter for validator actions

			// when to validate
			validateOn:          'blur',		// null, 'change', 'blur', 'keyup'
			errorValidateOn:     'keyup',		// null, 'change', 'blur', 'keyup'

			// callback functions
			onBeforeValidate:    null,
			onAfterValidate:     null,
			onValidateFail:      null,
			onValidateSuccess:   null,
			onBeforeElementValidation: null,
			onAfterElementValidation:  null,
			onBeforeAllValidations:    null,
			onAfterAllValidations:     null,
			
			validateOnSubmit: true,  // should validation occur on form submit if validator is bind to a form
			stopSubmitPropagation: true, // should submit event be stopped on error if validator is bind to a form
			noMsgIfExistsForInstance: [],
			validateTillInvalid: true,
			//拓展validator里面的验证函数,传js对象
			validator: null,
			//拓展modifier函数,传js对象
			modifier : null,
			autoModifiers: {
				'alpha': ['trim'],
				'alphanum': ['trim'],
				'alpha_u': ['trim'],
				'alpha_l': ['trim'],
				'word': ['trim'],
				'num':  ['trim'],
				'integer':    ['trim'],
				'int_plus': ['trim'],
				'int_minus':['trim'],
				'int_no_minus':['trim'],
				'int_no_plus':['trim'],
				'decemal':['trim'],
				'decemal_plus':['trim'],
				'decemal_minus':['trim'],
				'decemal_no_plus':['trim'],
				'decemal_no_minus':['trim'],
				'decemal_only':['trim'],
				'decemal_plus_only':['trim'],
				'decemal_minus_only':['trim'],
				'decemal_no_plus_only':['trim'],
				'decemal_no_minus_only':['trim'],
				'word_zh':['trim'],
				'email':  ['trim'],
				'url':    ['trim'],
				'date':   ['trim'],
				'ip4':    ['trim'],
				'ip6':    ['trim'],
				'mobile': ['trim'],
				'chinese':['trim']
				},
			
			ajaxAnswerValid: 'ok',
			ajaxDelay: 300,
			ajaxOptions: {cache: false},
			ajaxParamName: 'bValue',
			ajaxParams: null,

			// default messages
			errorMessages: {
				zh: {
					'default':    '请输入正确的值',
					'equalto':    '请确认两次输入的值相等',
					'differs':    '请输入不同的值',
					'minlength':  '最少输入{0}个字',
					'maxlength':  '最多输入{0}个字',
					'rangelength':'长度为{0}-{1}',
					'min':        '输入值不能小于{0}',
					'max':        '输入值不能大于{0}',
					'between':    '输入值必须在{0}-{1}之间.',
					'required':   '此选项必填',
					'alpha':     '只能输入字母',
					'alphanum':  '只能输入字母、数字',
					'alpha_u':   '只能输入大写字母',
					'alpha_l':   '只能输入小写字母',
					'word':   	  '只能输入字母、下划线和数字',
					'num':        '只能输入数字',
					'integer':    '只能输入整数',
					'int_plus':   '只能输入正整数',
					'int_minus':  '只能输入负整数',
					'int_no_minus':'只能输入非负整数',
					'int_no_plus':'只能输入非正整数',
					'decemal':    '只能输入小数或整数',
					'decemal_plus':'只能输入正小数或正整数',
					'decemal_minus':'只能输入负小数或负整数',
					'decemal_no_plus':'只能输入非正小数或非正整数',
					'decemal_no_minus':'只能输入非负小数或非负整数',
					'decemal_only':'只能输入小数',
					'decemal_plus_only':'只能输入正小数',
					'decemal_minus_only':'只能输入负小数',
					'decemal_no_plus_only':'只能输入非正小数',
					'decemal_no_minus_only':'只能输入非负小数',
					'word_zh':'只能输入中文、字母、下划线、左括号、右括号和数字',
					'email':      '请输入正确格式的邮箱地址',
					'image':      '请选择正确格式的图片',
					'url':        '请输入正确格式的网址',
					'ip4':        '请输入正确格式的IP4地址',
					'ip6':        '请输入正确格式的IP6地址',
					'date':       '请输入正确的日期格式{0}',
					'mobile':     '请输入正确的手机号码',
					'chinese':    '只能输入中文',
					'idcard':     '请输入正确的身份证号码',
					'tel':        '请输入正确的电话号码',
					'bankCard':   '请输入正确的银行卡号'
					
				}
			}
		},

		_ajaxValidation = function(element, instanceName, ajaxUrl, sync){
			
			var ajax_data = element.data("ajaxData.bV" + instanceName);
			
			if(!ajax_data){
				ajax_data = {};
				element.data("ajaxData.bV" + instanceName, ajax_data);
			}
			else{
				clearTimeout(ajax_data.timeOut);
			}
			
			// value to validate
			ajax_data.val = element.val();
			
			// do not do ajax if value is already validated
			if(ajax_data.lastValidated === ajax_data.val)
				return validator.ajax(ajax_data.lastResponse);
			
			var ajaxOptions = $.extend({}, options.ajaxOptions);
			if(typeof ajaxOptions.data != 'object')
				ajaxOptions.data = {}
			ajaxOptions.url = ajaxUrl;
			
			if(options.ajaxParams)
				$.extend(true, ajaxOptions.data, typeof options.ajaxParams == 'function' ? options.ajaxParams.call(element[0]) : options.ajaxParams);
			
			if(sync){
				var ret = false;
				ajaxOptions.async = false;
				ajaxOptions.data[options.ajaxParamName] = ajax_data.val;
				
				$.ajax(ajaxOptions).done(function(ajaxResponse){
					ajax_data.lastValidated = ajax_data.val;
					ajax_data.lastResponse = ajaxResponse;
					ret = validator.ajax(ajaxResponse)
				});
		
				return ret;
			}
			else{
				ajax_data.timeOut = setTimeout(function() {
	
					var val = element.val();
					
					// only check if the value has not changed
					if(ajax_data.val == val){
						
						ajaxOptions.async = true;
						ajaxOptions.data[options.ajaxParamName] = val;
						
						$.ajax(ajaxOptions).done(function(ajaxResponse){
							ajax_data.lastValidated = val;
							ajax_data.lastResponse = ajaxResponse;
							instance.validate(false, element, undefined, ajaxResponse)
						});
					}
				}, options.ajaxDelay);
			}
			
			return;
		},
		
		//返回所有的对象（包含:hidden、:disabled）
		_getElementsForValidationOn = function(element){
			// skip hidden and input fields witch we do not want to validate
			return element.is(':input') ? element : element.find('[' + options.validateActionsAttr + '], [' + options.modifyActionsAttr + ']').not(":button, :image, :reset, :submit");
		},
		
		// returns all inputs
		_getElementsForValidation = function(element){
			// skip hidden and input fields witch we do not want to validate
			return element.is(':input') ? element : element.find('[' + options.validateActionsAttr + '], [' + options.modifyActionsAttr + ']').not(":button, :image, :reset, :submit, :hidden, :disabled");
		},

		// binds validateOn event
		_bindValidateOn = function(elements){
			elements.not('[' + options.validateOnAttr + ']').bind(options.validateOn + '.bV' + instanceName, {'bVInstance': instance}, function(event){
				event.data.bVInstance.validate(false, $(this));
			});
			elements.filter('[' + options.validateOnAttr + ']').each(function(){
				var trigger = $(this).attr(options.validateOnAttr);
				switch(trigger) {
					case 'change':
					case 'blur':
					case 'keyup':
						$(this).bind(trigger + '.bV' + instanceName, {'bVInstance': instance}, function(event){
							event.data.bVInstance.validate(false, $(this));
						});
						break;
					default :
						try{
							var _trigger = eval(trigger);
							if(typeof _trigger == "function") {
								_trigger.call(this, instance);
							}
						}catch(err){
							
						}
						break;
				}
			});
		},
		
		// checks does message from validator instance exists on element
		_isMsgFromInstanceExists = function(element, instance_names){
			for(var i=0; i<instance_names.length; i++){
				if(element.data("errMsg.bV" + instance_names[i]))
					return true;
			}
			
			return false;
		},

		// displays message
		_showMsg = function(element, messages){

			// if message already exists remove it from DOM
			var rm_result = _removeMsg(element);

			msg_container = $('<div class="bVErrMsgContainer"></div>').css('position','absolute');
			element.data("errMsg.bV" + instanceName, msg_container);
			msg_container.insertAfter(element);

			var messagesHtml = '';

			for(var i=0; i<messages.length; i++)
				messagesHtml += '<div>' + messages[i] + '</div>\n';

			if(options.showCloseIcon)
				messagesHtml = options.templateCloseIcon.replace('{message}', messagesHtml).replace('{closeIconClass}', options.classNamePrefix+options.closeIconClass);

			// make tooltip from template
			var tooltip = $(options.template.replace('{errMsgClass}', options.classNamePrefix+options.errMsgClass).replace('{message}', messagesHtml));
			tooltip.appendTo(msg_container);
			
			// bind close tootlip function
			tooltip.find('.' + options.classNamePrefix+options.closeIconClass).click(function(e){
				e.preventDefault();
				$(this).closest('.'+ options.classNamePrefix+options.errMsgClass).css('visibility', 'hidden');
			});

			var pos = _getErrMsgPosition(element, tooltip); 

			tooltip.css({visibility: 'visible', position: 'absolute', top: pos.top, left: pos.left});
			//add by wang xiaojin, 如果在已显示错误信息情况下 快速显示错误信息
			if(rm_result)
				tooltip.show();
			else
				tooltip.fadeIn(options.showErrMsgSpeed)
			if(options.scrollToError){
				// get most top tolltip
				var tot = tooltip.offset().top;
				if(scroll_to === null || tot < scroll_to)
					scroll_to = tot;
			}
		},

		// removes message from DOM
		_removeMsg = function(element){
			var existingMsg = element.data("errMsg.bV" + instanceName);
			if(existingMsg){
				existingMsg.remove();
				element.data("errMsg.bV" + instanceName, null);
				return true;
			}
			return false;
		},

		// calculates message position
		_getErrMsgPosition = function(input, tooltip){

		        var tooltipContainer = input.data("errMsg.bV" + instanceName),
		         top  = - ((tooltipContainer.offset().top - input.offset().top) + tooltip.outerHeight() - options.offset.y),
		         left = (input.offset().left + input.outerWidth()) - tooltipContainer.offset().left + options.offset.x,
			 x = options.position.x,
			 y = options.position.y;

			// adjust Y
			if(y == 'center' || y == 'bottom'){
				var height = tooltip.outerHeight() + input.outerHeight();
				if (y == 'center') 	{top += height / 2;}
				if (y == 'bottom') 	{top += height;}
			}

			// adjust X
			if(x == 'center' || x == 'left'){
				var width = input.outerWidth();
				if (x == 'center') 	{left -= width / 2;}
				if (x == 'left')  	{left -= width;}
			}

			return {top: top, left: left};
		},

		// calls callback function
		_callBack = function(type, param1, param2, param3){
		        if($.isFunction(options[type])){
		        	return options[type](param1, param2, param3);
			}
		},
		
		// returns checkboxes in a group
		_chkboxGroup = function(chkbox){
			var name = chkbox.attr('name');
			if(name && /^[^\[\]]+\[.*\]$/.test(name)){
				return $('input:checkbox').filter(function(){
					var r = new RegExp(name.match(/^[^\[\]]+/)[0] + '\\[.*\\]$');
					return this.name.match(r);
				});
			}
			
			return chkbox;
		},
		
		//获取指定字符串的长度
	    _getLength = function(element){
			var dom = element.get(0),
	        	ele_type = dom.type,
	        	len = 0;
	        switch(ele_type) {
				case "checkbox":
				case "radio": 
					len = dom.name ? $("input[type='"+ele_type+"'][name='"+dom.name+"']:checked").length
							: element.filter(":checked").length;
					break;
			    case "select-one":
			        len = dom.options ? dom.options.selectedIndex : -1;
					break;
				case "select-multiple":
					len = dom.name ? $("select[name="+dom.name+"] option:selected").length 
							: element.find("option:selected").length;
					break;
				default:
	                var val = element.val();
	                if (options.zh2char) {
	                    for (var i = 0; i < val.length; i++) {
	                        len = len + ((val.charCodeAt(i) >= 0x4e00 && val.charCodeAt(i) <= 0x9fa5) ? 2 : 1);
	                    }
	                } else {
	                    len = val.length;
	                }
	                break;
		    }
			return len;
	    },
		// gets element value	
		_getValue = function(element){
			var dom = element.get(0),
	        	ele_type = dom.type,
	        	val;
			switch(ele_type) {
				case "checkbox":
				case "radio": 
					val = element.attr('name') ? $("input[type='"+ele_type+"'][name='"+element.attr("name")+"']:checked").length
							: element.filter(":checked").length;
					break;
			    case "select-one":
			        val = dom.options ? dom.options.selectedIndex : -1;
					break;
				case "select-multiple":
					val = dom.name ? $("select[name="+dom.name+"] option:selected").length 
							: element.find("option:selected").length;
					break;
				default:
			        val = element.val();
			        break;
		    }
			return val;
		},
		
		// parses bValidator attributes
		_parseAttr = function(attrVal){
		
			// value of validateActionsAttr input attribute
			if(!attrVal)
				return null;
			
			var token = new StringToken(attrVal);
			function nextAttr() {
				var c, attr = "", bracketNum = 0;
				HEAD:
				while((c = token.next()) != StringToken.NULL) {
					
					switch(c) {
					
					case '\\':
						attr = attr.concat(c).concat(token.next());
						break;
					case options.actionsDelimiter: 
						if(bracketNum == 0)
							break HEAD;
						else {
							attr = attr.concat(c);
							break;
						}
					case '[':
						bracketNum++;
						attr = attr.concat(c);
						break;
					case ']':
						bracketNum--;
						attr = attr.concat(c);
						break;
					default:
						attr = attr.concat(c);
						break;
					}
				}
				return attr.trim();
			}
			
			var attrs = [], attr;
			while((attr = nextAttr()) !== "") {
				attrs.push(attr);
			}
			return attrs;
		},
		
		// parses validator action and parameters
		_parseAction = function(actionStr){
		
			var ap = $.trim(actionStr).match(/^(.*?)\[(.*?)\]$/);
		
			if(ap && ap.length == 3){
				return {
					name: ap[1], 
					params: ap[1] === "regex" ? [ap[2]] : ap[2].split(options.paramsDelimiter)
				}
			}
			else{
				return {
					name: actionStr, 
					params:[]
				}
			}
		},
		
		// applys modifier
		_applyModifier = function(action, el){
			
			var oldVal, newVal = _callModifier(action, el);
			if(typeof newVal !== 'undefined'){
				oldVal = $(el).val();
				if(oldVal != newVal)
					$(el).val(newVal);
			}
		},
		
		// calls modifier
		_callModifier = function(action, el){

			var apply_params = [$(el).val()].concat(action.params);
			
			if(typeof modifier[action.name] == 'function')
				return modifier[action.name].apply(el, apply_params);
			else if(typeof window[action.name] == 'function')
				return window[action.name].apply(el, apply_params);
			else {
				try{
					var fun = eval(action.name);
					if(typeof fun == "function") {
						return fun.apply(el, apply_params);
					}
				}catch(err){
					
				}
				if(window.console.warn)
					window.console.warn('[bValidator] unknown modifier: ' + action.name);
			}
		},
		
		// calls validator
		_callValidator = function(action, el, value){
			
			if(typeof validator[action.name] == 'function'){
				return validator[action.name].apply(el, [value].concat(action.params)); // add input value to beginning of action.params
			}else if(typeof window[action.name] == 'function'){
				// call custom user defined function
				return window[action.name].apply(el, [value].concat(action.params));
			}else {
				try{
					var fun = eval("window." + action.name);
					if(typeof fun == "function") {
						return fun.apply(el, [value].concat(action.params));
					}
				}catch(err){
					
				}
				if(window.console.warn)
					window.console.warn('[bValidator] unknown validator: ' + action.name);
			}
			
		},					

		// object with validator actions
		validator = {
			equalto: function(v, elementId){
				return v == $('#' + elementId).val();
			},
			//referName - 参照物名、被比较的对象名
			compare: function (v, op, elementId, referName) {
			    var msg = "输入值应{0}“{1}”",
                    referVal = $('#' + elementId).val(),
                    opName = '',
                    compareVal = utils.compare(v, referVal),
                    referName = referName ? referName : referVal;
			    referName = referName && referName.trim() ? referName : "空";
			    switch (op) {
			        case "eq":
			            opName = "等于";
			            if (equalto(v, elementId))
			                return true;
			            break;
			        case "ne":
			            opName = "不等于";
			            if (differs(v, elementId))
			                return true;
			            break;
			        case "gt":
			            opName = "大于";
			            if (compareVal == 1)
			                return true;
			            break;
			        case "ge":
			            opName = "大于等于";
			            if (compareVal >= 0)
			                return true;
			            break;
			        case "lt":
			            opName = "小于";
			            if (compareVal == -1)
			                return true;
			            break;
			        case "le":
			            opName = "小于等于";
			            if (compareVal <= 0)
			                return true;
			            break;
			    }
			    return msg.format(opName, referName);
			},
			differs: function(v, elementId){
				return v != $('#' + elementId).val();
			},
			minlength: function(v, minlength){
				if(utils.isNumber(v))
					return (v >= parseInt(minlength))
				else
					return (v.length >= parseInt(minlength))
			},
			maxlength: function(v, maxlength){
				if(utils.isNumber(v))
					return (v <= parseInt(maxlength))
				else
					return (v.length <= parseInt(maxlength))
			},
			rangelength: function(v, minlength, maxlength){		
				if(utils.isNumber(v))
					return (v >= parseInt(minlength) && v <= parseInt(maxlength))
				else
					return (v.length >= parseInt(minlength) && v.length <= parseInt(maxlength))
			},
			min: function(v, min){		
				if(!utils.isNumber(v) && !validator.decemal(v))
		 			return false;
		 		return (parseFloat(v) >= parseFloat(min))
			},
			max: function(v, max){		
				if(!utils.isNumber(v) && !validator.decemal(v))
		 			return false;
		 		return (parseFloat(v) <= parseFloat(max))
			},
			between: function(v, min, max){
			   	if(!utils.isNumber(v) && !validator.decemal(v))
			 		return false;
				var va = parseFloat(v);
				return (va >= parseFloat(min) && va <= parseFloat(max))
			},
			required: function(v){
				/*if(utils.isUndefined(v)) {
					var tagName = this.tagName;
					switch(tagName) {
						case "INPUT":
						case "TEXTAREA":
						case "SELECT":
							return false;
						default :
							return true;
				    }
				}*/
				if(utils.isNumber(v)) 
					return true;
				else if(!v || !$.trim(v))
					return false
				return true
			},
			alpha: function(v) { return validator.regex(v, regex.alpha); },
			alphanum: function(v) { return validator.regex(v, regex.alphanum); },
			alpha_u: function(v) { return validator.regex(v, regex.alpha_u); },
			alpha_l: function(v) { return validator.regex(v, regex.alpha_l); },
			word: function(v) { return validator.regex(v, regex.word); },
			num: function(v){ return validator.regex(v, regex.num); },
			integer: function(v){ return validator.regex(v, regex.integer); },
			int_plus: function(v){ return validator.regex(v, regex.int_plus); },
			int_minus: function(v){ return validator.regex(v, regex.int_minus); },
			int_no_minus: function(v){ return validator.regex(v, regex.int_no_minus); },
			int_no_plus: function(v){ return validator.regex(v, regex.int_no_plus); },
			decemal: function(v){ return validator.regex(v, regex.decemal); },
			decemal_plus: function(v){ return validator.regex(v, regex.decemal_plus); },
			decemal_minus: function(v){ return validator.regex(v, regex.decemal_minus); },
			decemal_no_plus: function(v){ return validator.regex(v, regex.decemal_no_plus); },
			decemal_no_minus: function(v){ return validator.regex(v, regex.decemal_no_minus); },
			decemal_only: function(v){ return validator.regex(v, regex.decemal_only); },
			decemal_plus_only: function(v){ return validator.regex(v, regex.decemal_plus_only); },
			decemal_minus_only: function(v){ return validator.regex(v, regex.decemal_minus_only); },
			decemal_no_plus_only: function(v){ return validator.regex(v, regex.decemal_no_plus_only); },
			decemal_no_minus_only: function(v){ return validator.regex(v, regex.decemal_no_minus_only); },
			
			chinese: function(v){
				return validator.regex(v, regex.chinese);
			},
			word_zh: function(v){
				return validator.regex(v, regex.word_zh);
			},
			mobile: function(v){
				return validator.regex(v, regex.mobile);
			},
			idcard: function(v){
				return validator.regex(v, regex.idcard);
			},
			tel: function(v){
				return validator.regex(v, regex.tel );
			},
			bankCard: function(v){
				return validator.regex(v, regex.bankCard );
			},
			email: function(v){
				return validator.regex(v, regex.email);
			},
			image: function(v){
				return validator.regex(v, /\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/i);
			},
			url: function(v){
				return validator.regex(v, regex.url);
			},
			regex: function(v, regex, mod){
				return utils.regex(v, regex, mod);
			},
			ip4: function(v){
				return validator.regex(v, regex.ip4);
			},
			//数据太大，注释掉
			//ip6: function(v){
			//	return validator.regex(v, /^(?:(?:(?:[A-F\d]{1,4}:){5}[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){4}:[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){3}(?::[A-F\d]{1,4}){1,2}|(?:[A-F\d]{1,4}:){2}(?::[A-F\d]{1,4}){1,3}|[A-F\d]{1,4}:(?::[A-F\d]{1,4}){1,4}|(?:[A-F\d]{1,4}:){1,5}|:(?::[A-F\d]{1,4}){1,5}|:):(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)|(?:[A-F\d]{1,4}:){7}[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){6}:[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){5}(?::[A-F\d]{1,4}){1,2}|(?:[A-F\d]{1,4}:){4}(?::[A-F\d]{1,4}){1,3}|(?:[A-F\d]{1,4}:){3}(?::[A-F\d]{1,4}){1,4}|(?:[A-F\d]{1,4}:){2}(?::[A-F\d]{1,4}){1,5}|[A-F\d]{1,4}:(?::[A-F\d]{1,4}){1,6}|(?:[A-F\d]{1,4}:){1,7}:|:(?::[A-F\d]{1,4}){1,7})$/i);
			//},
			date: function(v, format){ // format can be any combination of mm,dd,yyyy with separator between. Example: 'mm.dd.yyyy' or 'yyyy-mm-dd'
				if(v.length == 10 && format.length == 10){
					var s = format.match(/[^mdy]+/g);
					if(s.length == 2 && s[0].length == 1 && s[0] == s[1]){

						var d = v.split(s[0]),
						 f = format.split(s[0]);

						for(var i=0; i<3; i++){
							if(f[i] == 'dd') var day = d[i];
							else if(f[i] == 'mm') var month = d[i];
							else if(f[i] == 'yyyy') var year = d[i];
						}

						var dobj = new Date(year, month-1, day)
						if ((dobj.getMonth()+1!=month) || (dobj.getDate()!=day) || (dobj.getFullYear()!=year))
							return false

						return true
					}
				}
				return false;
			},
			extension: function(){
				var v = arguments[0],
				 r = '';
				if(!arguments[1])
					return false
				for(var i=1; i<arguments.length; i++){
					r += arguments[i];
					if(i != arguments.length-1)
						r += '|';
				}
				return validator.regex(v, '\\.(' +  r  + ')$', 'i');
			},
			ajax: function(ajaxResponse){
				if(ajaxResponse == options.ajaxAnswerValid)
					return true;
				return false;
			}
		},
		
		// object with modifiers
		modifier = {
			
			trim: function(v){
				return $.trim(v);
			}
		},

		// validator instance, scroll position flag
		instance = this, scroll_to;
		

		// global options
		if(window['bValidatorOptions'])
			$.extend(true, options, window['bValidatorOptions']);

		// passed options
		if(overrideOptions)
			$.extend(true, options, overrideOptions);
		// 拓展validator方法
		if(options.validator) {
			$.extend(true, validator, options.validator);
		}
		// 拓展modifier方法
		if(options.modifier) {
			$.extend(true, modifier, options.modifier);
		}
	
		// object with all validator instances
		var allInstances = mainElement.data("bValidators");
		if(!allInstances){
			allInstances = {};
			mainElement.data("bValidators", allInstances);
		}
		
		// if there is already first instance
		if(mainElement.data("bValidator")){
			if(!instanceName)
				return mainElement.data("bValidator"); // return existing instance

			if(allInstances[instanceName])
				return allInstances[instanceName];
		}
		else{
			if(!instanceName)
				instanceName = 'first';
			mainElement.data("bValidator", this);
		}
		
		allInstances[instanceName] = this;
		
		
		// if bind to a form
		if(mainElement.is('form')){
			
			// bind validation on form submit
			if(options.validateOnSubmit){
				mainElement.bind("submit.bV" + instanceName, function(event){
					
					if(instance.validate(false, undefined, 1))
						return true;
					else if(options.stopSubmitPropagation){
						event.stopImmediatePropagation();
						return false;
					}
				});
			}

			// bind reset on form reset
			mainElement.bind("reset.bV" + instanceName, function(){
				instance.reset();			
			});
		}

		// bind validateOn event
		if(options.validateOn)
			_bindValidateOn(_getElementsForValidationOn(mainElement));


		// API functions:

		// validation function
		this.validate = function(doNotshowMessages, elementsOverride, forceAjaxSync, ajaxResponse, onlyIsValidCheck){

			// return value, elements to validate
			var ret = true, elementsl;
			
			if(elementsOverride)
				elementsl = elementsOverride;
			else{
				if(mainElement.attr(options.forceValidAttr) == 'true')
					return true;
				
				elementsl = _getElementsForValidation(mainElement);
			}

			scroll_to = null;

			if(typeof ajaxResponse !== 'undefined' || _callBack('onBeforeAllValidations', elementsl) !== false){

				// validate each element
				elementsl.each(function(){

					var actions_exp = _parseAttr($(this).attr(options.validateActionsAttr)), // all validation actions
					 modifiers_exp = _parseAttr($(this).attr(options.modifyActionsAttr)), // all modifier actions
					 k = -1, action_data = [], action, is_valid = 0;
					
					// call modifiers
					if(modifiers_exp){
						for(var i=0; i<modifiers_exp.length; i++){
						
							action = _parseAction(modifiers_exp[i]);
							
							if(!action.name)
								continue;
							
							// call modifier
							_applyModifier(action, this);
						}
					}
					
					// call auto modifiers and prepare validation actions
					if(actions_exp){
						for(var i=0; i<actions_exp.length; i++){
						
							action = _parseAction(actions_exp[i]);
							
							if(!action.name)
								continue;
							
							// auto modifiers
							if(options.autoModifiers && options.autoModifiers[action.name]){
								for(var h=0; h<options.autoModifiers[action.name].length; h++)
									_applyModifier(_parseAction(options.autoModifiers[action.name][h]), this);
							}
							
							if(action.name == 'required')
								var flagRequired = 1;
							else if(action.name == 'ajax')
								var flagAjax = 1;
							
							if(action.name == 'valempty')
								var flagValempty = 1;
							else
								action_data[++k] = action; // action objects, with name and params
							
						}
					}
					else
						return true; // no actions for validation
						
					var inputValue = _getValue($(this)), // value of input field for validation;
					 errorMessages = [], validationResult;
					
					// call async ajax validation and skip element
					if(!forceAjaxSync && flagAjax && typeof ajaxResponse === 'undefined'){
						
						var skipAjaxAction = 0;
						
						// call all validators till ajax
						for(var i=0; i<action_data.length; i++){
							if(action_data[i].name == 'ajax')
								break;
							
							if(!_callValidator(action_data[i], this, inputValue)){
								skipAjaxAction = 1;
								break;
							}
						}
						
						if(!skipAjaxAction){
							ajaxResponse = _ajaxValidation($(this), instanceName, action.params[0]);
							if(typeof ajaxResponse === 'undefined'){
								return true;
							}
						}
					}
						
					// do not show message if exists for instance specified by noMsgIfExistsForInstance option
					if(options.noMsgIfExistsForInstance.length && _isMsgFromInstanceExists($(this), options.noMsgIfExistsForInstance))
						doNotshowMessages = 1;

					// if value is not required and is empty
					if((!flagRequired && !flagValempty && !validator.required.call(this, inputValue)) || $(this).attr(options.forceValidAttr) == 'true')
						is_valid = 1;

					if(!is_valid){

						// get message from attribute
						var errMsg = $(this).attr(options.errorMessageAttr),
						 skip_messages = 0;

						// mark field as validated
						$(this).data('checked.bV' + instanceName, 1);

						if(_callBack('onBeforeElementValidation', $(this)) !== false){
		
							// for each validation action
							for(var i=0; i<action_data.length; i++){
								
								if(action_data[i].name == 'valempty')
									continue;
									
								if((options.validateTillInvalid || onlyIsValidCheck) && errorMessages.length){
									break;
								}
								
								if(_callBack('onBeforeValidate', $(this), action_data[i].name) === false)
									continue;

								if(action_data[i].name == 'ajax'){
									
									if(skipAjaxAction)
										continue;
										
									if(forceAjaxSync || typeof ajaxResponse === 'undefined'){
										if(!errorMessages.length){
											validationResult = _ajaxValidation($(this), instanceName, action_data[i].params[0], 1);
										}
										else
											validationResult = true; // skip ajax validation if value is already invalid
									}
									else{
										validationResult = validator.ajax.apply(this, [ajaxResponse]);
									}
								}
								else{
									validationResult = _callValidator(action_data[i], this, inputValue);
								}
								
								if(_callBack('onAfterValidate', $(this), action_data[i].name, validationResult) === false)
									continue;
								//add by wang xiaojin
								if(validationResult && typeof(validationResult) === "string") {
									errMsg = validationResult;
									validationResult = false;
								}
								// if validation failed
								if(!validationResult){
									
									// if messages needs to be shown
									if(!doNotshowMessages){
		
										if(!skip_messages){
											
											// if there is no message from errorMessageAttr
											if(!errMsg){
												
												if (options.singleError && errorMessages.length){
													skip_messages = 1;
													errMsg = '';
												}
												else{
													// lang set
													if(options.errorMessages[options.lang] && options.errorMessages[options.lang][action_data[i].name])
														errMsg = options.errorMessages[options.lang][action_data[i].name];
													// lang en
													else if(options.errorMessages.zh[action_data[i].name])
														errMsg = options.errorMessages.zh[action_data[i].name];
													else{
														// action msg attribute
														var tt = $(this).attr(options.errorMessageAttr + '-' + action_data[i].name);
														if(tt)
															errMsg = tt;
														// lang set default msg
														else if(options.errorMessages[options.lang] && options.errorMessages[options.lang]['default'])
															errMsg = options.errorMessages[options.lang]['default'];
														// lang en default msg
														else
															errMsg = options.errorMessages.zh['default'];
													}
												}
												
											}
											else{
												skip_messages = 1;
											}
		
											// replace values in braces
											if(errMsg.indexOf('{')){
												for(var j=0; j<action_data[i].params.length; j++)
													errMsg = errMsg.replace(new RegExp("\\{" + j + "\\}", "g"), action_data[i].params[j]);
											}
		
											if(!(errorMessages.length && action_data[i].name == 'required'))
												errorMessages[errorMessages.length] = errMsg;
		
											errMsg = null;
										}
									}
									else
										errorMessages[errorMessages.length] = '';
		
									ret = false;
		
									_callBack('onValidateFail', $(this), action_data[i].name, errorMessages);
								}
								else{
									_callBack('onValidateSuccess', $(this), action_data[i].name);
								}
							}
						}
						
						var onAfterElementValidation = _callBack('onAfterElementValidation', $(this), errorMessages);	
					}
						
					
					// show messages and bind events
					if(!doNotshowMessages && onAfterElementValidation !== false && $(this).data('checked.bV' + instanceName)){

						var chk_rad = $(this).is('input:checkbox,input:radio') ? 1 : 0;
	
						// if validation failed
						if(errorMessages.length){
							
							if(onAfterElementValidation !== 0)
								_showMsg($(this), errorMessages)
	
							if(!chk_rad){
								$(this).removeClass(options.classNamePrefix+options.validClass);
								if(options.errorClass)
									$(this).addClass(options.classNamePrefix+options.errorClass);
							}
			
							// input validation event
							if (options.errorValidateOn){
								/*if(options.validateOn)
									$(this).unbind(options.validateOn + '.bV' + instanceName);*/
	
								var evt = chk_rad || $(this).is('select,input:file') ? 'change' : options.errorValidateOn;
	
								if(chk_rad){
									var group = $(this).is('input:checkbox') ? _chkboxGroup($(this)) : $('input:radio[name="' + $(this).attr('name') + '"]');
									if(!utils.bindedEvent(group, "change", 'bVerror' + instanceName)) {
										if(utils.bindedEvent($(this), "change", 'bV' + instanceName))
											group = group.not(this);
										group.bind('change.bVerror' + instanceName, {'bVInstance': instance, 'groupLeader': $(this)}, function(event){
											event.data.bVInstance.validate(false, event.data.groupLeader);
										});
									}
								}
								else{
									//当this触发验证事件不是evt，且没有绑定evt的error事件时才会绑定error事件
									if(!utils.bindedEvent($(this), evt, 'bV' + instanceName)
											&& !utils.bindedEvent($(this), evt, 'bVerror' + instanceName)) {
										$(this).bind(evt + '.bVerror' + instanceName, {'bVInstance': instance}, function(event){
											event.data.bVInstance.validate(false, $(this));
										});
									}
								}
							}
						}
						else{
							if(onAfterElementValidation !== 0)
								_removeMsg($(this));
	
							if(!chk_rad){
								$(this).removeClass(options.classNamePrefix+options.errorClass);
								if(options.validClass)
									$(this).addClass(options.classNamePrefix+options.validClass);
							}
	
							/*if (options.validateOn){
								$(this).unbind(options.validateOn + '.bV' + instanceName);
								_bindValidateOn($(this));
							}*/
							
							$(this).data('checked.bV' + instanceName, 0);
						}
					}
					
					if((options.singleError || onlyIsValidCheck) && ret === false)
						return false;
					
				});
			}

			_callBack('onAfterAllValidations', elementsl, ret);

			// scroll to message
			if(scroll_to && !elementsOverride && ($(window).scrollTop() > scroll_to || $(window).scrollTop()+$(window).height() < scroll_to)){
				var ua = navigator.userAgent.toLowerCase();			
				$(ua.indexOf('chrome')>-1 || ua.indexOf('safari')>-1 ? 'body' : 'html').animate({scrollTop: scroll_to - 10}, {duration: 'slow'});
			}

			return ret;
		}

		// returns options object
		this.getOptions = function(){
			return options;
		}
		
		// returns validator object
		this.getValidators = this.getActions = function(){
			return validator;
		}
		
		// returns modifier object
		this.getModifiers = function(){
			return modifier;
		}

		// checks validity
		this.isValid = function(elements){
			return this.validate(true, elements, 1, undefined, true);
		}

		// deletes message
		this.removeMsg = this.removeErrMsg = function(elements){
			elements.each(function(){
				_removeMsg($(this));
			});
		}
		
		// shows message
		this.showMsg = function(elements, message){
			if(elements.length){
				if(typeof(message)=='string')
					message = [message];
				
				elements.each(function(){
					_showMsg($(this), message);
				});
			}
		}

		// returns all inputs
		this.getInputs = function(){
			return _getElementsForValidation(mainElement);
		}

		// binds validateOn event
		this.bindValidateOn = function(elements){
			_bindValidateOn(elements);
		}

		// resets validation
		this.reset = function(elements){
			
			if(!elements || !elements.length)
				elements = _getElementsForValidation(mainElement);
			//add by wang xiaojin.因为会造成多次绑定了时间
			//if (options.validateOn)
			//	_bindValidateOn(elements);
			elements.each(function(){
				_removeMsg($(this));
				$(this).unbind('.bVerror' + instanceName);
				$(this).removeClass(options.classNamePrefix+options.errorClass);
				$(this).removeClass(options.classNamePrefix+options.validClass);
				$(this).removeData('ajaxData.bV' + instanceName);
				$(this).removeData('errMsg.bV' + instanceName);
				$(this).removeData('checked.bV' + instanceName);
			});
		}

		this.destroy = function(){
			if (mainElement.is('form'))
				mainElement.unbind('.bV' + instanceName);
			
			this.reset();
			
			mainElement.removeData("bValidator");
			mainElement.removeData("bValidators");
		}
	}

})(jQuery);
