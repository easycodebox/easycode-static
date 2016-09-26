/**
 * @author WangXiaoJin
 * 
 */
(function ($) {

    function init(target) {
        var options = target.UI_page("options");
        if (options.waterfall || options.partSize && options.partSize < options.pageSize) {
            //添加瀑布流的加载项
            options.loadingObj = $('<div class="load-div page-loading"></div>');
            target.html(options.loadingObj);
            if (options.waterfall) {
                options.partSize = null;
                options.partIndex = null;
            } else {
                options.partIndex = 1;
            }
        } else {
            options.partSize = null;
            options.partIndex = null;
        }
        target.UI_page("loadDate");
    }
    //oldScrollJq 上一次调用UI_page分页时传递的scrollJq对象
    function bindEvent(target, oldScrollJq) {
        var options = target.UI_page("options");
        if (options.waterfall || options.partSize) {
            if (oldScrollJq && oldScrollJq.get(0) != options.scrollJq.get(0)) {
            	//如果两次调用传递的参数不一样则卸载之前绑定的事件
                oldScrollJq.off("scroll.page");
            }
            if (!oldScrollJq || oldScrollJq.get(0) != options.scrollJq.get(0)) {
                options.scrollJq.on("scroll.page", function () {
                    if (options.isLoading
	    					|| !options.hasMore
	    					|| target.css("display") === "none") return;
                    var pagerDivTop = target.offset().top,
                        showHeight = options.scrollJq.outerHeight() 
                            + (options.scrollJq.get(0).document ? options.scrollJq.scrollTop() : options.scrollJq.offset().top);
                    if (showHeight >= pagerDivTop) {
                        if (options.partIndex) {
                            //如果是分流式加载则partIndex自增
                            options.partIndex += 1;
                        } else {
                            //瀑布流则pageNo自增
                            options.pageNo += 1;
                        }
                        target.UI_page("loadDate");
                    }
                });
            }
        }
        if (oldScrollJq) {
            //如果oldScrollJq有值，则直接跳过下面的绑定事件，因为已经绑定过
            return;
        }
        if (options.lazyload) {
            utils.lazyload();
        }
        target.on("click.page", "a", function (e) {
            var pageNo = utils.parseInt($(this).attr("cur-page"));
            if (pageNo && pageNo > 0) {
                options.pageNo = pageNo;
                target.UI_page("clear", options);
                target.UI_page("loadDate");
                if (options.pageScrollTop) {
                    $("html,body").animate({
                        scrollTop: options.pageScrollTop
                    }, 100);
                }
            }
        });
    }
    $.fn.UI_page = function (options, param) {
        if (typeof options == "string") {
            var method = $.fn.UI_page.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = $.extend({}, $.fn.UI_page.defaults, options);
        options.scrollJq = options.scrollJq || $(window);
        return this.each(function () {
            var $this = $(this),
                data = $this.data("ui-page");
            if (data) {
                var oldScrollJq = data.options.scrollJq;
                $.extend(data.options, options);
                init($this);
                bindEvent($this, oldScrollJq);
            } else {
                data = $this.data("ui-page", { options: options });
                init($this);
                bindEvent($this);
            }
        });
    };
    $.fn.UI_page.methods = {
        options: function (jq) {
            return jq.data("ui-page").options;
        },
        destroy: function (jq) {
            return jq.each(function () {
                $(this).removeData("ui-page").empty();
            });
        },
        loadDate: function (jq) {
            return jq.each(function () {
                var self = this,
                    $self = $(self),
					options = $self.UI_page("options"),
					params = params || {};
                if (options.isLoading == true)
                    return;
                else
                    options.isLoading = true;
                if (options.loadingObj)
                    options.loadingObj.show();
                if (options.params) {
                    if (utils.isFunction(options.params))
                        params = options.params.call(self);
                    else
                        params = options.params;
                }
                params.pageNo = options.pageNo;
                params.pageSize = options.pageSize;
                if (options.partSize) {
                    params.partIndex = options.partIndex;
                    params.partSize = options.partSize;
                }
                if (options.data) {
                    //本地数据分页
                    options.totalCount = options.data.length;
                    var pageData = [],
						pageStart = options.pageSize * (options.pageNo - 1);
                    if (options.waterfall) {
                        pageData = options.data.slice(pageStart, pageStart + options.pageSize);
                        if (options.totalCount <= options.pageSize * options.pageNo) {
                            options.hasMore = false;
                        }
                    } else if (options.partSize) {
                        var showStart = pageStart + (options.partIndex - 1) * options.partSize,
			            	showTotal = showStart + options.partSize;
                        pageData = options.data.slice(showStart, showTotal);
                        if (options.pageSize <= options.partIndex * options.partSize
							|| options.totalCount <= showTotal) {
                            options.hasMore = false;
                            $self.UI_page("fix");
                        }
                    } else {
                        pageData = options.data.slice(pageStart, pageStart + options.pageSize);
                        $self.UI_page("fix");
                    }
                    if (options.loadingObj)
                        options.loadingObj.hide();
                    if (utils.isFunction(options.suc))
                        options.suc.call(self, pageData, options);
                    if (utils.isFunction(options.success))
                        options.success.call(self, pageData, options);
                    if (options.lazyload) {
                        options.scrollJq.scroll();
                    }
                    options.isLoading = false;
                } else {
                    //ajax请求分页 
                    $.ajax({
                        url: options.url,
                        data: params,
                        type: "POST",
                        success: function (data, textStatus, jqXHR) {
                            data = data == null ? [] : data;
                            /**
	                         *  data返回数据格式
	                         *  1、{code: code, msg: msg, data: {totalCount: totalCount, data: []}}
	                         *  2、{code: code, msg: msg, data: {data: []}}
	                         *  3、{code: code, msg: msg, data: []}
	                         *  4、[]
	                         */
                            if (!utils.isObject(data)
	                                || !data[BaseData.code]
	                                || data[BaseData.code] == BaseData.suc) {
                                var list = utils.isArray(data) ? data : !data[BaseData.data] ? [] : utils.isArray(data[BaseData.data])
	                                    ? data[BaseData.data] : !data[BaseData.data].data ? [] : utils.isArray(data[BaseData.data].data)
	                                    ? data[BaseData.data].data : [data[BaseData.data].data];
                                if (data[BaseData.data] && data[BaseData.data].totalCount) {
                                    options.totalCount = data[BaseData.data].totalCount;
                                } else {
                                    options.totalCount = null;
                                }
                                if (options.waterfall) {
                                    if (list.length == 0 || list.length < options.pageSize
	                                    || options.totalCount && options.totalCount == options.pageSize * options.pageNo) {
                                        options.hasMore = false;
                                    }
                                } else if (options.partSize) {
                                    var showTotal = (options.pageNo - 1) * options.pageSize
											+ options.partIndex * options.partSize;
                                    if (options.pageSize <= options.partIndex * options.partSize
										|| options.totalCount <= showTotal) {
                                        options.hasMore = false;
                                        $self.UI_page("fix");
                                    }
                                } else {
                                    $self.UI_page("fix");
                                }
                                if (utils.isFunction(options.suc))
                                    options.suc.call(self, data, options, textStatus, jqXHR);
                            }
                            if (options.loadingObj)
                                options.loadingObj.hide();
                            if (utils.isFunction(options.success))
                                options.success.call(self, data, options, textStatus, jqXHR);
                            if (options.lazyload) {
                                options.scrollJq.scroll();
                            }
                            options.isLoading = false;
                        }
                    });
                }

            });
        },
        clear: function (jq, options) {
            return jq.each(function () {
                $(this).children(".page-group").remove();
                if (options.partSize)
                    options.partIndex = 1;
                options.hasMore = true;
            });
        },
        fix: function (jq) {
            return jq.each(function () {
                var s = $(this).UI_page("options"), str = "";
                if (s.totalCount && s.totalCount > 0 && s.pageSize && s.pageSize > 0) {
                    if (s.totalCount % s.pageSize == 0) {
                        s.totalPage = s.totalCount / s.pageSize;
                    } else {
                        s.totalPage = parseInt(s.totalCount / s.pageSize) + 1;
                    }
                    str += "<ol class='page-group " + s.cssClass + "' " + (s.id ? "id='" + s.id + "'" : "") + " >";
                    //第一页
                    str += "<li><a href='javascript:' cur-page='1' >" + s.firstPage + "</a></li>";
                    //上一页
                    if (s.pageNo < 2) {
                        str += "<li class='disabled'><a href='javascript:'>" + s.prePage + "</a></li>";
                    } else {
                        str += "<li><a href='javascript:' cur-page='" + (s.pageNo - 1) + "' >" + s.prePage + "</a></li>";
                    }
                    if (s.totalPage <= s.showPageNumber) {
                        //页码
                        for (var i = 1; i <= s.totalPage; i++) {
                            var current = "";
                            if (i == s.pageNo) {
                                current = " class='current' ";
                            }
                            str += "<li" + current + "><a href='javascript:' cur-page='" + i + "'>" + i + "</a></li>";
                        }
                    } else {
                        var preHalf = parseInt(s.showPageNumber / 2),
							sufHalf = s.showPageNumber % 2 == 0 ? preHalf - 1 : preHalf,
							start, end;
                        if (s.pageNo - preHalf < 1) {
                            start = 1;
                            end = s.showPageNumber;
                        } else {
                            if (s.pageNo + sufHalf > s.totalPage) {
                                start = s.totalPage - s.showPageNumber + 1;
                                end = s.totalPage;
                            } else {
                                start = s.pageNo - preHalf;
                                end = s.pageNo + sufHalf;
                            }
                        }
                        //判断页码前需不需要增加（...）
                        if (start > 1) {
                            str += "<li>" + s.preOmit + "</li>";
                        }
                        //页码
                        for (var i = start; i <= end; i++) {
                            var current = "";
                            if (i == s.pageNo) {
                                current = " class='current' ";
                            }
                            str += "<li" + current + "><a href='javascript:' cur-page='" + i + "'>" + i + "</a></li>";
                        }
                        //判断页码后需不需要增加（...）
                        if (end < s.totalPage) {
                            str += "<li>" + s.sufOmit + "</li>";
                        }
                    }
                    //下一页
                    if (s.pageNo + 1 > s.totalPage) {
                        str += "<li class='disabled'><a href='javascript:'>" + s.nextPage + "</a></li>";
                    } else {
                        str += "<li><a href='javascript:' cur-page='" + (s.pageNo + 1) + "' >" + s.nextPage + "</a></li>";
                    }
                    //最后页
                    str += "<li><a href='javascript:' cur-page='" + s.totalPage + "' >" + s.endPage + "</a></li>";

                }
                $(this).append(str);
            });
        }
    };
    $.fn.UI_page.defaults = {
        id: null,
        cssClass: "pagnation",  //生成的分页标签class属性值
        lazyload: false,   //当显示的列表有图片时，建议使用懒加载
        data: null,			//分页的数据（数组值），当此参数有值时忽略url参数，既不会发送请求到服务器取数据
        url: null,
        params: null,		//请求传递的参数，可以是js对象或者函数
        pageSize: null,	    //一页显示的个数（必须传值）
        waterfall: false,   //是否已瀑布流的方式分页
        partSize: null,     //每次请求多少数据。当waterfall=true时忽略此参数。当partPageSize不为null且小于pageSize时，则分流式分页
        showPageNumber: 5,	//显示的页面数量
        pageScrollTop: null, //当切换页码时，页面要滑动到pageScrollTop指定的高度显示数据
        scrollJq: null,    	//绑定监听scroll事件的对象,不填默认是$(window) 
        preOmit: "<span>...</span>",
        sufOmit: "<span>...</span>",
        firstPage: "第一页",
        endPage: "最后页",
        prePage: "上一页",
        nextPage: "下一页",
        totalCount: null,	//记录的总数
        pageNo: 1,	        //当前页码
        partIndex: null,	//分流式分页的索引值 即指定页码第几次分流
        totalPage: null,	//不需要传值
        isLoading: false,  //判断当前页面是否正在加载数据，正在加载时不能请求数据
        loadingObj: null,  //加载数据时显示的加载项，不需要传值
        hasMore: true,     //瀑布流或分流式分页用此参数表名是否还有下一次瀑布产生
        suc: function (data, options, textStatus, jqXHR) {
            //只有请求返回成功才会执行此函数，成功的范畴为code为空或等于BaseData.suc
            /**
             *  data返回数据格式
             *  1、{code: code, msg: msg, data: {totalCount: totalCount, data: []}}
             *  2、{code: code, msg: msg, data: {data: []}}
             *  3、{code: code, msg: msg, data: []}
             *  4、[]
             */
        },
        success: function (data, options, textStatus, jqXHR) {
            //不管请求成功或失败都会执行此函数
            /**
             *  data返回数据格式
             *  1、{code: code, msg: msg, data: {totalCount: totalCount, data: []}}
             *  2、{code: code, msg: msg, data: {data: []}}
             *  3、{code: code, msg: msg, data: []}
             *  4、[]
             */
        }
    };
})(jQuery);

