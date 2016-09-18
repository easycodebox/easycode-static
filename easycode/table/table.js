/**
 * @author WangXiaoJin
 */
;(function($){
	
	/**
	 * class="th-row"		:	表头
	 * fixed="true" 		: 	表格宽度固定
	 * field="name" 		: 	获取的数据用到的KEY值
	 * no-tip="true"		: 	对应的td不会生成title的提示信息
	 * checkbox="true"		:	选择框checkbox，默认会加上fixed="true" no-tip="true"
	 * row-no="true"		:	行号，默认会加上fixed="true" no-tip="true"
	 * check-row="true"		: 	点击此列时会选中对应的行
	 * sort="true"			：	表示该列可排序，可以使sort="true"，sort="asc"，sort="desc"
	 * sorter="compare"		:	排序时会调用compare函数进行比较，有此属性可以省略写sort属性。函数规则function compare(self, other){return 1;}，return -1则self < other , return 0则self = other , return 1则self > other 
	 * sorting="sortingFun"	:	排序执行的函数，有此属性可以省略写sort属性。sortingFun = function(fieldName, order, sorter) {}
	 * <table>
			<tr class="th-row">
				<th width="30" checkbox="true"></th>
				<th width="40" row-no="true">序号</th>
				<th width="100" sort="true">名称</th>
				<th width="100" check-row="true">密钥</th>
				<th width="300">网址</th>
				<th width="80">初始化</th>
				<th width="200">创建时间</th>
				<th width="80"  no-tip="true">启动/禁用</th>
				<th width="100" no-tip="true">操作</th>
			</tr>
			<tr trid="11">
				<td><input type="checkbox" value="a17mi" name="ids"></td>
				<td>xxx</td>
			</tr>
		</table>
	 * 
	 */
	
	var defaults = {
			thRowClass	: "th-row",	//表头行
			tip			: true, //显示tip信息
			tableHeight	: null,	//表格高度
			tableWidth	: null,	//表格宽度
			minColumnWidth: 60, //最小列宽（包含padding和border）, 除checkbox="true"，row-no="true"
			resizeHeader: true,	//表头宽度可调节, 需要用到resizable.js插件
			resizeData	: false, //注意：此属性开启会影响性能。调整表格数据宽度, 需要用到resizable.js插件
			septal		: true,	//表格显示间隔色
			rowHover	: true, //鼠标在表格row上显示颜色
			thHover		: true, //鼠标在表格th上显示颜色
			noData		: "暂无数据",//没有数据列时显示的内容
			rowCheckedColor	: true,	//当选择行时，指定行增加背景色
			fillWidth	: false, //表格初宽度依据父级元素	
			fillHeight	: false //表格初高度依据父级元素	
		},
		//两个列值相比较
		compare = utils.compare,
		/**
		 * 排序执行的函数
		 * @param fieldName 字段名
		 * @param order	排序方式 asc、desc
		 * @param sorter 比较大小函数
		 */
		sortingFun = function(fieldName, order, sorter) {
			var $table = $(this).closest(".main-table-div").find(".data-table"),
				$cols = $.UI_table.getTdColumns($table, fieldName);
			for(var i = 0; i < $cols.length; i++) {
				var $col = null;
				for(var j = i + 1; j < $cols.length; j++) {
					var ival = $.UI_table.getVal($($cols[i])),
						jval = $.UI_table.getVal($($cols[j]));
					if(order == "asc" && sorter.call($cols[i], ival, jval, $($cols[j])) > 0
							|| order == "desc" && sorter.call($cols[i], ival, jval, $($cols[j])) < 0) {
						$col = $($cols[j]);
						
						var tmp = $cols[i];
						$cols[i] = $cols[j];
						$cols[j] = tmp;
					}
				}
				if($col)
					$table.find("tr.td-row:eq({0})".format(i)).before($col.closest("tr.td-row"));
			}
			//表格显示间隔色
			septal($table.find("tr.td-row"));
			//重新排列序号
			$.UI_table.resortRowNo($table);
		};
	
	$.fn.UI_table = function(options) {
		if(this[0] === undefined || !this.is("table")) return false;
		var opts = $.extend({}, defaults, options);
		this.each(function(){
			//给table的th、td加上包裹层cellHtml
			var $tableThis = $(this),
				refactor = refacte($tableThis.html(), opts),
				$tableThis = $tableThis.html(refactor.html),
				$headTableDiv = $('<div class="header-table-div">' + utils.domShuck($tableThis, "id", {"class": "header-table"}) + '</div>'),
				$headerTable = $headTableDiv.children(),
				$dataTableDiv = $tableThis.addClass("data-table").wrap('<div class="main-table-div"><div class="data-table-div"></div></div>').parent(),
				$main = $dataTableDiv.parent(),
				$thRow = $tableThis.find("." + opts.thRowClass),
				$ths = $headerTable.append($thRow).find("th, td"),
				$dataTableTrs = $tableThis.find("tr"),
				data = {
					data: refactor.data,	//表格数据
					checkbox: false,
					checkRow: false,	//th中有check-row属性
					rowNo: false,
					options: opts,
					colOpts: {},	//表格每列的特性: {phone: {fixed: true, no-tip: true}, icon: {...}}
					headerTable: $headerTable,
					thFillWidths: {},	//$th.outerWidth() - $th.width()
					tdFillWidth: null,//$td.outerWidth() - $td.width()	
					thCell:{},		//缓存列的键值对
					tdCells: {}		//缓存列的键值对
				},
				thRowEvents = {},		//给thRow绑定事件MAP
				dataTableEvents = {}	//数据表格绑定的事件Map
				;
			$dataTableDiv.before($headTableDiv);
			//隐藏表格数据
			$tableThis.hide();
			if($dataTableTrs.length > 0) {
				for(var i = 0; i < $dataTableTrs.length; i++) {
					var $this = $($dataTableTrs.get(i)),
						classes = "td-row";
					//表格间隔色
					if(i%2 == 1)
						classes += " septal-color";
					$this.addClass(classes);
				}
			}else {
				//表格没有数据
				$tableThis.append('<tr class="td-row no-data-row"><td class="no-data-td" title="{0}">{0}</td></tr>'.format(opts.noData));
			}
			//缓存数据
			$tableThis.data("data", data);
			
			$ths.each(function(i){
				var $thThis = $(this),
					thWidth = $thThis.attr("width") ? $thThis.attr("width") : $thThis.width(),
					fieldName = $thThis.attr("field"),
					fixed = $thThis.attr("fixed") === "true" ? true : false,
					noTip = opts.tip ? $thThis.attr("no-tip") === "true" ? true : false : true,		
					checkbox = $thThis.attr("checkbox") === "true" ? true : false,
					sorter = $thThis.attr("sorter"),
					sorting = $thThis.attr("sorting"),
					sort = ( ((sort = $thThis.attr("sort")) !== undefined && sort != "asc" && sort != "desc") || (sort === undefined && (sorter !== undefined || sorting !== undefined)) ) ? "both" : sort,
					checkRow = $thThis.attr("check-row") === "true" ? true : false,
					rowNo = $thThis.attr("row-no") === "true" ? true : false,
					addThClasses = "table-th",	//th增加的class
					addThAttr = {},				//th增加的属性
					addTdClasses = "table-td",	//td增加的class
					addTdAttr = {},				//td增加的属性
					$tds = $tableThis.find("th[field={0}], td[field={0}]".format(fieldName));
				
				//缓存列数据
				data.thCell[fieldName] = $thThis.children();
				data.tdCells[fieldName] = $tds.children();
				data.colOpts[fieldName] = {
						fixed: fixed,
						noTip: noTip,
						checkRow: checkRow
				};
				
				//分析sort属性
				if(sort) {
					data.colOpts[fieldName].sort = true;
					addThClasses += " sort-th";
					if(sort == "both") {
						addThClasses += " sort-both";
					}else if(sort == "asc") {
						addThClasses += " sort-asc";
					}else if(sort == "desc") {
						addThClasses += " sort-desc";
					}
					$thThis.on("click.table-ui", function(){
						var $this = $(this),
							order = $this.hasClass("sort-asc") ? "asc" : $this.hasClass("sort-desc") ? "desc" : "both";
						if(order == "both" || order == "desc") {
							order = "asc";
							$this.removeClass("sort-both sort-desc").addClass("sort-asc");
						}else {
							order = "desc";
							$this.removeClass("sort-both sort-asc").addClass("sort-desc");
						}
						(utils.ognl(window, sorting) || sortingFun).call(this, fieldName, order, utils.ognl(window, sorter) || compare);
					});
				}else {
					data.colOpts[fieldName].sort = false;
				}
				//判断TD,TH是否有fixed=true,no-tip=true 如果没有则添加
				if(checkbox || rowNo) {
					if(rowNo) {
						data.rowNo = true;
						addTdClasses += " row-no";
					}
					if(!fixed) {
						fixed = true;
						addThAttr.fixed = "true";
					}
					if(!noTip) {
						noTip = true;
						addThAttr["no-tip"] = "true";
					}
				}
				//判断是否为checkbox列
				if(checkbox) {
					data.checkbox = true;
					//全选的checkbox
					var $checkbox = $('<input type="checkbox" class="table-checkbox-th" />'),
						$validBoxs = $.UI_table.getCells($tableThis, fieldName).find("input:checkbox");
					$thThis.children().html($checkbox);
					$validBoxs.addClass("table-checkbox-td");
					//点击全选框事件
					$checkbox.on("click.table-ui", function(){
						var $disables = $validBoxs.filter(":disabled"),
							$ables = null;
						if($disables.length > 0) {
							//如果有失效的checkbox，则分批处理
							$ables = $validBoxs.not(":disabled");
							checkRowFun($disables, $disables.closest("tr.td-row"), data, false);
						}
						if($ables)
							checkRowFun($ables, $ables.closest("tr.td-row"), data, $(this).prop("checked"));
						else
							checkRowFun($validBoxs, $validBoxs.closest("tr.td-row"), data, $(this).prop("checked"));
					});
				}
				
				//th是否有check-row属性
				data.checkRow = checkRow ? true : data.checkRow;
				
				//th增加class和属性
				$thThis.addClass(addThClasses).attr(addThAttr);
				
				$tds.addClass(addTdClasses).attr(addTdAttr);
				
				//设置表格列表宽度
				data.thFillWidths[fieldName] = $thThis.outerWidth() - $thThis.width();
				data.tdFillWidth = data.tdFillWidth ? data.tdFillWidth : $tds.outerWidth() - $tds.width();
				$tds.add($thThis).width("auto");
				data.thCell[fieldName].width(thWidth - data.thFillWidths[fieldName]);
				data.tdCells[fieldName].width(thWidth - data.tdFillWidth);
				
			});
			//设置表格大小
			/*setTimeout(function(){
				var tabWid = $headerTable.width(),
				outWidth = $headerTable.outerWidth(true);
				$headerTable.width(tabWid);
				$tableThis.width(tabWid);
				$headTableDiv.width(outWidth);
				$dataTableDiv.width(outWidth);
				$main.width(outWidth);
			}, 0);*/
			
			/**
			 * 绑定事件
			 */
			//绑定列宽resize事件
			if(opts.resizeHeader || opts.resizeData) {
				var $tagets = opts.resizeHeader ? $ths.filter("[fixed!=true]") : undefined,
					$line = $('<div class="column-move-line"></div>');
				$tagets = opts.resizeData ? utils.$add($tableThis.find(".table-td[fixed!=true]"), $tagets) : $tagets;
				$tagets.UI_resizable({
					handles: "e",
					minWidth: opts.minColumnWidth,
					edge: 8,
					onStartResize: function(e) {
						data.resizing = true;
						$line.css("display", "none");
						$main.append($line);
						$line.css({left:e.pageX - $main.offset().left,display:"block"});
					},
					onResize: function(e){
						$line.css({left:e.pageX - $main.offset().left,display:"block"});
						return false;
					},
					onStopResize: function(e) {
						
						$line.remove();
						var $this = $(this),
							eventData = e.data,
							field = $this.attr("field"),
							$th = $.UI_table.getThColumn($tableThis, field),
							$preMovable = $th.prevAll("[fixed!=true]"),
							$nextMovable = $th.nextAll("[fixed!=true]"),
							$validThs = $preMovable.add($nextMovable),
							$fixThs = $th.siblings("[fixed=true]");
						//验证拉伸后列宽的值
						var width = eventData.startWidth + e.pageX - eventData.startX,
							fixTotalWidth = 0;	
						$fixThs.each(function(){
							//计算固定列宽的总和
							fixTotalWidth += $(this).outerWidth();
						});
						if($validThs.length > 0) {
							//当可调节宽度的列超过1个时，才会显示调节后的效果
							width = Math.min(
									Math.max(width, utils.val(opts.minColumnWidth)),
									$headerTable.width() - fixTotalWidth - opts.minColumnWidth * $validThs.length
							);
						}else {
							width = eventData.startWidth;
						}
						eventData.width = width;
						if(width == eventData.startWidth) {
							data.resizing = false;
							return;
						}
						
						//设置同一列的宽度
						$this.width("auto");
						$.UI_table.getThCell($tableThis, field).width(eventData.width - data.thFillWidths[field]);
						$.UI_table.getTdCells($tableThis, field).width(eventData.width - data.tdFillWidth);
						//设置其他列的宽度
						calRound($tableThis, $preMovable, $nextMovable, opts, eventData.startWidth - eventData.width);
						data.resizing = false;
						
					}
				});
			}
			
			/************************************  表头行绑定的时间  ******************************************************/
			//鼠标在表格th上显示颜色
			if(opts.thHover) {
				thRowEvents["mouseenter.table-ui"] = function() {
					if(!data.resizing)
						$(this).addClass("th-hover");
				};
				thRowEvents["mouseleave.table-ui"] = function() {
					$(this).removeClass("th-hover");
				};
			}
			
			/************************************  数据表格绑定事件  ******************************************************/
			//鼠标在表格row上显示颜色
			if(opts.rowHover) {
				dataTableEvents["mouseenter.table-ui"] = function() {
					if(!data.resizing)
						$(this).closest("tr").addClass("tr-hover");
				};
				dataTableEvents["mouseleave.table-ui"] = function() {
					$(this).closest("tr").removeClass("tr-hover");
				};
			}
			//绑定click事件
			if(data.checkbox || data.checkRow) {
				dataTableEvents["click.table-ui"] = function(e) {
					var $target = $(e.target),
						$this = $(this),
						$th = $.UI_table.getThColumn($tableThis, $this.attr("field"));
					if(data.checkRow && $th.is("[check-row=true]")) {
						var $checkRow = $this.closest("tr.td-row"),
							$checkbox = $checkRow.find("input.table-checkbox-td");
						checkRowFun($checkbox, $checkRow, data);
					}else if(data.checkbox && $this.find("input.table-checkbox-td").length > 0) {
						if($target.is(".table-checkbox-td")) {
							checkRowFun($target, $this.closest("tr.td-row"), data, $target.prop("checked"));
						}else {
							checkRowFun($this.find("input.table-checkbox-td"), $this.closest("tr.td-row"), data);
						}
					}
				};
			}
			
			$thRow.on(thRowEvents, "th, td");
			$tableThis.on(dataTableEvents, "th, td");
			
			//重设表格大小
			if(opts.fillWidth || opts.fillHeight) {
				var $prt = $main.parent();
				opts.tableWidth = opts.fillWidth ? $prt.width() : opts.tableWidth;
				opts.tableHeight = opts.fillHeight ? $prt.height() : opts.tableHeight;
			}
			$.UI_table.resize($tableThis, opts.tableWidth, opts.tableHeight);
			//显示表格数据
			$tableThis.show();
			$.UI_table.tables.push($tableThis);
		});
		return this;
	};
	
	/**
	 * 重构table结构，获取表格数据
	 */
	function refacte(tbHtml, opts) {
		var trPatt = new RegExp("<\\s*tr\\s*([^>]*)\\s*>([\\s\\S]*?)<\\s*/\\s*tr\\s*>", "ig"),
			tdPatt = new RegExp("\\s*<\\s*(t[hd])\\s*([^>]*)\\s*>([\\s\\S]*?)<\\s*/\\s*\\1\\s*>\\s*", "ig"),
			begin = 0,
			assemble = "",
			data = {},
			fields = [],	//列的属性名
			noTips = [],	//列的属性名
			res;
		//去掉html的注释
		tbHtml = tbHtml ? tbHtml.replace(new RegExp("<!--([\\s\\S]*?)-->", "g"), "") : tbHtml;
		
		for(var i = 0; (res = trPatt.exec(tbHtml)) != null; i++) {
			var resTmp,
				trid = i > 0 ? utils.htmlAttrVal(res[1], "trid") : null;
			assemble += tbHtml.substring(begin, res.index) 
					+ "<tr " + res[1]
					+ (i === 0 || trid ? '' : ' trid="' + (trid = 'tr-id-' + (i - 1)) + '"')
					+ " >";
			if(i > 0)
				data[trid] = {};
			for(var j = 0; (resTmp = tdPatt.exec(res[2])) != null; j++) {
				if(i == 0) {
					//表头
					var field = utils.htmlAttrVal(resTmp[2], "field"),
						noTip =  utils.htmlAttrVal(resTmp[2], "no-tip") === "true" ? true : false,
						checkbox = utils.htmlAttrVal(resTmp[2], "checkbox") === "true" ? true : false,
						rowNo = utils.htmlAttrVal(resTmp[2], "row-no") === "true" ? true : false;
					fields.push(field ? field : 'field' + j);
					noTips.push(checkbox || rowNo ? true : noTip);
				}else
					data[trid][fields[j]] = resTmp[3];
				assemble += '<' + resTmp[1] + ' ' + resTmp[2] 
						+ ' field="' + fields[j] + '"' 
						+ (resTmp[2].indexOf("title") < 0 && opts.tip && !noTips[j] ? ' title="' + resTmp[3] + '"' : '')
						+ '><div class="table-cell">' + resTmp[3] + '</div></' + resTmp[1] + '>';
			}
			assemble += "</tr>";
			begin = trPatt.lastIndex;
		}
		assemble += tbHtml.substring(begin);
		return {html: assemble, data: data};
	}
	
	function valid($table) {
		return $table ? $table.filter(".data-table") : $table;
	}
	
	function getMainTableDiv($table) {
		return $table ? $table.closest(".main-table-div") : undefined;
	}
	
	//勾选指定行,val没指定则各自的checkbox反向勾选
	function checkRowFun($checkboxs, $trs, data, val) {
		if($checkboxs.length == 0) return;
		if($checkboxs.is(":disabled"))
			val = false;
		function logic($check, $tr, showVal) {
			$check.prop("checked", showVal);
			if(showVal) {
				if(data.options.rowCheckedColor) {
					$tr.addClass("checked-row");
				}
				//判断有没有全选
				var fieldName = $($checkboxs[0]).closest(".table-td").attr("field"),
					isCheckedAll = true;
				for(var i = 0; i < data.tdCells[fieldName].length; i++) {
					var $obj = $(data.tdCells[fieldName][i]).children();
					if($obj.is(":enabled:not(:checked)")) {
						isCheckedAll = false;
						break;
					}
				}
				if(isCheckedAll) {
					data.checkedAll = true;
					//全选按钮选中
					data.headerTable.find(".table-checkbox-th").prop("checked", true);
				}
			}else {
				if(data.options.rowCheckedColor) {
					$tr.removeClass("checked-row");
				}
				if(data.checkedAll) {
					//全选按钮取消
					data.headerTable.find(".table-checkbox-th").prop("checked", false);
				}
			}
		}
		if(val === undefined || val === null) {
			$checkboxs.each(function(i){
				logic($(this), $($trs.get(i)), !$(this).prop("checked"));
			});
		}else {
			logic($checkboxs, $trs, val);
		}
	}
	//表格间隔色
	function septal($dataTrs) {
		for(var i = 0; i < $dataTrs.length; i++) {
			var $this = $($dataTrs.get(i));
			$this.removeClass("septal-color");
			if(i%2 == 1)
				$this.addClass("septal-color");
		}
	}
	
	/**
	 * 只重新计算周围的列宽
	 * @param size > 0 其他列需要增加值，反之减少值
	 */
	function calRound($table, $preMovable, $nextMovable, opts, size) {
		if(!size) return;
		var data = $table.data("data"),
			index = 0;
		function next() {
			var i = index++;
			if($nextMovable && $nextMovable.length > 0) {
				if($nextMovable.length > i) {
					return $nextMovable[i];
				}else {
					i = i - $nextMovable.length;
				}
			}
			return $preMovable[i];
		}
		if(size > 0) {
			var $obj = $(next()),
				field= $obj.attr("field"),
				$thCell = $.UI_table.getThCell($table, field),
				$tdCells = $.UI_table.getTdCells($table, field);
			$thCell.width($thCell.width() + size);
			$tdCells.width($tdCells.width() + size);
		}else {
			do {
				var $obj = $(next()),
					field = $obj.attr("field"),
					objWidth = $obj.width() + data.thFillWidths[field],
					newWidth;
				if(objWidth + size < opts.minColumnWidth) {
					newWidth = opts.minColumnWidth;
					size += objWidth - opts.minColumnWidth;
				}else {
					newWidth = objWidth + size;
					size = 0;
				}
				$.UI_table.getThCell($table, field).width(newWidth - data.thFillWidths[field]);
				$.UI_table.getTdCells($table, field).width(newWidth - data.tdFillWidth);
			}while(size < 0);
		}
	}
	
	/**
	 * 重新计算表格所有的宽度，size会平分到所有可变列
	 * @param $ths 所有可以移动的列
	 */
	function calAll($table, $ths, opts, size) {
		var data = $table.data("data"),
			debtSize = 0,
			rich = [],
			avg = size/$ths.length,
			avgs = [],	//平均伸缩的大小
			tmpAvg = 0,
			allGtZero = true;	//所有需要增加的平均值是否都大于0
		//设置每列伸缩的大小
		for(var i = 0; i < $ths.length; i++) {
			if(utils.isInt(avg)) {
				allGtZero = avg < 0 ? false : allGtZero;
				avgs.push(avg);
			}else {
				var tmp = 0;
				if(i == $ths.length - 1) {
					tmp = size - tmpAvg;
				}else {
					tmp = utils.parseInt(avg) + (i%2 == 0 ? 1 : 0);
					tmpAvg += tmp;
				}
				allGtZero = tmp < 0 ? false : allGtZero;
				avgs.push(tmp);
			}
		}
		
		for(var i = $ths.length - 1; i > -1; i--) {
			var $obj = $($ths.get(i)),
				field = $obj.attr("field"),
				w = $obj.width() + data.thFillWidths[field],
				nw = w + avgs[i];
			if(!allGtZero) {
				if(nw < opts.minColumnWidth) {
					debtSize += opts.minColumnWidth - nw;
					nw = opts.minColumnWidth;
				}else if(nw - debtSize < opts.minColumnWidth) {
					debtSize -= nw - opts.minColumnWidth;
					nw = opts.minColumnWidth;
				}else {
					rich.push({
						index: i,
						width: w,
						field: field
					});
					continue;
				}
			}
			$.UI_table.getThCell($table, field).width(nw - data.thFillWidths[field]);
			$.UI_table.getTdCells($table, field).width(nw - data.tdFillWidth);
		}
		for(var j = 0; j < rich.length; j++) {
			var obj = rich[j],
				nw = obj.width + avgs[obj.index],
				over = nw - debtSize;
			if(over >= opts.minColumnWidth) {
				debtSize = 0;
				$.UI_table.getThCell($table, obj.field).width(over - data.thFillWidths[field]);
				$.UI_table.getTdCells($table, obj.field).width(over - data.tdFillWidth);
			}else {
				debtSize -= nw - opts.minColumnWidth;
				$.UI_table.getThCell($table, obj.field).width(opts.minColumnWidth - data.thFillWidths[field]);
				$.UI_table.getTdCells($table, obj.field).width(opts.minColumnWidth - data.tdFillWidth);
			}
		}
	}
	
	$.UI_table = {
		tables: [],
		options: function($table) {
			$table = valid($table);
			return $table.length > 0 ? $table.data("data").options : undefined;
		},
		headerTable: function($table) {
			$table = valid($table);
			return $table.length > 0 ? $table.data("data").headerTable : undefined;
		},
		resortRowNo: function($tables) {
			$tables = $tables || $.UI_table.tables;
			$tables = utils.isArray($tables) ? $tables : [$tables];
			for(var i = 0; i < $tables.length; i++) {
				var $t = valid($tables[i]);
				if(!$t) continue;
				var data = $t.data("data");
				//重新排序
				if(data.rowNo) {
					$t.find(".row-no").each(function(index){
						$(this).find(".table-cell").text(++index);
					});
				}
				//渲染间隔色
				if(data.options.septal) {
					septal($t.find("tr.td-row"));
				}
			}
		},
		resize: function($table, width, height) {
			if(!($table = valid($table))
					|| $table.length == 0
					|| (!width && !height)) return $table;
			var $dt = valid($table),
				$dtDiv = $dt.parent(),
				$ht = $.UI_table.headerTable($dt),
				$htDiv = $ht.parent(),
				$main = $dtDiv.parent();
			if((width = utils.parseFloat(width))
					&& width !== $ht.outerWidth(true)) {
				//重新计算表格列宽大小
				var size = width - $ht.outerWidth(true),
					$ths = $ht.find(".table-th[fixed!=true]");
				calAll($table, $ths, $.UI_table.options($table), size);
				$main.width(width);
				$htDiv.width(width);
				$dtDiv.width(width);
				$ht.outerWidth(width);
				$dt.outerWidth(width);
			}
			if((height = utils.parseFloat(height))
					&& height != $main.height()) {
				$main.height(height);
				$dtDiv.height(height - $htDiv.height());
			}
		},
		//获取th列，返回jQuery
		getThColumn: function($table, fieldName) {
			var cell = $.UI_table.getThCell($table, fieldName);
			return cell ? cell.parent() : null;
		},
		//获取td列，返回jQuery
		getTdColumns: function($table, fieldName) {
			var cells = $.UI_table.getTdCells($table, fieldName);
			return cells ? cells.parent() : null;
		},
		//获取指定的列包含th、td，返回jQuery
		getColumns: function($table, fieldName) {
			var cells = $.UI_table.getCells($table, fieldName);
			return cells ? cells.parent() : null;
		},
		//获取thCell，返回jQuery
		getThCell: function($table, fieldName) {
			if(!$table || !fieldName) return null;
			var data = $table.data("data");
			return data ? data.thCell[fieldName] : null;
		},
		//获取tdCell，返回jQuery
		getTdCells: function($table, fieldName) {
			if(!$table || !fieldName) return null;
			var data = $table.data("data");
			return data ? data.tdCells[fieldName] : null;
		},
		//获取指定的列包含thCell、tdCell，返回jQuery
		getCells: function($table, fieldName) {
			return utils.$add($.UI_table.getThCell($table, fieldName), $.UI_table.getTdCells($table, fieldName));
		},
		//获取指定列的值
		getVal: function($col) {
			if(!$col) return null;
			var field = $col.attr("field"),
				trId = $col.closest("tr").attr("trid");
			if(field && trId) {
				return $col.closest(".data-table").data("data").data[trId][field];
			}else 
				return null;
		},
		//设置列值，同步修改td title显示内容，更新td缓存的值
		setVal: function($col, val) {
			if(!$col || $.UI_table.getVal($col) == val) return;
			$col.find(".table-cell").text(val);
			var $table = $col.closest(".data-table"),
				field = $col.attr("field"),
				trId = $col.closest("tr").attr("trid"),
				data = $table.data("data");
			data.data[trId][field] = val;
			if(!data.colOpts[field].noTip) {
				$col.attr("title", val);
			}
		},
		//给指定列设置html内容，不做任何其他操作
		setHtml: function($col, html) {
			if(!$col) return;
			$col.find(".table-cell").html(html);
		}
	};
	
})(jQuery);