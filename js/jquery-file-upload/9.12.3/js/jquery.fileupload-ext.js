/**
 * jquery-file-upload的自定义配置
 * @author WangXiaoJin
 */
;(function ($) {
    'use strict';
    
    $.widget('blueimp.fileupload', $.blueimp.fileupload, {
	    options: {
	    	getFilesFromResponse: function (data) {
    			var data;
    			if (utils.isString(data.result)) {
    				try {
						data = JSON.parse(data.result);
					} catch (e) {
						
					}
    			} else {
    				data = data.result;
    			}
    			if (data && (data.code == null || data.code === BaseData.suc)) {
    				return data.data;
    			}
    			return [];
    	    },
    	    sucTips: false,		//不提示成功信息
	    	exeFail: false,		//返回fail的code信息时，不执行fail函数，因为会与fileupload的fail函数冲突
	    	dataType: "json"
	    }
	});
    
} (jQuery));
