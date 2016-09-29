/**
 * 开启/关闭功能
 * @author WangXiaoJin
 * 
 */
(function ($) {

	$.fn.UI_switch = function(opts) {
		opts = $.extend(true, {}, $.fn.UI_switch.defaults, opts);
		var self = this,
			obverseClass,
			reverseClass;
		for(var cls in opts.change) {
			if(!obverseClass) {
				obverseClass = cls;
			}else if(!reverseClass) {
				reverseClass = cls;
			}else
				break;
		}
		
		function change(addClass, removeClass) {
			var $this = $(this),
				$addObj = opts.change[addClass],
				$rmObj = opts.change[removeClass];
			if($this.hasClass(opts.batchClass)
					&& opts.targetClass) {
				var $targets = opts.getTargetsOnBatchMode();
					
				if($rmObj.targetText)
					$targets.text($rmObj.targetText);
				if($addObj.targetClass && $rmObj.targetClass) {
					$targets.removeClass($addObj.targetClass).addClass($rmObj.targetClass);
				}
				$targets.removeClass(removeClass).addClass(addClass);
				if($addObj.sucText)
					$targets.html($addObj.sucText);
			}else {
				if($addObj.sucText)
					$this.html(s.sucText);
				$this.removeClass(removeClass).addClass(addClass);
				
				var $target = !opts.targetClass ? $this
						: $this.closest(opts.trSelector).find("." + opts.targetClass);
				if($rmObj.targetText)
					$target.text($rmObj.targetText);
				if($addObj.targetClass && $rmObj.targetClass) {
					$target.removeClass($addObj.targetClass).addClass($rmObj.targetClass);
				}
			}
		}
		
		function bindData(s, defaultData) {
			s.data = s.data || $.extend({}, defaultData);
			if(!opts.idsKey) 
				return;
			var $this = $(this), vals = [];
			if($this.hasClass(opts.batchClass)) {
				opts.getCheckedObjs().each(function(){
					vals.push($(this).val());
				});
			}else {
				var val = $this.closest(opts.trSelector).find("input[name={}]".format(opts.idsKey)).val();
				if(val)
					vals.push(val);
			}
			s.data[opts.idsKey] = vals;
		}
		self.on("click.UI_switch", opts.srcSelector, function() {
			var _this = this;
			if($(_this).hasClass(opts.batchClass)
					&& opts.getCheckedObjs().length == 0) {
				$.msg("warn", "请先选择您要操作的对象！");
				return;
			}
			if($(_this).hasClass(obverseClass)){
				var s = $.extend({}, opts.change[obverseClass] || {});
				s.url = s.url || opts.url;
				var successTmp = s.success;
				s.success = function(data, textStatus, jqXHR){
					if(!data.code || data.code == BaseData.suc){
						change.call(_this, reverseClass, obverseClass);
					}
					if(successTmp)
						successTmp.call(_this, data, textStatus, jqXHR);
				};
				bindData.call(_this, s, opts.defaultData[obverseClass]);
				if(s.beforeAjax){
					var back = s.beforeAjax.call(_this, s);
					if(back === false)
						return;
				}
				if(s.confirmMsg){
					$.confirm(s.confirmMsg, function(){
						$.ajax(s);
					});
				}else{
					$.ajax(s);
				}
			}else if($(_this).hasClass(reverseClass)){
				var s = $.extend({}, opts.change[reverseClass] || {});
				s.url = s.url || opts.url;
				var successTmp = s.success;
				s.success = function(data, textStatus, jqXHR){
					if(!data.code || data.code == BaseData.suc){
						change.call(_this, obverseClass, reverseClass);
					}
					if(successTmp)
						successTmp.call(_this, data, textStatus, jqXHR);
				};
				bindData.call(_this, s, opts.defaultData[reverseClass]);
				if(s.beforeAjax){
					var back = s.beforeAjax.call(_this, s);
					if(back === false)
						return;
				}
				if(s.confirmMsg){
					$.confirm(s.confirmMsg, function(){
						$.ajax(s);
					});
				}else{
					$.ajax(s);
				}
			}
			return false;
		});
		return this;
	};
	
    $.fn.UI_switch.defaults = {
		batchClass: "batch",//批处理标识，含有class="batch" 表明此操作是批处理
		targetClass: null,	//操作成功后修改的目标对象,null为当前触发事件的对象。批量操作必须传值
		idsKey: "ids",		//主键参数的key值，用于获取已选中的对象函数（getCheckedObjs）和ajax请求传参的key值使用
		trSelector: "tr",	//行属性值，数据为表数据的id
		url: null,			//如果change里面包含url参数则首选，否则用此url参数
		srcSelector: null,//触发点击事件的代理对象
		scopeSelector: null,//操作的dom范围
		//获取已选中的对象
		getCheckedObjs: function() {
			return $("{}input[name={}]:checked".format(this.scope ? this.scope + " " : "", this.idsKey));
		},
		//在batch操作模式下获取target对象
		getTargetsOnBatchMode: function() {
			var parents = this.getCheckedObjs().closest(this.trSelector);
			return parents.find("." + this.targetClass);
		},
		change: {
			"switch-open": {
				confirmMsg	: "确定启用？",
		 		sucMsg		: null,
		 		failMsg		: "启用失败!",
		 		sucText		: null,
		 		targetText	: null,
		 		targetClass	: "yes",
		 		url			: null,
		 		type		: "POST",
		 		cache 		: false,
		 		data		: null
			},
			"switch-close": {
				confirmMsg	: "确定禁用？",
		 		sucMsg		: null,
		 		failMsg		: "禁用失败!",
		 		sucText		: null,
		 		targetText	: null,
		 		targetClass	: "no",
		 		url			: null,
		 		type		: "POST",
		 		cache 		: false,
		 		data		: null
			}
		},
		defaultData: {
			"switch-open": {
				status: "OPEN"
			},
			"switch-close": {
				status: "CLOSE"
			}
		}
    };
    
})(jQuery);

