/**
 * @author WangXiaoJin
 * @version 0.1.1
 */
;(function($){
	
	var $win = $(window);
	
	window.utils = {
		browser: (function() {
			var ua = navigator.userAgent.toLowerCase(), s, data = {};
		    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? data.ie = parseFloat(s[1]) :
		    (s = ua.match(/msie ([\d.]+)/)) ? data.ie = parseFloat(s[1]) :
		    (s = ua.match(/firefox\/([\d.]+)/)) ? data.firefox = parseFloat(s[1]) :
		    (s = ua.match(/edge.([\d.]+)/)) ? data.edge = parseFloat(s[1]) :
		   	(s = ua.match(/opr.([\d.]+)/)) ? data.opera = parseFloat(s[1]) :
		    (s = ua.match(/chrome\/([\d.]+)/)) ? data.chrome = parseFloat(s[1]) :
		    (s = ua.match(/version\/([\d.]+).*safari/)) ? data.safari = parseFloat(s[1]) : 0;
		    return data;
		})(),
		extend: function(target, source){
			if(source) {
				for (var p in source) {
					if (source.hasOwnProperty(p)) {
						target[p] = source[p];
					}
				}
			}
			 return target;
		},
		loadJs: function(url, callback){
			var done = false;
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.language = 'javascript';
			script.src = url;
			script.onload = script.onreadystatechange = function(){
				if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete')){
					done = true;
					script.onload = script.onreadystatechange = null;
					if (callback){
						callback.call(script);
					}
				}
			};
			document.getElementsByTagName("head")[0].appendChild(script);
		},
		runJs: function(url, callback){
			loadJs(url, function(){
				document.getElementsByTagName("head")[0].removeChild(this);
				if (callback){
					callback();
				}
			});
		},
		loadCss: function(url, callback){
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.media = 'screen';
			link.href = url;
			document.getElementsByTagName('head')[0].appendChild(link);
			if (callback){
				callback.call(link);
			}
		},
		obtainEvent: function(){
			//获取事件的对象
			var e = window.event ? window.event : null;
			if(!e){
				var fun = utils.obtainEvent.caller;
				while(fun){
					// Firefox 中一个隐含的对象 arguments，第一个参数为 event 对象
					var arg0 = fun.arguments[0];
					if(arg0 && ((arg0.constructor == Event || arg0.constructor == MouseEvent) 
			               ||(typeof arg0 === "object" && arg0.preventDefault && arg0.stopPropagation))){
						e = arg0;
						break;
					}
					fun = fun.caller;
				}
			}
			return e;
		},
		obtainEventSrc: function(){
			var e = utils.obtainEvent();
			return e ? e.srcElement ? e.srcElement : e.target : null;
		},
		isParamUrl: function(url) {
			//判断指定的URL是否带参数
			if(url) {
				var index = url.indexOf("?");
				if(index != -1) {
					url = url.substring(index + 1);
					if(url.length > 0)
						return true;
				}
			}
			return false;
		},
		/**
		 * 获取url参数，组装成对象
		 * @param url 不传默认使用当前地址
		 * xxx.xxx.xxx?name=wang&age=100 ==> {name: "wang", age: "100"}
		 */
		getUrlParams: function(url) {
			url = url || window.location.href;
			var data = {},
				index = url.indexOf("?");
			if(index != -1) {
				url = url.substring(index + 1);
				var params = url.split("&");
				for(var i = 0; i < params.length; i++) {
					var obj = params[i].split("=");
					data[obj[0]] = obj[1] ? encodeURIComponent(obj[1]) : obj[1];
				}
			}
			return data;
		},
		addUrlParams: function(url, name, value) {
			if(!utils.isString(url) || !name) return url;
			if(url) {
				//标示此请求为历史请求
				if(url.lastIndexOf("?") == -1)
					url += "?";
				else if(url.lastIndexOf("?") < url.length - 1)
					url += "&";
				url += name + (utils.isUndefined(value) ? "" : "=" + value);
			}
			return url;
		},
		/**
		 * 缓存URL，成功返回true，失败返回false
		 */
		cacheUrl: function(url) {
			if(!url) return false;
			var maxNum = 20,
				urls = sessionStorage.cacheUrl;
			if(urls) {
				urls = JSON.parse(urls);
				urls.push(url);
			}else {
				urls = [url];
			}
			while(urls.length > 20) {
				urls.shift();
			}
			sessionStorage.cacheUrl = JSON.stringify(urls);
			return true;
		},
		/**
		 * 取出最近一个缓存url，没有则返回null
		 */
		popCacheUrl: function() {
			var urls = sessionStorage.cacheUrl;
			if(urls) {
				urls = JSON.parse(urls);
				if(urls.length > 0) {
					var url = urls.pop();
					sessionStorage.cacheUrl = JSON.stringify(urls);
					return url;
				}
			}
			return null;
		},
		regex: function(val, regex, mod) {
			if(!utils.isString(val)) return false;
			if(typeof regex === "string")
				return new RegExp(regex, mod || "").test(val);
			return regex.test(val);
		},
	    //获取文件类型
	    fileType: function(file){
	    	return file && file.substring(file.lastIndexOf(".") + 1).toLowerCase();
	    },
	    //获取文件名
	    fileName: function(file){
	    	if(!file) return file;
	    	var t = file.replace("\\", "/"),
	    		start = t.lastIndexOf("/"),
	    		end = t.lastIndexOf(".");
			return t.substring(start == -1 ? 0 : start + 1, end);
	    },
	    clone: function(obj){
		    if(obj === null 
		    	|| obj === undefined
		    	|| typeof obj !== "object") return obj;
		    var o = null;
		    if(obj.constructor === Array) {
		    	o = [];
		    	for(var i = 0; i < obj.length; i++){
		    		o[i] = typeof obj[i] === "object" ? utils.clone(obj[i]) : obj[i];
		    	}
		    }else {
		    	o = {};
		    	for(var key in obj){
		    		o[key] = typeof obj[key] === "object" ? utils.clone(obj[key]) : obj[key];
		    	}
		    }
		    return o;
		},
		//url 需要删除或增加的规则 ad/abc_r100c100_r50c50.jpg
		//mode == add || remove  rule == r100c100
		imgUrlFormat : function(url, mode, rule){
			if(!url || (url = $.trim(url)) === "" || !rule) return url;
			if(mode === 'remove'){
				return url.replace(new RegExp("_" + rule, "g"), "");
			}else if(mode === 'add'){
				return url.replace(new RegExp("^((https?://)?(/|\\\\)?([^/\\\\]+(/|\\\\))*?[0-9a-z]+(_[0-9a-z]+)*)(\\.[a-z]+)$", "g"), "$1_" + rule + "$7");
			}
		},
		//获取图片地址的原图
		imgUrlOriginal: function(url){
			if(!url || (url = $.trim(url)) === "") return url;
			return url.replace(new RegExp("_[0-9a-z]+", "g"), "");
		},
		//获取路径倒数第二个path
		url2ndEndPath: function(url){
			var m = new RegExp("^.*?(/|\\\\)([^/\\\\]+)(/|\\\\)[^/\\\\]+(/|\\\\)?$").exec(url);
			return m && m[2];
		},
		isArray: function(val) {
			return Object.prototype.toString.call(val) === '[object Array]';
		},
		isFunction: function(val) {
			return Object.prototype.toString.call(val) === '[object Function]';
		},
		isUndefined: function(val){
			return typeof(val) === "undefined";
		},
		isString: function(val){
			return Object.prototype.toString.call(val) === '[object String]';
		},
		isNumber: function(val){
			return Object.prototype.toString.call(val) === '[object Number]' && !isNaN(val);
		},
		//8.00 也视为int数据
		isInt: function(val) {
			return utils.isNumber(val) && parseInt(val) === val;
		},
		isBoolean: function(val){
			return Object.prototype.toString.call(val) === '[object Boolean]';
		},
		isObject: function(val){
			return Object.prototype.toString.call(val) === '[object Object]';
		},
		//判断val是否是null、undefined、空数组、空字符窜（与isBlank有区别）
		isEmpty: function(val) {
			return val == null || (utils.isArray(val) ? val.length == 0 : val.toString() == "" );
		},
		//判断val是不是null、undefined、空字符窜、空白字符窜(由换行符、空格组成)
		isBlank: function(val) {
			return val == null || val.toString().trim() == "";
		},
		//字符窜解析成对象
		parse: function (str, isSimpleObj) {
            if (!utils.isString(str)) return str;
			if (isSimpleObj && !str.trim().startsWith('{')) {
				str = '{' + str + '}';
			}
			return (new Function('return ' + str))();
        },
      //转换数据为int类型，NaN返回defaultVal，defaultVal默认为0
        parseInt: function (val, radix, defaultVal) {
            defaultVal = defaultVal == null ? 0 : defaultVal;
            if (val == null) return defaultVal;
            if (utils.isString(val)
					&& (val = val.trim()).length > 0) {
                var c = val.charAt(val.length - 1);
                if (c === '%') {
                    val = parseFloat(val) / 100;
                } else if (c === '‰') {
                    val = parseFloat(val) / 1000;
                }
            }
            val = parseInt(val, radix);
            return isNaN(val) ? defaultVal : val;
        },
        //转换数据为float类型，NaN返回defaultVal，defaultVal默认为0
        parseFloat: function (val, defaultVal) {
            defaultVal = defaultVal == null ? 0 : defaultVal;
            if (val == null) return defaultVal;
            if (utils.isString(val)
					&& (val = val.trim()).length > 0) {
                var c = val.charAt(val.length - 1);
                if (c === '%') {
                    val = parseFloat(val) / 100;
                } else if (c === '‰') {
                    val = parseFloat(val) / 1000;
                }
            }
            val = parseFloat(val);
            return isNaN(val) ? defaultVal : val;
        },
		//比较两个值得大小：返回值为 -1、0、1
		compare: function(self, other) {
		    function convert(val) {
		        if(val == null)
		            return "";
		        else if(utils.isNumber(val))
		            return val + "";
		        else if(utils.isBoolean(val)) {
		            if(val === true)
		                return "1";
		            else 
		                return "0";
		        }else if(val instanceof Date) {
		            return val.getTime();
		        }else
		            return val.toString();
		    }
		    self = convert(self);
		    other = convert(other);
			
		    var reg = new RegExp("^\\s*([$￥]?)\\s*(([\\+-]?)\\d*\\.?\\d+)\\s*([$￥%‰]?)\\s*$"),
				selfs = reg.exec(self),
				others = reg.exec(other);
		    //比较￥100 这种带前缀、后缀的值
		    if(selfs && others && selfs[1] === others[1] && selfs[4] === others[4]) {
		        self = utils.parseFloat(selfs[2]);
		        other = utils.parseFloat(others[2]);
		        if(self == other)
		            return 0;
		        else if(self < other)
		            return -1;
		        else
		            return 1;
		    }else {
		        if(self.length < other.length)
		            return -1;
		        else if(self.length == other.length) {
		            if(self < other)
		                return -1;
		            else if(self == other)
		                return 0;
		            else
		                return 1;
		        }else
		            return 1;
		    }
		},
		//获取参数val的值，如果val是函数则return函数的返回值，否则直接返回val
		val: function(val, defaultVal) {
			var tmp = val;
			if(utils.isFunction(tmp))
				tmp = tmp();
			if(utils.isUndefined(tmp) || tmp === null)
				tmp = defaultVal;
			return tmp;
		},
		/**
		 * 返回字符窜，如果val不能转化成数字，则返回0的格式化。digit为小数位数
		 * val == null时，返回defaultVal
		 * @param removeZero boolean类型，默认值false
		 * @param roundMode 格式化类型，默认是"floor"
 		 * 	值为"ceil"(向上舍入)，"floor"(向下舍入)，"round"(四舍五入)
		 * 例子：
		 *  1. utils.fmtDecimal(1.567, 2)
		 *  2. utils.fmtDecimal(1.567, 2, "round")
		 *  3. utils.fmtDecimal(1.567, 2, true)
		 * 	1. utils.fmtDecimal(1.567, 2, true, "floor")
		 */
		fmtDecimal: function(val, digit, removeZero, roundMode, defaultVal){
			if(val == null) return defaultVal == null ? null : defaultVal;
			val = utils.parseFloat(val);
			digit = digit && digit > 0 ? digit : 0;
			if(utils.isString(removeZero)) {
				roundMode = removeZero;
				removeZero = false;
			}
			roundMode = roundMode ? roundMode : "floor";
			var valStr = val.toString(),
				frags = valStr.split(".");
			if(frags.length == 1)
				frags.push("");
			if(frags[1].length <= digit || roundMode == "round") {
				valStr = val.toFixed(digit);
			}else {
				switch(roundMode) {
					case "ceil":
						var c = parseInt(frags[1].charAt(digit));
						if(c > 0) {
							if(digit == 0) {
								frags[0] = parseInt(frags[0]) + 1 + "";
								frags[1] = "";
							}else {
								var tmp = parseInt(frags[1].slice(0, digit)) + 1 + "";
								if(tmp.length > digit) {
									//加1后进位到整数部分
									frags[0] = parseInt(frags[0]) + 1 + "";
									frags[1] = tmp.slice(1);
								}else {
									frags[1] = tmp;
								}
							}
						}
					  	break;
					case "floor":
						frags[1] = frags[1].slice(0, digit);
					  	break;
				}
				valStr = frags[0].concat(frags[1] ? "." + frags[1] : "");
			}
			if(removeZero) {
				return parseFloat(valStr).toString();
			}else {
				return valStr;
			}
		},
		/**
		 * 格式化整数，小数直接切割，不会进位。digit为整数位数。val == null时，返回defaultVal
		 */
		fmtNumber: function(val, digit, defaultVal) {
			if(val == null) return defaultVal == null ? null : defaultVal;
			val = utils.parseInt(val).toString();
			if(!digit) return val;
			if(val.length < digit) {
				return "0".repeat(digit - val.length) + val;
			}else if(val.length == digit)
				return val;
			else {
				return val.substr(-digit);
			}
		},
		/**
		 * expression 对象导航表达式	例：utils.ognl({per: {name: "wang"}}, "per.name");
		 */
		ognl: function(obj, expression) {
			if(!obj || !expression) return null;
			var token = new StringToken(expression), key;
			function nextKey() {
				var c, key = "";
				HEAD:
				while((c = token.next()) != StringToken.NULL) {
					
					switch(c) {
					
					case '\\':
						key = key.concat(c).concat(token.next());
						break;
					case '.': 
						break HEAD;
						
					case '[':
						if(key.length > 0) {
							token.back();
							break HEAD;
						}
						
						var inner;
						INNER:
						while((inner = token.next()) != NULL) {
							
							switch(inner) {
							
							case ']':
								break INNER;
							case '\\':
								key = key.concat(inner).concat(token.next());
								break;
							case '"':
							case '\'':
								var inmost;
								INMOST:
								while((inmost = token.next()) != NULL) {
									if(inmost == inner) {
										break INMOST;
									}
									else if(inmost == '\\')
										key = key.concat(inmost).concat(token.next());
									else
										key = key.concat(inmost);
								}
								break;
							default:
								key = key.concat(inner);
								break;
							}
						}
						break;
					default:
						key = key.concat(c);
						break;
					}
				}
				return key.trim();
			}
			while((key = nextKey()) !== "") {
				if(!obj) return null;
				obj = obj[key];
			}
			return obj;
		},
		//添加单位（默认px）
		addUnit: function (val, unit) {
			unit = unit || 'px';
			return val && new RegExp(regex.decemal).test(val) ? val + unit : val;
		},
		//删除单位
		removeUnit: function (val) {
			var match;
			return val && (match = /(([\+-]?)\d*\.?\d+)/.exec(val)) ? utils.parseFloat(match[1]) : 0;
		},
		escape: function (val) {
		    if (!utils.isString(val)) return val;
		    return val.replace(/[<>&"]/g, function (c) {
		        return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
		    });
		},
		unescape: function (val) {
		    if (!utils.isString(val)) return val;
		    return val.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
		        return { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' }[t];
		    });
		},
		//创建dom元素
		dom: function(domTag, id, className, css) {
			var element = document.createElement(domTag);
			if(id)
				element.id = id;
			if(css)
				element.style.cssText = css;
			if(className)
				element.className = className;
			return element;
		},
		/**
	     * 自动转成jQuery对象
	     * @param obj   可以是函数、jquery选择器、jquery对象、dom对象、数组等
	     * @param aggregate 是否把数组对象合并成一个jquery对象。默认为true
                aggregate = true时 ["#id1", "#id2"] ==> $("#id1, #id2")
                aggregate = false时 ["#id1", "#id2"] ==> [$("#id1"), $("#id2")]
	     * };
	     */
        $obj: function (obj, aggregate) {
            if (obj == null) return obj;
            aggregate = aggregate == null ? true : aggregate;
            if (utils.isFunction(obj)) {
                obj = obj();
            }
            if (this.isArray(obj)) {
                var $objs = aggregate ? null : [];
                obj.forEach(function (item) {
                    var tmp = utils.$obj(item, aggregate);
                    if (aggregate) {
                        $objs = $objs == null ? tmp : tmp == null ? $objs : $objs.add(tmp);
                    } else {
                        $objs.push(tmp);
                    }
                });
                return $objs;
            } else {
                return obj.jquery ? obj: $(obj);
            }
        },
		//创建dom元素jquery对象
		$dom: function(domTag, id, className, css){
			return $(utils.dom(domTag, id, className, css));
		},
		//多个jq对象相加，自动处理为undefined、null的参数
		$add: function($raw, $add){
			$raw = $raw ? $raw.jquery ? $raw : $($raw) : $raw;
			$add = $add ? $add.jquery ? $add : $($add) : $add;
			if(!$raw)
				return $add;
			else if(!$add)
				return $raw;
			else
				return $raw.add($add);
		},
		//获取html字符窜的属性值,没有指定属性返回null
		htmlAttrVal: function(html, attrKey) {
			var patt = new RegExp(attrKey + "\\s*=\\s*(('([^']*)')|(\"([^\"]*)\")|(([^'\"\\s>]*)[\\s>]))"),
				res = patt.exec(html);
			return res === null ? res : 
				res[3] ? res[3] : res[5] ? res[5] : res[7] ? res[7] : "";
		},
		/**
		 * 获取指定Tag的自身tag标签代码,不包含子元素.dom可以是字符窜或dom元素
		 * excludeAttrs 需要排除的属性， 字符窜或数组
		 * addAttrs 添加的属性，当属性名是class、style时在原有属性上累加，不会替换之前的值，如果想替换需要在excludeAttrs中传入class、style。例子：{id: "1", "name": "name"}
		 */
		domShuck: function(dom, excludeAttrs, addAttrs) {
			dom = dom && dom.jquery ? dom.get(0) : dom;
			if(!dom) return ;
			if(utils.isObject(excludeAttrs)) {
				addAttrs = excludeAttrs;
				excludeAttrs = null;
			}else if(!utils.isArray(excludeAttrs)) {
				excludeAttrs = [excludeAttrs];
			}
			var html = utils.isString(dom) ? dom : dom.outerHTML,
				token = new StringToken(html),
				assemble = "",	//属性字符窜集合
				tag = "",
				curPropKey = "",
				curPropVal = "",
				propKeying = false,	//正在解析属性名
				propValing = false,	//正在解析属性值
				intactProp = false,		//判断属性是否是完整的键值对
				propValEndChar = null,
				start = false,
				tagEnd = false,
				c;
//			if(html) {
//				//提取html最外层的tag
//				var matchs = new RegExp("^\\s*(<\\s*(\\w+)[^>/]*(/\\s*)?>)([\\s\\S]*?(<\\s*/\\s*\\2\\s*>))?\\s*$", "i").exec(html);
//				if(matchs && (matchs[3] || matchs[4]) && (!matchs[3] || !matchs[4])) {
//					tag = matchs[1] + (matchs[5] ? matchs[5] : "");
//				}
//			}
//			//排除指定的属性
//			if(tag && excludeAttrs.length > 0) {
//				for(var i = 0; i < excludeAttrs.length; i++) {
//					if(excludeAttrs[i])
//						tag = tag.replace(new RegExp("\\s+" + excludeAttrs[i] + "\\s*=\\s*(('[^']*')|(\"[^\"]*\")|([^\\s'\">]*(?=\\s+\\w+=|\\s*/\\s*>)))"), " ");
//				}
//			}
			function operateProp() {
				var exclude = false;
				for(var i = 0; i < excludeAttrs.length; i++) {
					if(excludeAttrs[i] === curPropKey) {
						exclude = true;
						break;
					}
				}
				if(!exclude) {
					if(intactProp) {
						if(addAttrs) {
							if(curPropKey === "class" && addAttrs["class"]) {
								curPropVal += " " + addAttrs["class"];
								delete addAttrs["class"];
							}else if(curPropKey === "style" && addAttrs.style) {
								curPropVal += (curPropVal.length > 0 ? ";" : "") + addAttrs.style;
								delete addAttrs.style;
							}
						}
						propValEndChar = propValEndChar ? propValEndChar : '"';
						assemble += curPropKey + "=" + propValEndChar + curPropVal + propValEndChar + " ";
					}else {
						assemble += curPropKey + " ";
					}
				}
				intactProp = false;
				propValing = false;
				curPropVal = "";
				propValEndChar = null;
			}
			
			LOOP:
			while((c = token.next()) != StringToken.NULL) {
				switch(c) {
				
				case '<':
					if(propValing) {
						curPropVal = curPropVal.concat(c);
					}else {
						start = true;
					}
					break;
				case '\\':
					if(propValing) {
						curPropVal = curPropVal.concat(c).concat(token.next());
					}
					break;
				case ' ':
					if(start && tag !== "") {
						if(!tagEnd) {
							tagEnd = true;
							break;
						}else if(propKeying) {
							propKeying = false;
							break;
						}
					}else {
						break;
					}
				case '>':
					//修改tagEnd标记，继续执行default代码
					tagEnd = !tagEnd && tag ? true : tagEnd;
				default:
					if(start) {
						if(tagEnd) {
							if((!propValing || propValEndChar === ' ') && (c === "/" || c === ">")) {
								if(curPropKey) {
									operateProp();
									propKeying = false;
									curPropKey = "";
								}
								break LOOP;
							}else if(!propKeying && curPropKey === "") {
								if(c !== "=") {
									propKeying = true;
									curPropKey = curPropKey.concat(c);
								}
							}else if(propKeying) {
								if(c === "=") {
									intactProp = true;
									propKeying = false;
								}else {
									curPropKey = curPropKey.concat(c);
								}
							}else if(!propKeying && curPropKey !== "") {
								if(!intactProp) {
									if(c === "=") {
										intactProp = true;
									}else {
										operateProp();
										propKeying = true;
										curPropKey = c;
									}
								}else {
									if(!propValing && curPropVal === "") {
										propValing = true;
										if(c === '\'' || c === '"') {
											propValEndChar = c;
										}else {
											propValEndChar = ' ';
											curPropVal = curPropVal.concat(c);
										}
									}else if(propValing) {
										if(c === propValEndChar) {
											operateProp();
											propKeying = false;
											curPropKey = "";
										}else {
											curPropVal = curPropVal.concat(c);
										}
									}
								}
							}
						}else {
							tag = tag.concat(c);
						}
					}
					break;
				}
			}
			if(tag) {
				if(addAttrs) {
					for(var key in addAttrs) {
						if(addAttrs[key] === null || addAttrs[key] === undefined) {
							assemble += key + " ";
						}else {
							assemble += key + '="' + addAttrs[key] + '" ';
						}
					}
				}
				assemble = "<" + tag + " " + assemble + " ></" + tag + ">";
			}
			return assemble;
		},
		//返回指定iframe dom对象的document对象
		iframeDoc: function(iframe) {
			return iframe.contentDocument || iframe.contentWindow.document;
		},
		//验证指定对象是否绑定了指定类型的事件
		bindedEvent : function($obj, eventType, namespace) {
			//$._data是为了兼容JQuery1.8及以后的版本
		    var evts = $obj ? $obj.data("events") || $._data($obj[0], "events") : null,
				binded = false;
			if(evts && evts[eventType]) {
				if(namespace) {
					for(var i = 0; i < evts[eventType].length; i++) {
						if(evts[eventType][i].namespace === namespace) {
							binded = true;
							break;
						}
					}
				}else
					binded = true;
			}
			return binded;
		},
		//防止过度频繁操作某个函数
		debounce: function(callback, delay) {
			if (!utils.isFunction(callback)) {
		        return;
		    }
		    delay = delay || 100;
		    var timeout;
		    return (function(){
		    	if(timeout)
		    		clearTimeout(timeout);
		    	var _this = this;
		        timeout = setTimeout(function(){
		            callback.apply(_this, arguments);
		        }, delay);
		    });
		},
		lazyload: function () {
            if (!utils.bindedEvent($win, "scroll", "lazy")) {
                $win.bind("scroll.lazy", function () {
                    var elements = $("[lazy][lazy!='loaded']"),
                        scrollTop = $win.scrollTop();
                    elements.each(function () {
                        if (($win.height() + scrollTop) >= $(this).offset().top) {
                            var element = $(this);
                            if (element.is("img,iframe")) {
                                element.attr("src", element.attr("lazy"));
                            } else {
                                element.UI_loading();
                                (new Function(element.attr("lazy"))).call(element[0]);
                            }
                            element.attr("lazy", "loaded");
                        }
                    });
                });
            }
            setTimeout(function () { $win.scroll(); }, 0);
        },
		/**
		 * @param ele （必填参数）当window scroll时，指定的HTML标签也跟着scroll，ele可以是dom对象或jquery对象，
		 * @param stops（可选参数）停止的相对位置（即当指定的元素到达stops对象时position改为static状态）
		 * 				stops可以是dom元素、精确值(800px、800)、函数（函数返回精准值），精确值表示滑动对象的最底部到达页面上边缘的距离
		 * @param pos（可选参数） 精密调度位置例:{left: "900px", top: "10px"}
		 * 				即滑动对象滑动时的位置
		 */
		scroll: function (ele, stops, pos) {
            if (!ele) return false;
            ele = ele.jquery ? ele : $(ele);
            if (stops && (stops.left || stops.top)) {
                pos = stops;
                stops = null;
            }
            pos = pos || {};
            pos.top = pos.top ? utils.removeUnit(pos.top) : 0;
            ele.each(function () {
                var $this = $(this);
                $this.data("info", { top: $this.offset().top, height: $this.outerHeight() });
            });
            $win.bind("scroll.follow", function () {
                var scrollTop = $win.scrollTop(),
					stopHeight;
                if (stops) {
                    if (utils.isNumber(stops)
						|| utils.isString(stops)) {
                        stopHeight = utils.removeUnit(stops);
                    } else if (utils.isFunction(stops)) {
                        stopHeight = stops();
                    } else if ($(stops).length > 0)
                        stopHeight = $(stops).offset().top;
                }
                ele.each(function () {
                    var $this = $(this),
						info = $this.data("info");
                    if (scrollTop + pos.top > info.top && (
							!stopHeight ||
							stopHeight > (scrollTop + pos.top + info.height)
						)) {
                        $this.css({
                            top: pos.top - utils.removeUnit($this.css("marginTop")),
                            left: pos.left ? pos.left : "",
                            position: "fixed",
                            zIndex: 100
                        });
                    } else if (stopHeight && stopHeight <= (scrollTop + pos.top + info.height)) {
                        $this.css({
                            top: stopHeight - scrollTop - info.height,
                            left: pos.left ? pos.left : "",
                            position: "fixed",
                            zIndex: 100
                        });
                    } else {
                        $this.css({
                            top: "",
                            left: "",
                            position: "static",
                            zIndex: ""
                        });
                    }
                });
            });
            $win.trigger("scroll.follow");
        },
        /**
         * 表单、A标签提交功能
         */
        submit: {
        	/**
        	 * 防重复提交
        	 * @param $doms form/a标签
        	 * @param submitIframe 页面是否提交到iframe对象中
        	 */
        	single: function($doms, submitIframe) {
        		var $objs = utils.$obj($doms);
        		if($objs.length > 0) {
        			$objs.filter(function() {
        				var $this = $(this),
							$form = $this.closest("form"),
							isa = $this.is("a") && new RegExp(regex.url).test($this.attr("href"));
        				if(isa || $form.length > 0) {
        					if(submitIframe) {
        						var targetFrame = isa ? $this[0].target : $form[0].target,
    								$frame = null;
        						if(!targetFrame) {
            						targetFrame = "submit-iframe";
            						if(isa) {
            							$this.attr("target", targetFrame);
            						}else {
            							$form.attr("target", targetFrame);
            						}
            					}
            					if(($frame = $("iframe[name=" + targetFrame + "]")).length == 0) {
            						$frame = $('<iframe id="{0}" name="{0}" src="about:blank" style="display: none;" ></iframe>'.format(targetFrame));
            						$("body").append($frame);
            					}
        					}
        					return true;
        				}
        				return false;
        			}).off(".repeatSubmit").on("click.repeatSubmit", function() {
        				var $this = $(this),
        					isa = $this.is("a") && new RegExp(regex.url).test($this.attr("href")),
        					$form = isa ? null : $this.closest("form");
    					if($this.data("isSubmiting")) {
    						//正在提交	
    						return false;
    					}
    					
    					function changeVal($btn, isSbmtBtn) {
    						var data = $btn.data();
    						if (data.isSubmiting) return false;
    						data.isSubmiting = true;
    						if (!data.hasOwnProperty("originalText")) {
    							//判断该html标签是否通过$btn.val()取值，还是通过$btn.text()取值
    							data.valProp = $btn[0].tagName == "INPUT" || $btn[0].tagName == "TEXTAREA" ? true : false;
    							//判断该html标签是否能设置disabled属性
    							data.disabledProp = data.valProp || $btn[0].tagName == "BUTTON" ? true : false;
    							//标签处于可提交状态下，显示的内容
    			                data.originalText = data.valProp ? $btn.val() : $btn.text();
    			                
    			                //通过属性data-disable-btns='#btn1'设值
    			                //data.disableBtns = ...
    			                
    			                //通过属性data-ing-class='class1 class2'设值
    			                data.ingClass = data.ingClass == null ? "submiting" : data.ingClass + " submiting";
    			                
    			                //$btn.attr("submiting")是为了兼容低版本，建议使用data-submiting="xxxx"格式
    			                var submiting = $btn.attr("submiting");
    							if(submiting) {
    								data.submiting = submiting;
    							}
    			               	if(!data.submiting) {
    			               		//占位符，{0}代表原始内容
    			               		data.submiting = "{0}...";
    			               	}
    		                }
    						$btn.addClass(data.ingClass);
    						if(isSbmtBtn && data.submiting) {
    							if(data.valProp)
    								$btn.val(data.submiting.format(data.originalText));
    							else
    								$btn.text(data.submiting.format(data.originalText));
    						}
    						if (data.disabledProp)
    							$btn.prop("disabled", true);
    					}
    					
    					changeVal($this, true);
    					var disableBtns = utils.$obj($this.data("disableBtns"));
    		            if (disableBtns) {
    		            	disableBtns.each(function() {
    		                    changeVal($(this), false);
    		                });
    		            }
    					
    					if(submitIframe) {
    						var targetFrame = isa ? $this[0].target : $form[0].target,
    							$frame = $("iframe[name=" + targetFrame + "]"),
    							idAttr = $this.attr("id");
    						if(!idAttr) {
    							$this.attr("id", idAttr = new Date().getTime());
    						}
    						$frame.data("srcTagId", idAttr);
    						$frame.one("load", function() {
    							utils.submit.unlock($this);
    						});
    					}
    					if(isa) {
    						var url = $this.attr("href");
    						//判断表单有无DIALOG_REQ参数，没有则加上。此参数规定了controller返回数据的格式
    						if(url.indexOf(BaseData.dialog_req) === -1) {
    							url = utils.addUrlParams(url, BaseData.dialog_req, true);
    							$this.attr("href", url);
    						}
    					}else {
    						var url = $form.attr("action");
    						//判断表单有无DIALOG_REQ参数，没有则加上。此参数规定了controller返回数据的格式
    						//注：不可以通过<input>标签形式增加此参数，因为当form为multipart/form-data时，在filter中是取不到此参数的，只能通过解析二进制流来解析此参数（不推荐自己解析二进制流）。所以不能用input标签
    						if(url.indexOf(BaseData.dialog_req) === -1) {
    							url = utils.addUrlParams(url, BaseData.dialog_req, true);
    							$form.attr("action", url);
    						}
    						$form.submit();
    					}
        			});
        		}
        	},
        	/**
        	 * 释放form、a的锁定状态
        	 */
        	unlock: function($doms) {
        		var $objs = utils.$obj($doms);
        		if($objs.length > 0) {
        			$objs.each(function() {
        				var $this = $(this);
        				function changeVal($btn, isSbmtBtn) {
        	                var data = $btn.data();
        	                if (!data.isSubmiting) return false;
        	                data.isSubmiting = false;
        	                $btn.removeClass(data.ingClass);
        	                if(isSbmtBtn && data.submiting) {
        						if(data.valProp)
        							$btn.val(data.originalText);
        						else
        							$btn.text(data.originalText);
        					}
        	                if (data.disabledProp)
        	                    $btn.prop("disabled", false);
        	            }
        	            changeVal($this, true);
        	            var disableBtns = utils.$obj($this.data("disableBtns"));
        	            if (disableBtns) {
        	            	disableBtns.each(function() {
        	                    changeVal($(this), false);
        	                });
        	            }
        			});
        		}
        	},
        	/**
        	 * 非ajax请求的回调函数
        	 * obj = {
        	 * 	action: "action", 
        	 * 	url: "url", 
        	 * 	msg: "msg", 
        	 * 	data: {}
        	 * }
        	 * callbackFun: 用户自定义的回调函数执行callbackFun(data)
        	 * 想调用callbackFun自定义函数，必须在form表单中添加
        	 * <input type="hidden" name="callbackFun" value="selfCallbackFun" />
        	 * 
        	 */
        	callback: function (iframeName, data, callbackFun) {
        		
        		function getForm(iframeName) {
        			var srcTagId = $("iframe[name=" + iframeName + "]").data("srcTagId"),
        				$form = $("#" + srcTagId);
        			return $form.is("a") && new RegExp(regex.url).test($form.attr("href")) ? $form : $form.closest("form");
        		}
        		
        		var $form = getForm(iframeName),
        			hasCallbackFun = utils.isString(callbackFun)
        				&& utils.isFunction(window[callbackFun]) ? true : false;
        		if(!data) {
        			if(hasCallbackFun) 
        				window[callbackFun](data);
        			return;
        		}
        		var sucMsg = $form.attr("suc"),
        			failMsg = $form.attr("fail"),
        			code = data.code == BaseData.suc ? "info" : "error",
        			msg = data.msg;
        		//初始化提示信息
        		if(!msg) {
        			if(data.code == BaseData.suc) {
        				msg = sucMsg;
        			}else if(data.code){
        				msg = failMsg;
        			}
        		}
        		
        		if(!msg && hasCallbackFun) 
        			window[callbackFun](data);
        		if(data.action == "forward") {
        			var url = data.url;
        			if(!data.url){
        				//跳转到相对应的list页面
        				//地址做urlrewrite时需要修改
        				url = location.origin + location.pathname;
        				url = url.replace(/\w+((\.\w+))?$/,"list$1");
        			}
        			if(msg) {
        				$.alert(code, msg, function(){
        					if(hasCallbackFun) 
        						window[callbackFun](data);
        					window.location.href = url;
        				});
        			}else
        				window.location.href = url;
        		}else if(data.action == "flush_cur") {
        			var url = utils.popCacheUrl() || window.location.href;
        			if(msg){
        				$.alert(code, msg, function(){
        					if(hasCallbackFun) 
        						window[callbackFun](data);
        					window.location.href = url;
        				});
        			}else{
        				window.location.href = url;
        			}
        		}else if(data.action == "flush_his"){
        			utils.popCacheUrl();
        			var url = utils.popCacheUrl() || BaseData.path;
        			if(msg){
        				$.alert(code, msg, function(){
        					if(hasCallbackFun) 
        						window[callbackFun](data);
        					window.location.href = url;
        				});
        			}else
        				window.location.href = url;
        		}else if(data.action == "param_error"
        					|| data.action == "none" ){
        			if(msg){
        				$.alert(code, msg, function(){
        					if(hasCallbackFun) 
        						window[callbackFun](data);
        				});
        			}
        		}else if(data.action == "close_dialog_quiet") {
        			if(msg) {
        				$.alert(code, msg, function(){
        					if(hasCallbackFun) 
        						window[callbackFun](data);
        					//关闭对话框
        					utils.submit.closeDialog();
        				});
        			}else
    					utils.submit.closeDialog();
        		}else if(data.action == "close_dialog") {
        			var url = utils.popCacheUrl() || BaseData.path;
        			if(msg) {
        				$.alert(code, msg, function() {
        					if(hasCallbackFun) 
        						window[callbackFun](data);
        					//关闭对话框
        					utils.submit.closeDialog();
        					window.location.href = url;
        				});
        			}else {
        				//关闭对话框
    					utils.submit.closeDialog();
        				window.location.href = url;
        			}
        		}
        	},
        	//需要各自项目自己实现
        	closeDialog: function() {
        		
        	}
        },
		//获取图片的宽度和高度,如果不能从url获取宽高，就只能动态加载图片，动态加载图片不能返回宽高，只能通过回调函数执行以后的操作
		imgWH: function(url, callback) {
			var match,_wh;
			if(!_wh){
				_wh = (match = new RegExp("_[rt]([0-9]+)c([0-9]+)f\\.[a-z]+$").exec(url)) ? {width: match[1], height: match[2]} : null;
			}
			if(!_wh){
				_wh = (match = new RegExp("_((d)|(td)|(rd)|(tb)|(rb))([0-9]+)c([0-9]+)\\.[a-z]+$").exec(url)) ? {width: match[7], height: match[8]} : null;
			}
			
			if(_wh){
				if(callback && utils.isFunction(callback))
					callback(_wh);
				return _wh;
			}else if(callback && utils.isFunction(callback)){
				//根据url规则获取不到宽高，且有回调函数时，会动态加载图片
				var img = new Image();
				img.src = url;
				img.onload = function(){
					callback({width: img.width, height: img.height});
				};
				return null;
			}
		},
		/**
		 * @param scale 指定是否等比缩放，默认是true。
		 * 	scale=true时w、h出现0或非数字时则依据另一方的值，如果都为0，则返回原尺寸
		 * 	scale=false 且w、h出现0或非数字时，则图片强制宽、高设置为0
		 * @param magnify 指定是否能够放大图片，默认是可以的true
		 */
		zoomImg: function(imgW, imgH, w , h, scale, magnify){
			var zoomW, zoomH,
				magnify = magnify === false ? false : true,
				scale = scale === false ? false : true,
				imgW = utils.parseFloat(imgW),
				imgH = utils.parseFloat(imgH),
				w = utils.parseFloat(w),
				h = utils.parseFloat(h);
			if(scale){
				if(!w && !h) {
					zoomW = imgW;
					zoomH = imgH;
				}else if(!w) {
					var scaleH = imgH/h;
					zoomH = h;
					zoomW = imgW/scaleH;
				}else if(!h) {
					var scaleW = imgW/w;
					zoomW = w;
					zoomH = imgH/scaleW;
				}else if(imgW <= w && imgH <= h && !magnify) {
					zoomW = imgW;
					zoomH = imgH;
				}else {
					var scaleW = imgW/w,
						scaleH = imgH/h;
					if(scaleW > scaleH){
						zoomW = w;
						zoomH = imgH/scaleW;
					}else{
						zoomH = h;
						zoomW = imgW/scaleH;
					}
				}
			}else{
				zoomH = h;
				zoomW = w;
			}
			return {width: zoomW, height: zoomH};
		}
	};
	/**
	 * 正则表达式
	 */
	window.regex = {
		alpha:"^[A-Za-z]+$",			//字母
		alphanum:"^[A-Za-z0-9]+$",		//字母、数字
		alpha_u:"^[A-Z]+$",			//大写字母
		alpha_l:"^[a-z]+$",			//小写字母
		word:"^\\w+$",					//用来用户注册。匹配由数字、26个英文字母或者下划线组成的字符串
		
		num: "^\\d+$",						//只包含数字，不包含正负号
	
		integer:"^[\\+-]?\\d+$",			//整数（包括负数、0、正数）
		int_plus:"^\\+?[0-9]*[1-9][0-9]*$",	//正整数
		int_minus:"^-[0-9]*[1-9][0-9]*$",	//负整数
		int_no_minus:"^\\+?\\d+$",			//非负整数（正整数 + 0）
		int_no_plus:"^((-\\d+)|(0))$",		//非正整数（负整数 + 0）
		
		decemal:"^([\\+-]?)\\d*\\.?\\d+$",	//浮点数 或 整数(包含正负数)
		decemal_plus:"^\\+?((\\d*[1-9]\\d*\\.?\\d*)|(0+\\.\\d*[1-9]\\d*))$",//正小数、正整数
		decemal_minus:"^-((\\d*[1-9]\\d*\\.?\\d*)|(0+\\.\\d*[1-9]\\d*))$",//负小数、负整数
		decemal_no_plus:"^-\\d*\\.?\\d+$",	//非正小数、非正整数
		decemal_no_minus:"^\\+?\\d*\\.?\\d+$",//非负小数、非负整数
		
		decemal_only:"^([\\+-]?)\\d*\\.\\d+$",	//只能是浮点数不能为整数(包含正负数)
		decemal_plus_only:"^\\+?((\\d*[1-9]\\d*\\.\\d*)|(0+\\.\\d*[1-9]\\d*))$",//正小数
		decemal_minus_only:"^-((\\d*[1-9]\\d*\\.\\d*)|(0+\\.\\d*[1-9]\\d*))$",//负小数
		decemal_no_plus_only:"^-\\d*\\.\\d+$",	//非正小数
		decemal_no_minus_only:"^\\+?\\d*\\.\\d+$",//非负小数
		
		chinese:"^[\\u4E00-\\u9FA5\\uF900-\\uFA2D]+$",	//仅中文
		word_zh: "^[\\u4E00-\\u9FA5\\uF900-\\uFA2D\\w\\s\\(\\)\\（\\）]+$",	//中文、英文、下划线、数字、左右小括号
		mobile:"^(13[0-9]{9}|15[0-9]{9}|18[0-9]{9}|147[0-9]{8})$",				//手机
		idcard:"(^\\d{15}$)|(^\\d{17}(\\d|X)$)",	//身份证
		tel:"^(([0\\+]\\d{2,3}-)?(0\\d{2,3})-)?(\\d{7,8})(-(\\d{3,}))?$",	//电话号码的函数(包括验证国内区号,国际区号,分机号)
		email:"^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$", //邮件
		color:"^[a-fA-F0-9]{6}$",				//颜色
		url:"^((https?|ftp):\\/\\/)?(\\/?[-A-Za-z0-9.:]+)(\\/[-A-Za-z0-9+&@#\\/%=~_|!:,.;]*)?(\\?[A-Za-z0-9+&@#\\/%=~_|!:,.;]*)?$",	//url
		ascii:"^[\\x00-\\xFF]+$",				//仅ACSII字符
		zipcode:"^\\d{6}$",						//邮编
		ip4:"^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",	//ip地址
		empty: "^\\s*$",						//空白
		not_empty:"^\\S+$",						//非空
		picture:"(.*)\\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$",	//图片
		rar:"(.*)\\.(rar|zip|7zip|tgz)$",								//压缩文件
		date:"^\\d{4}(\\-|\\/|\.)\\d{1,2}\\1\\d{1,2}$",					//日期
		qq:"^[1-9]*[1-9][0-9]*$",				//QQ号码
		usernameEmal:"^[\\w\\.@]+$",			
		bankCard:"^(\\d+)$",	//银行卡
		busInfo:"^[\\u2E80-\\u9FFF\\w]+([,，][\\u2E80-\\u9FFF\\w]+)*?$"
	};
	
	//为了重写jquery方法
	var $origin = {
		outerWidth: $.fn.outerWidth,
		outerHeight: $.fn.outerHeight
	};
	$.extend({
		/**
		 * code = warn/info/error
		 */
		alert: function(code, msg, fn){
			var parent = null;
			for(var key in $.dialog.list) {
				var dialog = $.dialog.list[key];
				if(dialog.config.lock) {
					parent = dialog;
					break;
				}
			}
			$.dialog.alert(code, msg, fn, parent);
		},
		confirm: function(content, yes, no){
			var parent = null;
			for(var key in $.dialog.list) {
				var dialog = $.dialog.list[key];
				if(dialog.config.lock) {
					parent = dialog;
					break;
				}
			}
			$.dialog.confirm(content, yes, no, parent);
		}
	});
	
	$.fn.extend({
		/**
		 * 如果操作的对象很多（超过1000个），
		 * 最好的做法是想办法直接调用$obj.width(200)，避免再获取原始值;
		 */
		innerWidth: function(val) {
			if (val == undefined) {
				var elem = this[0];
				return elem ? elem.style ?
					utils.parseFloat( jQuery.css( elem, "width", "padding" ) ) :
					this.width() :
					null;
			}
			return this.each(function() {
				var $this = $(this);
				$this.width(val - ( utils.parseFloat($this.css("paddingLeft")) + utils.parseFloat($this.css("paddingRight")) ));
			});
		},
		/**
		 * 如果操作的对象很多（超过1000个），最好不用此方法。
		 * 最好的做法是想办法直接调用$obj.height(200)，避免再获取原始值;
		 */
		innerHeight: function(val) {
			if (val == undefined) {
				var elem = this[0];
				return elem ? elem.style ?
					utils.parseFloat( jQuery.css( elem, "height", "padding" ) ) :
					this.height() :
					null;
			}
			return this.each(function() {
				var $this = $(this);
				$this.height(val - ( utils.parseFloat($this.css("paddingTop")) + utils.parseFloat($this.css("paddingBottom")) ));
			});
		},
		/**
		 * val 不传值为取值，否则设值
		 * 如果操作的对象很多（超过1000个），最好不用此方法。因为遍历对象先获取对象的原始宽度再设置新的宽度，获取对象原始宽度很耗性能。
		 * 最好的做法是想办法直接调用$obj.width(200)，避免再获取原始值;
		 * @param margin 计算宽度是否包含margin
		 * @param val
		 * @returns
		 */
		outerWidth: function(margin, val) {
			if(margin && !utils.isBoolean(margin)) {
				val = margin;
				margin = false;
			}
			if (val == undefined) {
				if (this[0] == window) {
					return this.width() || document.body.clientWidth;
				}
				//为了兼容高版本的Jquery，所以用以下方式
				return margin == undefined ? $origin.outerWidth.call(this) : $origin.outerWidth.call(this, margin);
			}
			return this.each(function() {
				$(this).width(val - ($origin.outerWidth.call($(this), margin) - $(this).width()));
			});
		},
		/**
		 * 如果操作的对象很多（超过1000个），最好不用此方法。因为遍历对象先获取对象的原始宽度再设置新的宽度，获取对象原始宽度很耗性能。
		 * 最好的做法是想办法直接调用$obj.height(200)，避免再获取原始值;
		 */
		outerHeight: function(margin, val) {
			if(margin && !utils.isBoolean(margin)) {
				val = margin;
				margin = false;
			}
			if (val == undefined) {
				if (this[0] == window) {
					return this.height() || document.body.clientHeight;
				}
				//为了兼容高版本的Jquery，所以用以下方式
				return margin == undefined ? $origin.outerHeight.call(this) : $origin.outerHeight.call(this, margin);
			}
			return this.each(function() {
				$(this).height(val - ($origin.outerHeight.call($(this), margin) - $(this).height()));
			});
		},
		serializeJSON: function(){
		    var arr = this.serializeArray(),
                jsonObj = {};
		    $.each(arr, function () {
		        var val = jsonObj[this.name];
		        if (!utils.isUndefined(val)) {
		            if (!utils.isArray(val)) {
		                jsonObj[this.name] = [val];
		            }
		            jsonObj[this.name].push(this.value);
		        } else {
		            jsonObj[this.name] = this.value;
		        }
		    });
		    return jsonObj;
		},
		textCount: function(settings){
			//当textArea输入框文字字数变化时，自动显示字数
			settings = $.extend({}, textCountSettings, settings);
			/*
			 * 注意：Firefox（测试版本41.0.2）一次完整的中文输入会触发两次compositionstart、compositionend、input，其他“标准”浏览器测试正常。
			 * 如有特殊需求，不希望触发两次，请参照如下IE9以下的方案，增加一个计数器。
			 **/
			this.off(".textCount").on("input.textCount propertychange.textCount", function (e) {
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
				//设置textCount值
				if(settings.func) 
					settings.func.call($this);
				else{
					var len = $this.val().replace(/\r\n|\n|\r|(\s+)/g, '').length;
					if(len > settings.totalCount) {
						var str = $this.val().match(new RegExp("^([(\r\n)\n\r(\\s+)]*([^(\r\n)\n\r(\\s+)][(\r\n)\n\r(\\s+)]*){" + settings.totalCount + "})", "g"));
						$this.val(str);
						$("#" + settings.countId).text(settings.totalCount);
					}else
						$("#" + settings.countId).text(len);
				}
			});
			if(!utils.browser.ie) {
				//非IE浏览器不需要绑定此事件。因为IE下中文输入法，当词组没有确定之前是不会把英文字母输入到input框中，且不会触发oninput事件
				this.on("compositionstart.textCount", function(){
					$(this).data("isIME", true);
				}).on("compositionend.textCount", function(){
					$(this).data("isIME", false);
				});
			}
			return this;
		},
		//显示加载提示信息
        UI_loading: function (options) {
            var tmpl = '<div class="ui-loading"><i></i><span class="ui-loading-in">正在加载中，请稍候</span></div>';
            return this.each(function () {
            	var $this = $(this);
            	if(!$this.children(".ui-loading").length) {
            		var opts = $.extend({
                        cssClass: null, //模式：ui-loading-sm（小）、ui-loading-vertical（垂直）
                        cssStyle: null  //提示DIV的样式
	                    }, options, utils.parse($this.data("options"), true)),
	                    $tmpl = $(tmpl);
	                if (opts.cssClass)
	                    $tmpl.addClass(opts.cssClass);
	                if (opts.cssStyle)
	                    $tmpl.css(opts.cssStyle);
	                $this.prepend($tmpl);
            	}
            });
        },
        //隐藏加载提示信息
        UI_loading_hide: function () {
            return this.find(".ui-loading").hide();
        },
        //显示加载提示信息
        UI_loading_show: function () {
            return this.find(".ui-loading").show();
        },
        UI_loading_destroy: function () {
            return this.find(".ui-loading").remove();
        }
	});
	var textCountSettings = {
		countId: "icer_text_count_id",
		totalCount: 500
	};
	
	/**
	 * 防止ajax重复提交
	 * $.ajax({
            submitBtn: "#btn",  //【必须】触发请求的按钮，可以是函数、jquery选择器、jquery对象、dom对象
            disableBtns: "#btn1", //【可选】当submitBtn正在请求时，一起失效的按钮。可以是函数、jquery选择器、jquery对象、dom对象、数组
            ingClass:  "class1 class2",	//【可选】按钮正在提交时显示的class，默认会自动加上submiting
            submiting: "保存..." //【可选】正在请求中的提示信息，默认为{0}...
        });
	 */
	$(document).off(".repeatSubmit").on({
        "ajaxSend.repeatSubmit": function (event, jqXHR, opts) {
            if (opts.submitBtn = utils.$obj(opts.submitBtn)) {
                opts.submiting = opts.submiting != null ? opts.submiting : "{0}...";
                opts.ingClass = opts.ingClass == null ? "submiting" : opts.ingClass + " submiting";

                if (opts.submitBtn.data("submiting")) {
                	opts.submitBtn.data("submiting", opts.submitBtn.data("submiting") + 1);
                    jqXHR.abort();
                    return false;
                }
                function changeVal($btn, isSbmtBtn) {
                    var data = $btn.data();
                    if (data.submiting) {
                    	data.submiting++;
                    	return false;
                    }
                    data.submiting = 1;
                    if (!data.hasOwnProperty("originalText")) {
                        data.valProp = $btn[0].tagName == "INPUT" || $btn[0].tagName == "TEXTAREA" ? true : false;
                        data.disabledProp = data.valProp || $btn[0].tagName == "BUTTON" ? true : false;
                        data.originalText = data.valProp ? $btn.val() : $btn.text();
                    }
                    $btn.addClass(opts.ingClass);
                    if (isSbmtBtn) {
                        if (data.valProp) {
                            $btn.val(opts.submiting.format(data.originalText));
                        } else {
                            $btn.text(opts.submiting.format(data.originalText));
                        }
                    }
                    if (data.disabledProp)
                        $btn.prop("disabled", true);
                }
                changeVal(opts.submitBtn, true);
                if (opts.disableBtns = utils.$obj(opts.disableBtns)) {
                    opts.disableBtns.each(function () {
                        changeVal($(this), false);
                    });
                }
            }
        },
        "ajaxComplete.repeatSubmit": function (event, jqXHR, opts) {
            if (opts.submitBtn && opts.submitBtn.data("submiting")) {
            	var submitBtnData = opts.submitBtn.data();
            	if(--submitBtnData.submiting) return;
                function changeVal($btn, isSbmtBtn) {
                    var data = $btn.data();
                    if(!isSbmtBtn && !data.submiting) {
                    	return false;
                    }
                    data.submiting = 0;
                    $btn.removeClass(opts.ingClass);
                    if (isSbmtBtn) {
                        if (data.valProp) {
                            $btn.val(data.originalText);
                        } else {
                            $btn.text(data.originalText);
                        }
                    }
                    if (data.disabledProp)
                        $btn.prop("disabled", false);
                }
                changeVal(opts.submitBtn, true);
                if (opts.disableBtns) {
                    opts.disableBtns.each(function () {
                        changeVal($(this), false);
                    });
                }
            }
        }
    });
    $.ajaxSetup({
    	traditional: true, //Jquery ajax请求时，用传统方式组装参数。设置此值后，参数不能传嵌套数组
		login: function(data, textStatus, jqXHR) {
			//Ajax请求失败后显示登录页面
			top.window.location.reload(true);
		},
    	error: function(XMLHttpRequest, textStatus, errorThrown){
			var dataType = this.dataTypes ? this.dataTypes[1] ? this.dataTypes[1] : this.dataTypes[0] : null;
			if(dataType == "html" && utils.isString(XMLHttpRequest.responseText)) {
				this.success(XMLHttpRequest.responseText, textStatus, XMLHttpRequest);
			}else {
				//$.alert("error", "系统错误!");
				if (window.console) {
					console.error(this.url, "请求异常");
					console.info(errorThrown);
				}
			}
		}
    });
	/**
	 * 扩展ajax函数,用于处理返回code信息
	 * settings = {
	 * 		tips 	: false,	//tips = false：就算code为非空值也不显示提示信息，默认显示提示信息
	 * 		sucTips : false,	//当返回的code为suc时，不会显示提示信息，默认显示提示信息
	 * 		exeSuc	: false,	//操作成功后也不会执行suc函数，默认执行
	 * 		exeFail	: false,	//操作失败后也不会执行fail函数，默认执行
	 *		sucMsg	: "操做成功",
	 *		failMsg	: "操作有误",
	 *		suc		: function(data){}, //返回code为BaseData.suc或空时执行的函数
	 *		fail	: function(data){}, //返回code有值且不为BaseData.suc时执行的函数
	 *		success	: function(data){}	//不管成功或者失败都会执行
	 * };
	 */
    $.ajaxPrefilter(function(opts, originalOptions, jqXHR ) {
    	var ajaxSuccess = opts.success;
    	opts.success = function(data, textStatus, jqXHR) {
    		var thisObj = this,
    			convertData = data,	//转换类型后的data。顾及到客户端传参dataType=html时，服务端因为异常返回JSON格式的错误提示信息，此时需要转换data为JSON类型，并弹出框提示
    			dataType = this.dataTypes ? this.dataTypes[1] ? this.dataTypes[1] : this.dataTypes[0] : null;
			if(dataType) {
				//if(dataType === "script") {
				//	//如果是返回类型是script，则直接跳出。因为jquery已经初始化过返回的脚本数据
				//	return;
				//}
				if(dataType === "json" && utils.isString(data)) {
					try{
						data = JSON.parse(data);
					}catch(err) {
						
					}
				}
			}
    		
			/**
			 *ajax请求返回数据的处理,例如异常处理
			 *data为ajax返回的数据，
			 *return true ==> 操作成功 return false ==> 操作失败
			 *	code = BaseData.suc或者为空 都会执行suc、ajaxSuccess函数，
			 *	当code不等于空且不等于BaseData.suc则执行fail、ajaxSuccess函数
			 **/
			if(utils.isString(data) &&  
					this.contents.json.test(opts.mimeType || jqXHR.getResponseHeader("content-type"))) {
				try{
					convertData = JSON.parse(data);
				}catch(err) {
					
				}
			}
			if(convertData instanceof Object && convertData[BaseData.code] != null) {
				var code = convertData[BaseData.code],
					msg = convertData[BaseData.msg];
				if(code == BaseData.suc) {
					var sucFunc = function() {
						if(opts.exeSuc !== false && typeof opts.suc == "function")
							opts.suc.call(thisObj, data, textStatus, jqXHR);
						if(typeof ajaxSuccess == "function")
							ajaxSuccess.call(thisObj, data, textStatus, jqXHR);
					};
					if (opts.tips === false || opts.sucTips === false) {
						sucFunc();
					} else {
						msg = msg ? msg : this.sucMsg ? this.sucMsg : "操作成功！";
						$.alert("info", msg, sucFunc);
					} 
					return true;
				}else if(code == BaseData.noLogin) {
					//需要登录
					this.login.call(this, data, textStatus, jqXHR);
					return false;
				}else {
					var failFunc = function() {
						if(opts.exeFail !== false && typeof opts.fail == "function")
							opts.fail.call(thisObj, data, textStatus, jqXHR);
						if(typeof ajaxSuccess == "function")
							ajaxSuccess.call(thisObj, data, textStatus, jqXHR);
					};
					if (opts.tips === false) {
						failFunc();
					} else {
						msg = msg ? msg : this.failMsg ? this.failMsg : "操作失败！";
						$.alert("error", msg, failFunc);
					} 
					return false;
				}
			}
			if(opts.exeSuc !== false && typeof this.suc == "function")
				this.suc.call(this, data, textStatus, jqXHR);
			if(typeof ajaxSuccess == "function")
				ajaxSuccess.call(this, data, textStatus, jqXHR);
			return true;
    	};
	});
	
	/**
	 * 跳转到新页面
	 */
	window.openWin = function openWin(_url){
		window.location.href = _url;
	};
	
	/**
	 * StringToken 用来遍历字符窜使用
	 */
	window.StringToken = window.StringToken || function(val) {
		window.StringToken.NULL = '\000';
		this.index = -1;
		this.source = val;
		this.more = function() {
			return this.source && this.index < this.source.length - 1;
		};
		this.next = function() {
			if(this.more()) {
				return this.source.charAt(++this.index);
			}
			return StringToken.NULL;
		};
		this.back = function() {
			if(this.index > 0) 
				this.index--;
		};
		this.setIndex = function(index) {
			this.index = index;
		};
		this.setSource = function(source) {
			this.source = source;
		}
	};
	
	/**************************  操作String   *******************************************/
	String.prototype.toText = function() {
		return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g,
				'&gt;').replace(/\'/g, '&#039;').replace(/\"/g, '&quot;');
	};
	/**
	 * 格式化字符窜占位符 aaa{0}bbb{1}c{name}cc ==> aaa-bbb+ccc，参数为null则转为空字符窜
	 */
	String.prototype.format = function () {
		//默认自动填充非key的字符窜
        var isAssemble = true,
        	nest = false,
        	start = nestStart = -1,
        	assemble = "", key,
			token = new StringToken(this),
			open = '{',
			close = '}';
        function initStatus() {
			start = nestStart = -1;
			nest = false;
		}
        function nextKey() {
        	initStatus();
            var c, hasOpen = false, hasClose = false, key = null, nestKey = null;
            KEY:
            while ((c = token.next()) != StringToken.NULL) {
                switch (c) {
                    case '\\':
                    	if(hasOpen) {
    						var n = token.next();
    						key = key.concat(c).concat(n);
    						if(nest) {
    							nestKey = nestKey.concat(c).concat(n);
    						}
    					}else {
    						if(isAssemble)
    							assemble = assemble.concat(c).concat(token.next());
    					}
                        break;
                    case open:
                    	if(hasOpen) {
    						nest = true;
    						nestKey = "";
    						nestStart = token.index - open.length;
    					}else {
    						hasOpen = true;
    						key = "";
    						start = token.index - open.length;
    					}
                        break;
                    case close:
                    	if(hasOpen) {
    						hasClose = true;
    						break KEY;
    					}else {
    						if(isAssemble)
    							assemble = assemble.concat(c);
    					}
                        break;
                    default:
                    	if(hasOpen) {
                    		key = key.concat(c);
    						if(nest) {
    							nestKey = nestKey.concat(c);
    						}
    					}else {
    						if(isAssemble)
    							assemble = assemble.concat(c);
    					}
                        break;
                }
            }
            //判断只有open没有close的情况
			if(hasOpen && !hasClose) {
				if(isAssemble)
					assemble = assemble.concat(open).concat(key);
				key = null;
				start = -1;
				if(nest) {
					nestKey = null;
					nestStart = -1;
				}
			}
			return nestKey == null ? key == null ? null : key : nestKey;
        }
        /**
		 * 把key对应的value回插进去
		 */
        function insertBack(val) {
			if(nest) {
				token.setSource(token.source.substring(0, nestStart + 1) + val + token.source.substring(token.index + 1));
				token.setIndex(start);
			} else if(isAssemble) {
				assemble = assemble.concat(val);
			}
		}
        while ((key = nextKey()) != null) {
            var val = null, hasKey = false;
            if (utils.regex(key, regex.num)) {
                var intKey = parseInt(key);
                if (arguments.length > intKey) {
                    hasKey = true;
                    val = arguments[intKey];
                }
            } else {
                for (var i = 0; i < arguments.length; i++) {
                    var arg = arguments[i];
                    if (utils.isObject(arg)) {
                        if (key in arg) {
                            hasKey = true;
                            val = arg[key];
                            break;
                        }
                    }
                }
            }
        	insertBack(hasKey ? val == null ? "" : val : "{" + key + "}");
        }
        return assemble;
    };
    //截取一定字符的字符串
	String.prototype.textCut = function(remainNum,replaceSymble,escape){
		var str = this.toString(),
			output = new Array();
		if(!str || !typeof remainNum == "number")
			return false;
		if(str.length >0 ){
			var n = 0;
			var pattern = /^[\u4E00-\u9FA5]+$/;
			for(var i = 0; i < str.length; i ++) {
				var strTemp = str.substring(i,i + 1);
				if(pattern.test(strTemp)) {
					n += 2;
				}else {
					n ++;
				}
				if(n > remainNum) {
					if(utils.isString(replaceSymble)) {
						output.push(replaceSymble);
					}
					break;
				}
				output.push(strTemp);
			}
		}
		if(escape) {
			return escape(output.join(""));
		}
		return output.join("");
	};
	if(!String.prototype.trim) {
		String.prototype.trim = function(){
			var str = this.toString();
			return str.replace(/^\s+/,"").replace(/\s+$/,"");
		};
	}
	if(!String.prototype.repeat) {
		String.prototype.repeat = function(num) {
			if(!utils.isNumber(num))
				num = utils.parseInt(num);
	    	return new Array(++num).join(this);
	    };
	}
	if(!String.prototype.contains) {
		String.prototype.contains = function(str) {
	    	return this.indexOf(str) != -1;
	    };
	}
	if (!String.prototype.startsWith) {
		(function() {
			'use strict';
			var defineProperty = (function() {
				// IE 8 only supports `Object.defineProperty` on DOM elements
				try {
					var object = {};
					var $defineProperty = Object.defineProperty;
					var result = $defineProperty(object, object, object)
							&& $defineProperty;
				} catch (error) {
				}
				return result;
			}());
			var toString = {}.toString;
			var startsWith = function(search) {
				if (this == null) {
					throw TypeError();
				}
				var string = String(this);
				if (search && toString.call(search) == '[object RegExp]') {
					throw TypeError();
				}
				var stringLength = string.length;
				var searchString = String(search);
				var searchLength = searchString.length;
				var position = arguments.length > 1 ? arguments[1] : undefined;
				// `ToInteger`
				var pos = position ? Number(position) : 0;
				if (pos != pos) { // better `isNaN`
					pos = 0;
				}
				var start = Math.min(Math.max(pos, 0), stringLength);
				// Avoid the `indexOf` call if no match is possible
				if (searchLength + start > stringLength) {
					return false;
				}
				var index = -1;
				while (++index < searchLength) {
					if (string.charCodeAt(start + index) != searchString
							.charCodeAt(index)) {
						return false;
					}
				}
				return true;
			};
			if (defineProperty) {
				defineProperty(String.prototype, 'startsWith', {
					'value' : startsWith,
					'configurable' : true,
					'writable' : true
				});
			} else {
				String.prototype.startsWith = startsWith;
			}
		}());
	}
	
	/**************************  操作Array   *******************************************/
    Array.prototype.remove = function (ele) {
        var num = 0;
        for (var i = 0, n = 0; i < this.length; i++) {
            if (this[i] !== ele) {
                this[n++] = this[i];
            } else {
                num++;
            }
        }
        this.length -= num;
        return num > 0;
    };
    Array.prototype.removeByIndex = function (index) {
        if (isNaN(index) || index >= this.length) {
            return false;
        }
        for (var i = 0, n = 0; i < this.length; i++) {
            if (i != index) {
                this[n++] = this[i];
            }
        }
        this.length -= 1;
        return true;
    };
    if (!Array.isArray) {
        Array.isArray = function (vArg) {
            return Object.prototype.toString.call(vArg) === "[object Array]";
        };
    }
    if (!Array.prototype.every) {
        Array.prototype.every = function (fun /*, thisArg */) {
            'use strict';
            if (this === void 0 || this === null)
                throw new TypeError();

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== 'function')
                throw new TypeError();

            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t && !fun.call(thisArg, t[i], i, t))
                    return false;
            }

            return true;
        };
    }
    if (!Array.prototype.filter) {
        Array.prototype.filter = function (fun /*, thisArg */) {
            "use strict";
            if (this === void 0 || this === null)
                throw new TypeError();

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== "function")
                throw new TypeError();

            var res = [];
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i];
                    // NOTE: Technically this should Object.defineProperty at
                    //       the next index, as push can be affected by
                    //       properties on Object.prototype and Array.prototype.
                    //       But that method's new, and collisions should be
                    //       rare, so use the more-compatible alternative.
                    if (fun.call(thisArg, val, i, t))
                        res.push(val);
                }
            }
            return res;
        };
    }
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function forEach(callback, thisArg) {
            var T, k;
            if (this == null) {
                throw new TypeError("this is null or not defined");
            }
            // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
            var O = Object(this);
            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0; // Hack to convert O.length to a UInt32
            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if ({}.toString.call(callback) !== "[object Function]") {
                throw new TypeError(callback + " is not a function");
            }
            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (thisArg) {
                T = thisArg;
            }
            // 6. Let k be 0
            k = 0;
            // 7. Repeat, while k < len
            while (k < len) {
                var kValue;
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (Object.prototype.hasOwnProperty.call(O, k)) {
                    // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                    kValue = O[k];
                    // ii. Call the Call internal method of callback with T as the this value and
                    // argument list containing kValue, k, and O.
                    callback.call(T, kValue, k, O);
                }
                // d. Increase k by 1.
                k++;
            }
            // 8. return undefined
        };
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var k;
            // 1. Let O be the result of calling ToObject passing
            //    the this value as the argument.
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var O = Object(this);
            // 2. Let lenValue be the result of calling the Get
            //    internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;
            // 4. If len is 0, return -1.
            if (len === 0) {
                return -1;
            }
            // 5. If argument fromIndex was passed let n be
            //    ToInteger(fromIndex); else let n be 0.
            var n = +fromIndex || 0;
            if (Math.abs(n) === Infinity) {
                n = 0;
            }
            // 6. If n >= len, return -1.
            if (n >= len) {
                return -1;
            }
            // 7. If n >= 0, then Let k be n.
            // 8. Else, n<0, Let k be len - abs(n).
            //    If k is less than 0, then let k be 0.
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            // 9. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the
                //    HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                //    i.  Let elementK be the result of calling the Get
                //        internal method of O with the argument ToString(k).
                //   ii.  Let same be the result of applying the
                //        Strict Equality Comparison Algorithm to
                //        searchElement and elementK.
                //  iii.  If same is true, return k.
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }
    if (!Array.prototype.lastIndexOf) {
        Array.prototype.lastIndexOf = function (searchElement /*, fromIndex*/) {
            'use strict';
            if (this === void 0 || this === null) {
                throw new TypeError();
            }
            var n, k,
                t = Object(this),
                len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }
            n = len - 1;
            if (arguments.length > 1) {
                n = Number(arguments[1]);
                if (n != n) {
                    n = 0;
                }
                else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            for (k = n >= 0
                  ? Math.min(n, len - 1)
                  : len - Math.abs(n) ; k >= 0; k--) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }
    if (!Array.prototype.map) {
        Array.prototype.map = function (callback, thisArg) {
            var T, A, k;
            if (this == null) {
                throw new TypeError(" this is null or not defined");
            }
            // 1. 将O赋值为调用map方法的数组.
            var O = Object(this);
            // 2.将len赋值为数组O的长度.
            var len = O.length >>> 0;
            // 4.如果callback不是函数,则抛出TypeError异常.
            if ({}.toString.call(callback) != "[object Function]") {
                throw new TypeError(callback + " is not a function");
            }
            // 5. 如果参数thisArg有值,则将T赋值为thisArg;否则T为undefined.
            if (thisArg) {
                T = thisArg;
            }
            // 6. 创建新数组A,长度为原数组O长度len
            A = new Array(len);
            // 7. 将k赋值为0
            k = 0;
            // 8. 当 k < len 时,执行循环.
            while (k < len) {
                var kValue, mappedValue;
                //遍历O,k为原数组索引
                if (k in O) {
                    //kValue为索引k对应的值.
                    kValue = O[k];
                    // 执行callback,this指向T,参数有三个.分别是kValue:值,k:索引,O:原数组.
                    mappedValue = callback.call(T, kValue, k, O);
                    // 返回值添加到新数组A中.
                    A[k] = mappedValue;
                }
                k++;
            }
            // 9. 返回新数组A
            return A;
        };
    }
    if (!Array.prototype.some) {
        Array.prototype.some = function (fun/*, thisArg*/) {
            'use strict';
            if (this == null) {
                throw new TypeError('Array.prototype.some called on null or undefined');
            }
            if (typeof fun !== 'function') {
                throw new TypeError();
            }
            var t = Object(this);
            var len = t.length >>> 0;
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(thisArg, t[i], i, t)) {
                    return true;
                }
            }
            return false;
        };
    }
    /**
    * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
    * on host objects like NamedNodeMap, NodeList, and HTMLCollection
    * (technically, since host objects have been implementation-dependent,
    * at least before ES6, IE hasn't needed to work this way).
    * Also works on strings, fixes IE < 9 to allow an explicit undefined
    * for the 2nd argument (as in Firefox), and prevents errors when
    * called on other DOM objects.
    * 第二个参数为 undefined 时截取到数组末尾，null 仍然是如同转换成 0
    */
    (function () {
        'use strict';
        var _slice = Array.prototype.slice;

        try {
            // Can't be used with DOM elements in IE < 9
            _slice.call(document.documentElement);
        } catch (e) { // Fails in IE < 9
            // This will work for genuine arrays, array-like objects,
            // NamedNodeMap (attributes, entities, notations),
            // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
            // and will not fail on other DOM objects (as do DOM elements in IE < 9)
            Array.prototype.slice = function (begin, end) {
                // IE < 9 gets unhappy with an undefined end argument
                end = (typeof end !== 'undefined') ? end : this.length;

                // For native Array objects, we use the native slice function
                if (Object.prototype.toString.call(this) === '[object Array]'){
                    return _slice.call(this, begin, end);
                }
               
                // For array like object we handle it ourselves.
                var i, cloned = [],
                    size, len = this.length;
               
                // Handle negative value for "begin"
                var start = begin || 0;
                start = (start >= 0) ? start: len + start;
               
                // Handle negative value for "end"
                var upTo = (end) ? end : len;
                if (end < 0) {
                    upTo = len + end;
                }
               
                // Actual expected size of the slice
                size = upTo - start;
               
                if (size > 0) {
                    cloned = new Array(size);
                    if (this.charAt) {
                        for (i = 0; i < size; i++) {
                            cloned[i] = this.charAt(start + i);
                        }
                    } else {
                        for (i = 0; i < size; i++) {
                            cloned[i] = this[start + i];
                        }
                    }
                }
               
                return cloned;
            };
        }
    }());
	/**************************   操作日期   *******************************************/
	//格式化日期格式
	if(!Date.prototype.format) {
		Date.prototype.format = function (format) {
			format = format || "yyyy-MM-dd HH:mm:ss";
			var o = {
				"M+": this.getMonth() + 1, // month
				"d+": this.getDate(), // day
				"H+": this.getHours(), // hour
				"m+": this.getMinutes(), // minute
				"s+": this.getSeconds(), // second
				"q+": Math.floor((this.getMonth() + 3) / 3), // quarter
				"S": this.getMilliseconds()// millisecond
			};
			if (/(y+)/.test(format)) {
				var year = this.getFullYear().toString(),
					year = 4 - RegExp.$1.length < 0 ? year : year.substr(4 - RegExp.$1.length);
				format = format.replace(RegExp.$1, year);
			}
			for (var k in o) {
				if (new RegExp("(" + k + ")").test(format)) {
					format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(o[k].toString().length));
				}
			}
			return format;
	   };
	}
    //解析日期字符窜
	if (!Date.parseForce) {
	    Date.parseForce = function (dateStr, format) {
	        var s = { "y": -1, "M": -1, "d": -1, "H": -1, "m": -1, "s": -1, "S": -1 },
                index = 0,
	            last = null,
                fs = "",
                opened = false;

	        function close() {
	            last = null;
	            fs += ")";
	            opened = false;
	        }
	        for (var i = 0; i < format.length; i++) {
	            var c = format.charAt(i);
	            if (s.hasOwnProperty(c)) {
	                if (!opened) {
	                    last = c;
	                    s[c] = ++index;
	                    fs += "(";
	                    opened = true;
	                } else if (last != c) {
	                    last = c;
	                    s[c] = ++index;
	                    fs += ")(";
	                    opened = true;
	                }
	                fs += "\\d";
	            } else {
	                if (opened) {
	                    close();
	                }
	                fs += c;
	            }
	        }
	        if (opened) {
	            close();
	        }

	        var ar = new RegExp(fs, "g").exec(dateStr);
	        if (ar) {
	            var date = new Date(0);
	            if (s.y != -1)
	                date.setFullYear(utils.parseInt(ar[s.y]));
	            if (s.M != -1)
	                date.setMonth(utils.parseInt(ar[s.M]) - 1);
                if(s.d != -1)
                    date.setDate(utils.parseInt(ar[s.d]));
                if (s.H != -1)
                    date.setHours(utils.parseInt(ar[s.H]));
                else if (s.y != -1 || s.M != -1 || s.d != -1)
                    date.setHours(0);
                if (s.m != -1)
                    date.setMinutes(utils.parseInt(ar[s.m]));
                if (s.s != -1)
                    date.setSeconds(utils.parseInt(ar[s.s]));
                if (s.S != -1)
                    date.setMilliseconds(utils.parseInt(ar[s.S]));
                return date;
	        }
	        return null;
	    };
	}
    //copy一个日期对象
	if (!Date.prototype.copy) {
	    Date.prototype.copy = function () {
	        return new Date(this.getTime());
	    };
	}
    //返回一个新对象，不改变原值。
	if (!Date.prototype.addMilliseconds) {
	    Date.prototype.addMilliseconds = function (num) {
	        var d = this.copy();
	        d.setMilliseconds(d.getMilliseconds() + utils.parseInt(num));
	        return d;
	    };
	}
    //返回一个新对象，不改变原值。
	if (!Date.prototype.addSeconds) {
	    Date.prototype.addSeconds = function (num) {
	        var d = this.copy();
	        d.setSeconds(d.getSeconds() + utils.parseInt(num));
	        return d;
	    };
	}
    //返回一个新对象，不改变原值。
	if (!Date.prototype.addMinutes) {
	    Date.prototype.addMinutes = function (num) {
	        var d = this.copy();
	        d.setMinutes(d.getMinutes() + utils.parseInt(num));
	        return d;
	    };
	}
    //返回一个新对象，不改变原值。
	if (!Date.prototype.addHours) {
	    Date.prototype.addHours = function (num) {
	        var d = this.copy();
	        d.setHours(d.getHours() + utils.parseInt(num));
	        return d;
	    };
	}
    //返回一个新对象，不改变原值。
	if (!Date.prototype.addDays) {
	    Date.prototype.addDays = function (num) {
	        var d = this.copy();
	        d.setDate(d.getDate() + utils.parseInt(num));
	        return d;
	    };
	}
    //返回一个新对象，不改变原值。日期增加指定的周
	if (!Date.prototype.addWeeks) {
	    Date.prototype.addWeeks = function (num) {
	        return this.addDays(utils.parseInt(num) * 7);
	    };
	}
    //返回一个新对象，不改变原值。增加指定的月数，如果增加后天数值变小则重置为0：2015-01-30.addMonths(1) ==> 2015-02-28
	if (!Date.prototype.addMonths) {
	    Date.prototype.addMonths = function (num) {
	        var d = this.copy(),
                day = d.getDate();
	        d.setMonth(d.getMonth() + utils.parseInt(num));
	        if (d.getDate() < day)
	            d.setDate(0);
	        return d;
	    };
	}
    //返回一个新对象，不改变原值
	if (!Date.prototype.addYears) {
	    Date.prototype.addYears = function (num) {
	        var d = this.copy(),
                month = d.getMonth();
	        d.setFullYear(d.setFullYear() + utils.parseInt(num));
	        if (month < d.getMonth())
	            d.setDate(0);
	        return d;
	    };
	}
	/**************************  操作Math-精确计算  ***********************************/
    Math.add = function (x, y, ignoreNaN) {
    	x = utils.isNumber(x) ? x : parseFloat(x);
    	y = utils.isNumber(y) ? y : parseFloat(y);
    	if(isNaN(x)) {
    		if(ignoreNaN) {
    			x = 0;
    		}else {
    			throw new Error("加法运算参数不能为NaN类型");
    		}
    	}
    	if(isNaN(y)) {
    		if(ignoreNaN) {
    			y = 0;
    		}else {
    			throw new Error("加法运算参数不能为NaN类型");
    		}
    	}
        var fractX, fractY, n;
        {
            var frags = x.toString().trim().split(".");
            fractX = frags.length > 1 ? frags[1].length : 0;
        }
        {
            var frags = y.toString().trim().split(".");
            fractY = frags.length > 1 ? frags[1].length : 0;
        }
        n = Math.pow(10, Math.max(fractX, fractY));
        return (x * n + y * n) / n;
    }
    //减
    Math.sub = function (x, y, ignoreNaN) {
    	x = utils.isNumber(x) ? x : parseFloat(x);
    	y = utils.isNumber(y) ? y : parseFloat(y);
    	if(isNaN(x)) {
    		if(ignoreNaN) {
    			x = 0;
    		}else {
    			throw new Error("减法运算参数不能为NaN类型");
    		}
    	}
    	if(isNaN(y)) {
    		if(ignoreNaN) {
    			y = 0;
    		}else {
    			throw new Error("减法运算参数不能为NaN类型");
    		}
    	}
        return Math.add(x, -y, ignoreNaN);
    }
    //乘
    Math.mul = function (x, y, ignoreNaN) {
    	x = utils.isNumber(x) ? x : parseFloat(x);
    	y = utils.isNumber(y) ? y : parseFloat(y);
    	if(isNaN(x) || isNaN(y)) {
    		if(ignoreNaN) {
    			return 0;
    		}else {
    			throw new Error("乘法运算参数不能为NaN类型");
    		}
    	}
        var n = 0, symbol = ".";
        x = x.toString();
        y = y.toString();
        try { n += x.split(symbol)[1].length } catch (e) { }
        try { n += y.split(symbol)[1].length } catch (e) { }
        return Number(x.replace(symbol, "")) * Number(y.replace(symbol, "")) / Math.pow(10, n);
    }
    //除
    Math.div = function (x, y, ignoreNaN) {
    	x = utils.isNumber(x) ? x : parseFloat(x);
    	y = utils.isNumber(y) ? y : parseFloat(y);
    	if(isNaN(x)) {
    		if(ignoreNaN) {
    			return 0;
    		}else {
    			throw new Error("被除数不能为NaN类型");
    		}
    	}
    	if(isNaN(y)) {
			throw new Error("除数不能为NaN类型");
    	}
        var n = 0, m = 0, symbol = ".";
        x = x.toString();
        y = y.toString();
        try { n = x.split(symbol)[1].length } catch (e) { }
        try { m = y.split(symbol)[1].length } catch (e) { }
        return Number(x.replace(symbol, "")) / Number(y.replace(symbol, "")) * Math.pow(10, m - n);
    }

    /**************************  操作Number-精确计算  ***********************************/
    Number.prototype.add = function (v, ignoreNaN) {
        return Math.add(this, v, ignoreNaN);
    }
    Number.prototype.sub = function (v, ignoreNaN) {
        return Math.sub(this, v, ignoreNaN);
    }
    Number.prototype.mul = function (v, ignoreNaN) {
        return Math.mul(this, v, ignoreNaN);
    }
    Number.prototype.div = function (v, ignoreNaN) {
        return Math.div(this, v, ignoreNaN);
    }
    
    /********** utils.js加载完成后执行的函数，兼容异步加载utils.js的情况  **********/
    try {
		if (utils.isFunction(utilsReady)) {
			utilsReady();
		}
	} catch (e) {
		
	}
    
})(jQuery);


