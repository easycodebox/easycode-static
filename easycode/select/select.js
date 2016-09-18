/**
 * @author WangXiaoJin
 */
;(function($){
	
	var defaults = {
		id		: false,		
		selfClass	: false,
		name	: false,
		url		: false,
		params	: false,
		data	: false,
		text	: "name",		//数据列表中 作为内容的属性名 
		value	: "id",			//数据列表中 作为值的属性名 
		selected : "selected",	//默认选中数据属性名
		headText : false,
		headValue : false,
		parent	: false,		//数据为本地已经定义好的，则需要定义parent 值
		width	: "200px",
		height	: "24px",
		fontSize : "12px",
		style	: false,		//select的style
		htmlAttr: null,			//显示的select框属性	
		panelStyle: false,		//下拉框内容div的style
		title	: false,		//select框中显示的内容
		showEvent : "click",	//显示下拉框的触发事件类型"click","mouseenter"
		event	: false
	};
	
	utils.loadCss(BaseData.path + "/js/expand/select/select.css");
	
	$.fn.UI_select = function(settings){
		var group = ++$.UI_select.SELECT_UI_Num + "";
		if(this[0] === undefined || !settings) return false;
		if(!settings instanceof Array)
			settings = [settings];
		var $objs = new Array(settings.length);
		var objIds = new Array(settings.length);
		for(var i = 0; i < settings.length; i++){
			var setting = settings[i] = $.extend({}, defaults, settings[i]);
			var $select = $('<div id="slt-select-' + setting.id + '" class="ui-select" style="width:' 
					+ setting.width + '; height:' + setting.height + ';font-size:' + setting.fontSize + ';" ' + (setting.htmlAttr ? setting.htmlAttr : '') + '></div>')
				, $selectValue = $('<input type="hidden" id="' + setting.id + '" class="ui-select-value" />')
				, $imgBox = $('<img id="slt-img-' + setting.id + '" style="width:' + setting.width + '; height:' + setting.height + ';" src="' + BaseData.path 
					+ '/js/expand/select/imgs/select.jpg' + '" />');
			setSelectValueAttr($selectValue, setting);
			if(setting.style && utils.isObject(setting.style))
				$select.css(setting.style);
			$select.append($selectValue).append($imgBox);
			if(setting.title){
				$select.append('<div id="slt-title-' + setting.id + '" class="ui-sel-title ui-sel-gray" style="height:' + setting.height + '; line-height:' + setting.height + ';">' 
					+ setting.title + '</div>');
			}
			createOption($select, setting);	
			$select.data('select', {
				settings : setting,
				parent : null,
				group : group
			});
			this.append($select);
			bindFunc($select, setting);
			$objs[i] = $select;
			objIds[i] = setting.id;
		}
		$("body").data("ui-select-" + group,objIds);
		processData($objs, settings);
	};
	
	function setSelectValueAttr(_sv, setting){
		if(setting.id)
			_sv.attr("id", setting.id);
		if(setting.selfClass)
			_sv.addClass(setting.selfClass);
		if(setting.id)
			_sv.attr("name", setting.name);
	}
	
	function createOption($select, setting){
		var $option = $('<div id="slt-panel-' + setting.id + '" class="ui-select-panel" style="display:none;width: ' 
				+ setting.width + ';top:' + setting.height + ';line-height:' + setting.height + ';"></div>');
		if(setting.headText)
			$option.append(getItemHeadStr(setting.id, setting.headValue, setting.headText));
		if(setting.panelStyle && utils.isObject(setting.panelStyle))
			$option.css(setting.panelStyle);
		$select.append($option);
	}
	
	function bindFunc($select, setting){
		if(setting.showEvent == "click") {
			getImgJq(setting.id).add(getTitleJq(setting.id)).on("click", function(){
				$(".ui-select-panel").hide();
				getPanelJq(setting.id).show();
				return false;
			});
			$("body").off("click.ui_select").on("click.ui_select", function(){
				$(".ui-select-panel").hide();
			});
		}else if(setting.showEvent == "mouseenter"){
			$select.on("mouseenter", function(){
				getPanelJq(setting.id).show();
			});
			$select.on("mouseleave", function(){
				getPanelJq(setting.id).hide();
			});
		}
		if(setting.event){
			if(setting.event.change){
				var changeEvt = setting.event.change;
				getValueJq(setting.id).change(changeEvt);
				delete setting.event.change;
			}
			$select.on(setting.event, ".ui-select-item");
		}
	}
	
	function processData($objs, settings){
		for(var i = 0; i < $objs.length; i++){
			$objs[i].on("click", ".ui-select-item", {curSetting: settings[i],
					nextSetting: i < $objs.length - 1 ? settings[i+1] : null}, function(e){
				getPanelJq(e.data.curSetting.id).hide();
				var value = $(this).attr("value");
				value = value ? $.trim(value) : value;
				if(value != getValueJq(e.data.curSetting.id).val()
					|| value == getItemHeadJq(e.data.curSetting.id).attr("value")){
					var group = getSelectJq(e.data.curSetting.id).data('select').group;
					var ids = $("body").data("ui-select-" + group);
					var exist = false;
					for(var j = 0; j < ids.length; j++){
						if(ids[j] === e.data.curSetting.id){
							exist = true;
							continue;
						}
						if(exist){
							clear(ids[j]);
						}else
							continue;
					}
					var $title = getTitleJq(e.data.curSetting.id);
					$title.text($(this).text());
					if($title.hasClass("ui-sel-gray"))
						$title.removeClass("ui-sel-gray");
					if(value != getValueJq(e.data.curSetting.id).val()) {
						//select框值改变，触发事件
						getValueJq(e.data.curSetting.id).val(value).change();
					}
					if(e.data.nextSetting){
						var nextSel = getSelectJq(e.data.nextSetting.id);
						nextSel.data('select').parent = value;
						getNotItemHeadJq(e.data.nextSetting.id).remove();
						if(value != getItemHeadJq(e.data.curSetting.id).attr("value"))
							loadDate(nextSel, e.data.nextSetting, e.data.curSetting.parent);
					}
				}
				return false;
			});
		}
		if($objs[0])
			loadDate($objs[0], settings[0]);
	}
	
	function loadDate($select, setting, parentVal){
		if(setting.url){
			var parent = $select.data('select').parent;
			var url = parent ? setting.url.format(parent) : setting.url;
			var params = utils.clone(setting.params);
			//parent参数没被赋值过，执行下面逻辑
			if(parent && params && url === setting.url){
				if(typeof params === "string")
					params = parent ? params.format(parent) : params;
				else if(typeof params === "object"){
					for(var key in params){
						params[key] = params[key].format(parent);
					}
				}
			}
			$.ajax({
				url: url,
				data: params,
				type: "POST",
				async: false,
				success: function(data){
					if(!data || !data.data) return;
					data = data.data;
					var backDate = getOptionItemStr(data, setting, parentVal);
				    getPanelJq(setting.id).append(backDate.str);
				    if(backDate.selectVal){
						getPanelJq(setting.id).find(".ui-select-item[value=" + backDate.selectVal + "]").click();
					}
				}
			});		
		}else if(setting.data){
			var backDate = getOptionItemStr(setting.data, setting, parentVal);
			getPanelJq(setting.id).append(backDate.str);
			if(backDate.selectVal){
				getPanelJq(setting.id).find(".ui-select-item[value=" + backDate.selectVal + "]").click();
			}
		}
	}
	
	function getOptionItemStr(data, setting, parentVal){
		var ret = {
			str : "",
			selectVal : null
		};	
		if(data instanceof Array){
			var obj;
			var html = [];
			for(var i = 0; i < data.length; i++){
				obj = data[i];
				if(obj[setting.text] && (parentVal && setting.parent 
					&& parentVal === setting.parent || !parentVal || !setting.parent)){
					html.push('<div class="ui-select-item" ' + (obj[setting.value] 
						? 'value="' + obj[setting.value] + '"' : '') + ' >');
					html.push(obj[setting.text]);
					html.push('</div>');
					if(obj[setting.selected])
						ret.selectVal = obj[setting.value];
				}
			}
			ret.str = html.join('');
		}else{
			if(data[setting.text] && (parentVal && setting.parent 
					&& parentVal === setting.parent || !parentVal || !setting.parent)){
				ret.str = 'div class="ui-select-item" ' + (data[setting.value] ? 
					'value="' + data[setting.value] + '"' : '' ) + ' >' 
					+ data[setting.text] + '</div>';
				if(data[setting.selected])
					ret.selectVal = data[setting.value];
			}
		}
		return ret;
	}
	
	function clear(id, removeData){
		var $sel = getSelectJq(id);
		var settmp = $sel.data('select').settings;
		var $title = getTitleJq(settmp.id);
		if($title.hasClass("ui-sel-gray"))
			$title.removeClass("ui-sel-gray");
		if(settmp.headText){
			getTitleJq(id).text(settmp.headText);
			if(removeData)
				getPanelJq(id).html(getItemHeadStr(settmp.id, settmp.headValue, settmp.headText));
			getValueJq(id).val(settmp.headValue).change();
		}else{
			getTitleJq(id).text("");
			getValueJq(id).val("").change();
		}
	}
	
	function getItemHeadStr(id, headValue, headText){
		return '<div id="slt-item-head-' + id + '" class="ui-select-item select-item-head" value="' + (headValue ? 
				headValue : '') + '" >' + headText + '</div>';
	}
	
/*******************************************************************************
* UI-SELECT
* 获取ui-select的dom元素的jquery对象
*******************************************************************************/	
	function getSelectJq(id){
		return $("#slt-select-" + id);
	}
	
	function getValueJq(id){
		return $("#" + id);
	}
	
	function getImgJq(id){
		return $("#slt-img-" + id);
	}
	
	function getTitleJq(id){
		return $("#slt-title-" + id);
	}
	
	function getTitleJq(id){
		return $("#slt-title-" + id);
	}
	
	function getPanelJq(id){
		return $("#slt-panel-" + id);
	}
	
	function getItemHeadJq(id){
		return $("#slt-item-head-" + id);
	}
	
	function getNotItemHeadJq(id){
		return getPanelJq(id).find(".ui-select-item:not(.select-item-head)");
	}
	
	
	$.UI_select = {
		SELECT_UI_Num: 0,
		clear: function(id){
			//清楚指定的以及后续select数据
			var group = getSelectJq(id).data('select').group;
			var ids = $("body").data("ui-select-" + group);
			var exist = false;
			for(var j = 0; j < ids.length; j++){
				if(ids[j] === id){
					exist = true;
					clear(ids[j]);
					continue;
				}
				if(exist){
					clear(ids[j], true);
				}
			}
		},
		reset: function(id){
			
		},
		select: function(id, value){
			//既修改数据，select显示内容也变化
			var item = getPanelJq(id).find(".ui-select-item[value=" + value + "]");
			if(item.length > 0) {
				item.click();
				return true;
			}else
				return false;
		},
		unselect: function(id, value){
			var val = getValueJq(id).val();
			if(val === value){
				getItemHeadJq(id).click();
				getValueJq(id).change();
				return true;
			}else
				return false;
		},
		setValue: function(id, value){
			//只是修改对应的数据，但是select上显示的内容没有变化
			getValueJq(id).val(value).change();
		},
		getSelected: function(id){
			//获取已选择的值
			var obj = {},
				val = getValueJq(id).val();
			if(val != ""){
				obj.value = val;
				obj.text = getTitleJq(id).html();
			}
			return	obj;
		}
	};
	
})(jQuery);