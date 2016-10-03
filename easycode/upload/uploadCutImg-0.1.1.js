/**
 * @author WangXiaoJin
 * 
 */
(function ($) {
	
	var defaults = {
		type: "alert",	//alert弹出框模式，onePage同一个页面上传裁剪图片
		cx: "cx",		//存储cx、cy、cw、ch裁剪图片的input框
		cy: "cy",
		cw: "cw",
		ch: "ch",
		
		boxWidth: 600,	//裁剪框的大小
		boxHeight: 0,
		
		//alert 需要的字段
		cutPicBtn: "cutPicBtn",	//裁剪图片的按钮
		cutPicDiv: "cutPicDiv",	//存放裁剪之后图片的DIV框
		previewImgsPane: "previewPane",//预览图片的div class属性
		
		//onePage 需要的字段
		cutDivOnePage: "cutDivOnePage",//显示裁剪操作页面
		
		cutSrcImg: "cutSrcImg",		//插件需要的裁剪原图IMG
		cutBox: "cutBox",		//需要显示在弹出框里的裁剪区域
		previewImgs: ["previewImg"],//预览的图片
		previewImgsContainer:["previewContainer"]//预览图片的容器
	};
	
	$.fn.UI_uploadCutImg = function(settings) {
		var s = $.extend({}, defaults, settings || {}),
			$cx = $("#" + s.cx),
			$cy = $("#" + s.cy),
			$cw = $("#" + s.cw),
			$ch = $("#" + s.ch),
			$cutPicBtn = $("#" + s.cutPicBtn),
			$cutPicDiv = $("#" + s.cutPicDiv),
			$cutSrcImg = $("#" + s.cutSrcImg),
			$previewImgs,
			$cutDivOnePage = $("#" + s.cutDivOnePage),
			//裁剪后的宽高
			pcntWidth = $("#" + s.previewImgsContainer[0]).width(),
			pcntHeight = $("#" + s.previewImgsContainer[0]).height();
		for(var i = 0; i < s.previewImgs.length; i++) {
			if($previewImgs) {
				$previewImgs = $previewImgs.add($("#" + s.previewImgs[i]));
			}else
				$previewImgs = $("#" + s.previewImgs[i]);
		}
		
		function defaultSelect(jcrop_api, boundw, boundh){
			//设置默认选中框位置
	      	var centerx = boundw/2,
	      		centery = boundh/2,
	      		tmpw, tmph;
	      	if(boundw > boundh){
	      		tmph = boundh/2;
	      		tmpw = tmph*pcntWidth/pcntHeight;
	      	}else{
	      		tmpw = boundw/2;
	      		tmph = tmpw*pcntHeight/pcntWidth;
	      	}
	      	jcrop_api.animateTo([
	      		Math.round(centerx-tmpw),
	      		Math.round(centery-tmph),
	      		Math.round(centerx+tmpw),
	      		Math.round(centery+tmph)
	      	]);
		}
		
		if(s.type == "alert"){
			var jcrop_api,boundw,boundh;
			
			s.beforeUpload = function(){
				$cutPicBtn.hide();
				$cutSrcImg.attr("src", "");
				$previewImgs.attr("src", "");
				clearCutData();
			};
			s.afterUpload = function(data){
				if (data.code == BaseData.suc
						&& !data.data[0].error) {
					var url = BaseData.imgUrl + "/" + data.data[0].path + "/" + data.data[0].name;
					$cutSrcImg.attr("src", url);
					$previewImgs.attr("src", url);
					
					if(!jcrop_api) {
						var $pimg = $('#' + s.previewImgs[0]);
						function updatePreview(c){
					    	$cx.val(Math.round(c.x));
							$cy.val(Math.round(c.y));
							$cw.val(Math.round(c.w));
							$ch.val(Math.round(c.h));
					      	if(parseInt(c.w) > 0){
					        	var rx = pcntWidth / c.w;
					        	var ry = pcntHeight / c.h;
					        	$pimg.css({
					          		width: Math.round(rx * boundw) + 'px',
					          		height: Math.round(ry * boundh) + 'px',
					          		marginLeft: '-' + Math.round(rx * c.x) + 'px',
					          		marginTop: '-' + Math.round(ry * c.y) + 'px'
					        	});
					      	}
					    }
					    $("#" + s.cutSrcImg).Jcrop({
					    		boxWidth: 600,
					    		boxHeight:600,
						      	onChange: updatePreview,
						      	onSelect: updatePreview,
						      	aspectRatio: pcntWidth / pcntHeight
						    },function(){
						      	var bounds = this.getBounds();
						      	//图片的原始宽高
						     	boundw = bounds[0];
						      	boundh = bounds[1];
						      	jcrop_api = this;
						      	defaultSelect(jcrop_api, boundw, boundh);
					    });
					}else{
						jcrop_api.setImage(url, function(){
							var bounds = this.getBounds();
					     	boundw = bounds[0];
					      	boundh = bounds[1];
					      	//设置默认选中框位置
							defaultSelect(jcrop_api, boundw, boundh);
						});
					}
					$cutPicBtn.show();
					$cutPicBtn.click();
				}
				if(settings.afterUpload)
					settings.afterUpload(data);
			}
			function clearCutData(){
				$cx.val("");
				$cy.val("");
				$cw.val("");
				$ch.val("");
				$cutPicDiv.html("").hide();
			}
			this.uploadImg(s);
			
			$cutPicBtn.click(function(){
				clearCutData();
				
				$.dialog({
					title: "裁剪图片",
					fixed: true,
					lock: true,
					content: $("#" + s.cutBox),
					ok: function(here){
						var $previewImgsPane = $($("." + s.previewImgsPane)[0]).clone(),
							$previewContainer = $("#" + s.previewImgsContainer[0]);
						$cutPicDiv.html($previewImgsPane.css({top: "0px", left:"0px", right: "0px"})).show();
						$cutPicDiv.css({
							width: $previewContainer.width() 
								+ utils.removeUnit($previewImgsPane.css("padding-left")) 
								+ utils.removeUnit($previewImgsPane.css("padding-right")) 
								+ utils.removeUnit($previewImgsPane.css("border-left-width"))
								+ utils.removeUnit($previewImgsPane.css("border-right-width")), 
							height: $previewContainer.height()
								+ utils.removeUnit($previewImgsPane.css("padding-top")) 
								+ utils.removeUnit($previewImgsPane.css("padding-bottom")) 
								+ utils.removeUnit($previewImgsPane.css("border-top-width"))
								+ utils.removeUnit($previewImgsPane.css("border-bottom-width")),
							position: "relative"
						});
					},
					cancel: function(){
						
					},
					close: s.boxClosed
				});
			});
			
		}else if(s.type == "onePage"){
			var boundw,boundh,jcrop_api;
			s.beforeUpload = function(){
				//隐藏裁剪区域
	    		$cutDivOnePage.hide();
				$cx.val("");
				$cy.val("");
				$cw.val("");
				$ch.val("");
				$cutSrcImg.attr("src", "");
				$previewImgs.attr("src", "");
			};
			s.success = function(data) {
				var self = this,opts = self.options;
				//清空之前的值
				if(opts.picInput)
					$('#'+ opts.picInput).val("");
				//隐藏loading
				if(opts.loading)
					self.loading.hide();
				if (data.code === BaseData.suc) {
					if(data.data[0].error) {
						$.msg("error", data.data[0].error);
						return ;
					}
					var	url = data.data[0].path + "/" + data.data[0].name,
						procUrl = url.replace(new RegExp(BaseData.tmpPath + "/"), "");
					if(opts.picInput)
						$('#'+ opts.picInput).val(procUrl);
					url = BaseData.imgUrl + '/' + url;
					$previewImgs.attr("src", url);
					
					if(opts.imgMaxWidth)
						$cutSrcImg.css("maxWidth", opts.imgMaxWidth);
					if(opts.imgMaxHeight)
						$cutSrcImg.css("maxHeight", opts.imgMaxWidth);
					if(opts.imgWidth)
						$cutSrcImg.width(opts.imgWidth);
					if(opts.imgHeight)
						$cutSrcImg.height(opts.imgHeight);
					
					if(!jcrop_api){
						$cutSrcImg.attr("src", url);
						$cutSrcImg.Jcrop({
								boxWidth: opts.boxWidth,
								boxHeight: opts.boxHeight,
						      	onChange: updatePreview,
						      	onSelect: updatePreview,
						      	aspectRatio: pcntWidth / pcntHeight
						    },function(){
						    	//显示裁剪区域
						    	$cutDivOnePage.show();
						      	var bounds = this.getBounds();
						     	boundw = bounds[0];
						      	boundh = bounds[1];
						      	jcrop_api = this;
						      	//设置默认选中框位置
						      	defaultSelect(jcrop_api, boundw, boundh);
					    });
					}else{
						jcrop_api.setImage(url, function(){
							//显示裁剪区域
							$cutDivOnePage.show();
							var bounds = this.getBounds();
					     	boundw = bounds[0];
					      	boundh = bounds[1];
					      	//设置默认选中框位置
							defaultSelect(jcrop_api, boundw, boundh);
						});
					}
				    
				} else {
					$.msg("error", data.msg ? data.msg : "上传图片失败！");
				}
			}
		    function updatePreview(c){
		    	$cx.val(Math.round(c.x));
				$cy.val(Math.round(c.y));
				$cw.val(Math.round(c.w));
				$ch.val(Math.round(c.h));
		      	if(parseInt(c.w) > 0){
		        	$previewImgs.each(function(i){
		        		var rx = $("#" + s.previewImgsContainer[i]).width() / c.w,
		        			ry = $("#" + s.previewImgsContainer[i]).height() / c.h;
		        		$(this).css({
			          		width: Math.round(rx * boundw) + 'px',
			          		height: Math.round(ry * boundh) + 'px',
			          		marginLeft: '-' + Math.round(rx * c.x) + 'px',
			          		marginTop: '-' + Math.round(ry * c.y) + 'px'
			        	});
		        	});
		      	}
		    }
			this.uploadImg(s);
		}
		return this;
	};
	
})(jQuery);

