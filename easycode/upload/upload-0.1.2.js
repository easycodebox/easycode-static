/**
 * @author WangXiaoJin
 */
;(function($){

/*******************************************************************************
* $.fn.viewImg 为本地浏览图片功能，没有与服务器交互
* 一、
* $("#filen").viewImg({previewId:"veiw"});
* <div id="veiw" style="width: 100px; height: 100px; border: 1px solid black;">
*	 图片预览区
* </div>
* <input type="file" id="filen" name="file" />
* 
* 二、
* $("#upload").viewImg({previewId:"upload"});
* <div id="upload"
*			style="width: 100px; height: 100px; border: 1px solid black; position: relative; overflow: hidden;">
*		<div style="position: absolute; top: 0; left: 0;">
*			上传文件
*	 	</div>
*	</div>
* 三、
* $("#upload").viewImg({
*	previewId:"upload",
*	beforeView: function(){
*		$("#uploadImg").hide();
*	}
*});
*
*<div style="margin: 0 auto; width: 800px;">
*	<div id="upload"
*		style="border: 1px dashed #FF9900;color: #999999; height: 150px;
*		position: relative;width: 150px;">
*		<div id="uploadImg">
*			<img src="<%=path%>/imgs/upload/upload.png" />
*		</div>
*	</div>
*</div> 
*******************************************************************************/
	var defaults = {
		previewId: "preview",
		fileName: "files",	//the name of input=file tag 
		fileWidth: false,	//the width of input=file tag
		fileHeight: false,
		original: false,	//is show original img
		imgWidth: false,
		imgHeight: false,
		type: "jpg,bmp,gif,png",
		beforeView: false,
		afterView: false
	};
	
	$.fn.viewImg = function(option){
		if(this.length === 0) return;
		var _opts = $.extend({}, defaults, option),
			eleType = this.get(0).type,
			$imgBox = $("#"+_opts.previewId),
			$imgDiv = utils.$dom("div", null, "view_img_div", "overflow:hidden;text-align: center;vertical-align: middle;display: table-cell;"),
			$file;
		//init the settings params
		_opts.fileWidth = _opts.fileWidth || this.width();
		_opts.fileHeight = _opts.fileHeight || this.height();
		_opts.imgWidth = _opts.imgWidth || $imgBox.width();
		_opts.imgHeight = _opts.imgHeight || $imgBox.height();
		//set $imgDiv css
		$imgDiv.width($imgBox.width());
		$imgDiv.height($imgBox.height());
		
		if(eleType !== "file"){
			var $fileDiv = utils.$dom("div", null, "view_img_file_div", "position: absolute;opacity: 0;left: 0;top: 0;cursor: pointer;overflow:hidden;");
			$fileDiv.css({
				width: _opts.fileWidth, 
				height: _opts.fileHeight			
			});
			$file = $('<input type="file" name="' + _opts.fileName + '" />');
			$file.css({
				width: $imgBox.outerWidth()*1.5, 
				fontSize: $imgBox.outerHeight()*1.5,
				margin:"-10px 0 0 -10px",
				opacity: 0
			});
			if(utils.browser.ie)
				$file.attr("hideFocus","true");
			$fileDiv.html($file);
			this.prepend($fileDiv);
		}else
			$file = this;
			
		$file.change(function(){
			if(_opts.beforeView)
				_opts.beforeView.call(this);
		    var fileType = utils.fileType(this.value),
		    	$img = utils.$dom("img", null, "view_img"),
		    	imgOriginalW,
		    	imgOriginalH,
		    	fileReader;
		    if(!_opts.original){
	    		$img.css({
			    	maxWidth: _opts.imgWidth,
			    	maxHeight: _opts.imgHeight
			    });
		    }
		    
		    if(_opts.type.indexOf(fileType) > -1){ 
		        if(this.files && window.FileReader){
		        	//HTML5实现预览，兼容chrome、火狐7+等
	                fileReader = new FileReader(); 
	                fileReader.onload = function(e){
	                    $img.attr("src", e.target.result);
	                    $imgDiv.html($img);
	                    $imgBox.prepend($imgDiv);
	                }  
	                fileReader.readAsDataURL(this.files[0]);
	                if(_opts.afterView)
	                	_opts.afterView.call(this);
	                return false;
		        }else if (utils.browser.ie){
		            if(utils.browser.ie == "6.0"){
		            	//ie6
		            	$img.css({
					    	width: _opts.imgWidth,
					    	height: _opts.imgHeight
					    });
		                $img.attr("src", this.value);
		            }else{
		            	//ie[7-9]
		                this.select();
		                //不加上document.selection.createRange().text在ie9会拒绝访问
		                //if(browserVersion.indexOf("MSIE 9") > -1)
		                    this.blur();	
		                    
		                var $img = utils.$dom("div", null, "view_img"),
		                	_fileURL = document.selection.createRange().text;
		                if(!_opts.original){
							$img.css({
								width: _opts.imgWidth,
				    			height: _opts.imgHeight,
								"filter":"progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled:'true',sizingMethod='scale',src='"+_fileURL+"')"
							});
		                }else{
		                	//显示原图
		                	$img.css("filter","progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled:'true',sizingMethod='mage',src='"+_fileURL+"')");
		               		$img.height($imgBox.height());
		               		$img.width($imgBox.width());
		                }
		                document.selection.empty();
		            }
		        }else if(utils.browser.firefox){
		        	//firefox
		            if(utils.browser.firefox < 7){
		            	//firefox7以下版本
		                $img.attr("src", this.files[0].getAsDataURL());
		            }else{
		            	//firefox7.0+                    
		                $img.attr("src", window.URL.createObjectURL(this.files[0]));
		            }
		        }else{
		            $img.attr("src", this.value);
		        }         
		    }else{
		    	$.msg("warn", "仅支持"+ _opts.type +"为后缀名的文件!");
		        this.value = "";//清空选中文件
		        if(utils.browser.ie){                        
		            this.select();
		            document.selection.clear();
		        }              
		        if(_opts.afterView)
	                _opts.afterView.call(this);  
		        return false;
		    }
			$imgDiv.html($img);
            $imgBox.prepend($imgDiv);
            if(_opts.afterView)
	        	_opts.afterView.call(this);
			return false;
		});
		return this;
	};
	
/*******************************************************************************
* 以下功能为与服务器进行交互功能
例子1：处理后台传过来的额图片，重新生成宽高，图片div的宽高固定
$("#uploadImgs").uploadImg({
	fileKey: "findCate",
	picInput: "textVal",
	picDiv: "uploadImgs",
	uploadTitle: "up_img"
	
});
<div id="uploadImgs"
	style="border: 1px dashed #FF9900;color: #999999; height: 150px;
	position: relative;width: 150px;">
	<img id="up_img" style="width: 150px;height: 150px;position: absolute;top: 0;" src="<%=path%>/imgs/upload/upload.png"  />
</div>

例子2：处理后台传过来的额图片，重新生成宽高，图片div的宽高不固定
$("#uploadImgs").uploadImg({
	fileKey: "findCate",
	picInput: "textVal",
	picDiv: "uploadImgs",
	uploadTitle: "up_img",
	imgWidth: 150
	isPicDivFix: false
});
<div id="uploadImgs"
	style="border: 1px dashed #FF9900;color: #999999; min-height: 150px;
	position: relative;width: 150px;">
	<div id="up_img" style="width: 100%;height: 100%;position: absolute;top: 0;background: url('<%=path%>/imgs/upload/upload.png') no-repeat center center" />
</div>
*******************************************************************************/
	var upDefaults = {
		id : null,
		url : null,		//默认为BaseData.imgUrl + "/upload"
		fileName : "files",
		fileType : "PIC_TYPE",//文件类型
		fileKey : false,    //定位文件的上传路径及校验规则关键字
		responseUrl: null,	//默认为BaseData.path + "/blank.html"
		imgRule : null,
		syncRule : false,	//同步imgRule属性到picInput值中
		data : {},
		imgWidth : false,
		imgHeight : false,
		imgWHScale: true,	//设置imgWidth、imgHeight时，依据此值判断是否等比例缩放图片
		imgWrapHtml: null,	//包裹在每张图片上的html的标签
		imgMaxWidth : false,
		imgMaxHeight : false,
		picInput : false,		//服务返回的URL数据 存放在picInput指定的元素中
		picDiv : false,			//预览上传服务器图片的对象
		initImg: false,			//初始化显示的图片，修改功能常见
		appendImg: false,		//上传的图片是否已追加的形式出现，为true的话第二次上传的图片会把第一次的图片覆盖掉
		uploadTitle : false,	//上传图片之前显示的提示信息 图片的url
		loading : "/imgs/util/loading.gif",		//正在上传时显示的图片地址
		isPicDivFix: true,		//存放图片的div高度、宽度是否固定
		timeout: 0,				//0表示不设置超时时间
		timeoutMsg: "预览图片超时，请重新选择图片",
		beforeUpload: false,
		afterUpload : false,
		success : function(data) {
			var self = this,
				opts = self.options,
				$picIpt = $('#'+ opts.picInput);
			//显示上传提示信息dom对象
			if(opts.uploadTitle){
				$("#"+opts.uploadTitle).show();
			}
			//清空之前的值
			if(opts.picInput && !opts.appendImg)
				$picIpt.val("");
			//删除之前上传的图片
			if(opts.picDiv && !opts.appendImg)
				$('#' + opts.picDiv).find(".icer_upload_img_wrap").remove();
			if (data.code === BaseData.suc) {
				if(data.data[0].error) {
					//隐藏loading
					if(opts.loading)
						self.loading.hide();
					$.msg("error", data.data[0].error);
					return ;
				}
				
				opts.imgWidth = utils.removeUnit(opts.imgWidth);
				opts.imgHeight = utils.removeUnit(opts.imgHeight);
				
				var	url = data.data[0].path + "/" + data.data[0].name,
					procUrl = url.replace(new RegExp(BaseData.tmpPath + "/"), ""),
					$picDiv = $('#' + opts.picDiv),
					imgDivW = $picDiv.width(),
					imgDivH = $picDiv.height();
				if(opts.picInput) {
					procUrl = opts.syncRule ? utils.imgUrlFormat(procUrl, opts.imgRule) : procUrl;
					$picIpt.val(opts.appendImg && $picIpt.val().trim() ? $picIpt.val() + "," + procUrl : procUrl);
				}
				//隐藏上传按钮图片
				if(opts.uploadTitle){
					$("#"+opts.uploadTitle).hide();
				}
				if(opts.picDiv){
					var $img = utils.$dom("img", null, "icer_upload_img"),
						$imgWrap = opts.imgWrapHtml ? $(opts.imgWrapHtml).addClass("icer_upload_img_wrap") 
							: utils.$dom("div", null, "icer_upload_img_wrap"),
						url = BaseData.imgUrl + '/' + utils.imgUrlFormat(url, opts.imgRule);
					$img.attr("src", url);
					//不加上空格（或者其他数据），则ie下line-height同样高度不会垂直居中
					$imgWrap.html($img).append(" ");
					
					if(opts.imgMaxWidth)
						$img.css("maxWidth", opts.imgMaxWidth);
					if(opts.imgMaxHeight)
						$img.css("maxHeight", opts.imgMaxWidth);
					if(opts.isPicDivFix){
						utils.imgWH(url, function(img){
							var	tmpW = opts.imgWidth ? (!imgDivW || imgDivW > opts.imgWidth ? opts.imgWidth : imgDivW) : imgDivW,
								tmpH = opts.imgHeight ? (!imgDivH || imgDivH > opts.imgHeight ? opts.imgHeight : imgDivH) : imgDivH,
								wh = utils.zoomImg(img.width, img.height, tmpW , tmpH, opts.imgWHScale);
							if(!opts.imgWrapHtml)
								$imgWrap.attr("style","width: " + imgDivW + "px;height: " + imgDivH + "px;text-align: center;display: table-cell;vertical-align: middle;*line-height: " + imgDivH + "px;");
							$img.css({
								width: wh.width,
								height: wh.height
							});
							$picDiv.append($imgWrap);
							//隐藏loading
							if(opts.loading)
								self.loading.hide();
						});
						return;
					}else{
						//有可以返回的图片会撑开或缩放原有的div box，所以最好重新计算显示图片框的的宽高
						$img.one("load", function(){
							_resize.call(self, $img.width(), $img.height());
							//隐藏loading
							if(opts.loading)
								self.loading.hide();
						});
						if(opts.imgWidth)
							$img.width(opts.imgWidth);
						if(opts.imgHeight)
							$img.height(opts.imgHeight);
					}
					$picDiv.append($imgWrap);
				}
			} else {
				//隐藏loading
				if(opts.loading)
					self.loading.hide();
				$.msg("error", data.msg ? data.msg : "上传图片失败！");
			}
		},
		afterError: function(str) {
			$.msg("error", str);
		}
	};
	
	$.fn.uploadImg = function(options){
		var self = this;
		if(self.length === 0) return;
		upDefaults.url = upDefaults.url ? upDefaults.url : BaseData.imgUrl + "/upload";
		upDefaults.responseUrl = upDefaults.responseUrl ? upDefaults.responseUrl : BaseData.path + "/error/blank.html";
		var _opts = $.extend({}, upDefaults, options);
		if(!_opts.id)
			_opts.id = "upload_img_" + new Date().getTime();
		if(_opts.fileType)
			_opts.data.fileType = _opts.fileType;
		if(_opts.fileKey)
			_opts.data.fileKey = _opts.fileKey;
		if(_opts.responseUrl)
			_opts.data.responseUrl = _opts.responseUrl;
		if(_opts.uploadTitle){
			self.mouseenter(function(){
				$("#"+_opts.uploadTitle).show();
			});
			self.mouseleave(function(){
				if(_opts.picDiv && $("#"+_opts.picDiv).find(".icer_upload_img_wrap").length > 0)
					$("#"+_opts.uploadTitle).hide();
			});
		}
		self = _initUpload.call(self, _opts);
		if(self.file){
			self.file.change(function(){
				//如果file框没有选中文件，则终止操作，为了兼容chrome的取消按钮引发的清空数据问题
				if(!self.file.val())
					return;
				if(!_opts.appendImg)
					_removeImg.call(self, _opts);
				//显示上传提示信息dom对象
				if(options.uploadTitle){
					$("#"+options.uploadTitle).show();
				}
				_submitUpload.call(self, _opts);
			});
		}
		$.uploadImg.list[_opts.id] = self;
	};
	
	//初始化上传功能的html标签
	function _initUpload(options){
		var self = this,
			fileName = options.fileName,
			url = options.url,
			target = 'icer_upload_iframe_' + new Date().getTime();
		var hiddenElements = [];
		for(var k in options.data){
			hiddenElements.push('<input type="hidden" class="not-reset" name="' + k + '" value="' + options.data[k] + '" />');
		}
		var html = [
			'<div class="icer_upload_block" style="overflow: hidden;position:absolute;top:0;left:0;cursor:pointer;z-index:10000;" >',
			'<iframe name="' + target + '" style="display:none;"></iframe>',
			(options.loading ? '<div class="icer_upload_loading" style="display:none;position:absolute;top:0;left:0;width:100%; height: 100%;background:url(\'' + options.loading + '\') no-repeat center center;"></div>' : ''),
			'<form class="icer_upload_form" method="post" enctype="multipart/form-data" target="' + target + '" action="' + url + '">',
			hiddenElements.join(''),
			'<input type="file" class="icer_upload_file not-reset" name="' + fileName + '" ' + ( utils.browser.ie ? ' hideFocus="true" ' : '' ) + ' />',
			'</form>',
			'</div>'].join('');
		var $html = $(html);
		
		//初始化现有图片 获取class=initImg的图片并初始化 
		if(!options.initImg){
			var $img = self.find("img.initImg");
			if($img.length > 0){
				options.initImg = $($img[0]).attr("src").replace(BaseData.imgUrl + "/", "");
				$img.remove();
			}
		}else {
			options.initImg = options.initImg.replace(BaseData.imgUrl + "/", "");
		}
		
		if(options.picInput)
			$("#" + options.picInput).val("");
		
		self.div = $html;
		self.file = $html.find(".icer_upload_file");
		self.iframe = $html.find("iframe");
		self.form = $html.find('form');
		self.options = options;
		self.loading = options.loading ? $html.find(".icer_upload_loading") : null;
		$html.css({
			width: self.width(),
			height: self.height()
		});
		self.file.css({
			cursor: "pointer",
			width: self.outerWidth()*1.5, 
			fontSize: self.outerHeight()*1.5,
			opacity:0,
			margin:"-10px 0 0 -10px"
		});
		self.prepend($html);
		
		//如果有初始化图片，则初始化
		if(options.success && options.initImg) {
			var lastInd = options.initImg.lastIndexOf("/"),
				path = options.initImg.substring(0, lastInd), 
				name = options.initImg.substring(lastInd+1);
			options.success.call(self, {"code":BaseData.suc, "data":[{"path":path, "name": name}]});
		}
		return self;
	} 
	
	function _submitUpload() {
		var self = this,
			iframe = self.iframe,
			opts = self.options,
			requestDone = false;
		iframe.one('load', function(){
			if(requestDone === "timeout")
				return false;
			requestDone = true;
			var data = {},
				dataStr,
				error = "上传失败";
			if(opts.responseUrl) {
				//通过重新发送当前项目的请求，来解决跨域问题
				var search = this.contentWindow.location.search,
					params;
				search = search.charAt(0) === "?" ? search.substr(1) : search;
				params = search.split("&");
				if(params && params.length > 0) {
					for(var i = 0; i < params.length; i++) {
						var pair = params[i].split("=");
						if(pair && pair.length == 2 && pair[0] === "back_data") {
							dataStr = decodeURIComponent(pair[1]);
						}
					}
				}
			}else {
				var doc = utils.iframeDoc(iframe[0]),
					dataStr = doc.body.innerHTML,
					error = doc.body.parentNode.innerHTML;
				dataStr = utils.unescape(dataStr);
				iframe[0].src = 'javascript:false';
			}
			try {
				if(dataStr) {
					data = JSON.parse(dataStr);
					if(utils.isString(data))
						data = JSON.parse(data);
				}
			} catch (e) {
				opts.afterError.call(self, error );
			}
			if (data && opts.success) {
				opts.success.call(self, data);
			}
			if (opts.afterUpload) {
				opts.afterUpload.call(self, data);
			}
		});
		if(opts.beforeUpload){
			opts.beforeUpload.call(self);
		}
		//隐藏上传提示信息dom对象
		if(opts.uploadTitle){
			$("#"+opts.uploadTitle).hide();
		}
		//显示loading
		if(opts.loading)
			self.loading.show();
		if(opts.timeout > 0){
			setTimeout(function(){
                // Check to see if the request is still happening
                if( !requestDone ){
                	requestDone = "timeout";
                	_timeout.call(self);
                } 
            }, opts.timeout);
		}
		self.form[0].submit();
		return self;
	}
	
	function _timeout(){
		$.msg("error", this.options.timeoutMsg);
		this.options.afterUpload.call(this);
	}
	
	function _removeImg(options){
		if(options.picDiv){
			$("#"+options.picDiv).find(".icer_upload_img_wrap").remove();
		}
		if(options.picInput)
			$('#'+ options.picInput).val("");
	}
	
	function _resize(imgW, imgH){
		var self = this;
		//重新计算box div的宽高
		self.css({
			width: imgW,
			height: imgH
		});
		//重新计算icer_upload_block div的宽高
		self.div.css({
			width: imgW,
			height: imgH
		});
		//重新计算icer_upload_file file的宽高
		self.file.css({
			width: self.outerWidth()*1.5, 
			fontSize: self.outerHeight()*1.5
		});
	}
	
	$.uploadImg = {
		settings: function (id) {
			return $.uploadImg.list[id].options;
		},
		list: {
			
		},
		/**
		 * @param id 初始化时传入的id参数
		 * @param scope 指定dom区域，自动找出插件对象
		 */
		clear: function (id, scope) {
			var $obj = [];
			if(utils.isObject(id)) {
				scope = id;
				id = null;
			}
			if(id) {
				$obj.push($.uploadImg.list[id]);
			}else {
				for (var i in $.uploadImg.list) {
					if(scope) {
						var filter = scope.find($.uploadImg.list[i]);
						if(filter.length > 0)
							$obj.push($.uploadImg.list[i]);
					}else
						$obj.push($.uploadImg.list[i]);
				}
			}
			for(var i = 0; i < $obj.length; i++) {
				_removeImg($obj[i].options);
			}
		},
		setImg: function(id, imgUrl) {
			var $obj = $.uploadImg.list[id];
			if($obj && imgUrl) {
				var opts = $obj.options,
					lastInd = imgUrl.lastIndexOf("/"),
					path = imgUrl.substring(0, lastInd), 
					name = imgUrl.substring(lastInd + 1);
				opts.success.call($obj, {"code":BaseData.suc, "data":[{"path":path, "name": name}]});
			}
		}
	};
	
})(jQuery);

