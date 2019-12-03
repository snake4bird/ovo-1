
ovo_app_view = {
	"ovo-page-eidtor": {
		template: '<ovo-view><slot></slot></ovo-view>',
		beforeCreate: function() {
			//这是一个vue组件render的时候，最先执行到的地方
			//此时props还没有赋值
			//此时组件内方法还没有定义
			//此时可以动态调整组件的设置
		},
		props: {
			value: {},
		},
		data: function() {
			return {
				itemSelected: null,
			};
		},
		computed: {
			operations: function() {
				return this.value.operations;
			},
		},
		created: function() {
			//此时props已经赋值
			//data, computed已经执行完成
			this.reviseValue();
		},
		mounted: function() {
			this.actionSelectItem(null);
		},
		methods: {
			reviseValue: function() {
				var editpage = this.value.editpage;
				if (editpage) {
					if (!editpage.work) {
						editpage.design[0] = this.revisePageDesign(editpage.design[0]);
						var ep = {};
						ep.url = editpage.design.url && editpage.design.url();
						ep.app = editpage.app[0];
						ep.design = editpage.design[0];
						Vue.set(editpage, "work", ep);
					}
				} else {
					console.error("page-eidtor需要指定editpage参数");
				}
			},
			revisePageDesignWidget: function(design, widgets, parent_widget, itemkey, widget, version) {
				//标准化，格式化，修正widget，以便后续编辑处理
				//保证widget为对象形式
				//增加版本号
				//增加父子关联关系
				//增加名称
				//增加路径
				//增加编号
				//console.log("-------------"+itemkey+"----");
				if (widget["-v"] != version) {
					//保证widget为对象形式
					if ($.type(widget) == "string") {
						widget = { ctl: widget };
					}
					$.setHiddenAttribte(widget, "-v", version);
					if (!widget["_n"]) {
						$.setHiddenAttribte(widget, "_n", ovo.AN("wsn"));
						$.setHiddenAttribte(widget, "_s", widget["_n"]);
					}
					var widget_path = (parent_widget && (parent_widget._ow_path+"/") || "/") + itemkey;
					$.setHiddenAttribte(widget, "_ow_path", widget_path);
					$.setHiddenAttribte(widget, "_ow_parent", parent_widget);
					$.setHiddenAttribte(widget, "_itmkey", itemkey);
					var items = widget.items;
					if (items) {
						var iks = Object.keys(items);
						if (iks.length == 0) {
							// 避免因空items没有对应的element生成而导致的响应链中断
							delete widget.items;
						} else {
							// sub widgets
							widget.items = {};
							for(var k in items) {
								var sw = items[k];
								var sk = k;
								if (!isNaN(k)) {
									sk = "i"+k;
									var n = 1;
									while (items[sk]) {
										sk = "i"+k+_+n;
										n++;
									}
								}
								sw = this.revisePageDesignWidget(design, widgets, widget, sk, sw, version);
								$.setHiddenAttribte(sw, "_itmkey", sw._itmkey || k)
								widget.items[sk] = sw;
							}
						}
					} else if (widgets[widget.ctl]) {
						// refer widget
						var sw = widgets[widget.ctl];
						sw = this.revisePageDesignWidget(design, widgets, null, widget.ctl, sw, version);
						widgets[widget.ctl] = sw;
						$.setHiddenAttribte(widget, "_s", widget["_n"]+"-"+sw._s);
						if (!sw.wrefs) {
							$.setHiddenAttribte(sw, "wrefs", {});
						}
						sw.wrefs[widget_path] = widget;
					}
				}
				return widget;
			},
			revisePageDesignWidgets: function(pd, pdws) {
				if (!pdws) {
					pdws = {};
				}
				if (!pdws.root) {
					pdws.root = {};
				}
				if ($.type(pdws.root)=="string") {
					pdws.root = {ctl:pdws.root};
				}
				if (!pdws["+maxn"]) {
					Object.defineProperty(pdws, "+maxn", {
						enumerable: false,
						configurable: true,
						value: 0,
						writable: true,
					});
				}
				ovo.AN("wsn", pdws["+maxn"], function(n){pdws["+maxn"]=n});
				var version = ovo.AN("widgets revise version");
				for(var k in pdws) {
					pdws[k] = this.revisePageDesignWidget(pd, pdws, null, k, pdws[k], version);
				}
				return pdws;
			},
			revisePageDesignColumns: function(pd, pdcs) {
				if (!pdcs) {
					pdcs = {};
				}
				return pdcs;
			},
			revisePageDesignSchemas: function(pd, pdss) {
				if (!pdss) {
					pdss = {};
				}
				return pdss;
			},
			revisePageDesign: function(pd) {
				pd.widgets = this.revisePageDesignWidgets(pd, pd.widgets);
				pd.columns = this.revisePageDesignColumns(pd, pd.columns);
				pd.schemas = this.revisePageDesignSchemas(pd, pd.schemas);
				return pd;
			},
			actionTodo: function(e) {
				console.log("准备"+o2s(e));
				return e;
			},
			actionAddBaseWidget: function(e) {
				var pattern = this.value.base_tools && this.value.base_tools.pattern && this.value.base_tools.pattern[0] || {};
				if (!pattern.widgets) {
					Vue.set(pattern, "widgets", {});
				}
				var we = this.itemSelected;
				if (we) {
					var ve = we.__vue__;
					while(ve && ve.vctag != "ova" && ve.vctag != "ovo-widget") {
						ve = ve.$parent;
					}
					if (ve) {
						var wd;
						if (ve.vctag == "ova" && ve.instWidget && ve.instWidget.define) {
							wd = $.clone(ve.instWidget.define);
						} else if (ve.vctag == "ovo-widget") {
							wd = $.clone(ve.value);
						}
						if (wd) {
							delete wd.datum;
							Vue.set(pattern.widgets, "W"+ovo.AN("W"), wd);
						}
					}
				}
			},
			actionAddExtWidget: function(e) {
				var pattern = this.value.app_tools && this.value.app_tools.pattern && this.value.app_tools.pattern[0] || {};
				if (!pattern.widgets) {
					Vue.set(pattern, "widgets", {});
				}
				var we = this.itemSelected;
				if (we) {
					var ve = we.__vue__;
					while(ve && ve.vctag != "ova" && ve.vctag != "ovo-widget") {
						ve = ve.$parent;
					}
					if (ve) {
						var wd;
						if (ve.vctag == "ova" && ve.instWidget && ve.instWidget.define) {
							wd = $.clone(ve.instWidget.define);
						} else if (ve.vctag == "ovo-widget") {
							wd = $.clone(ve.value);
						}
						if (wd) {
							delete wd.datum;
							Vue.set(pattern.widgets, "W"+ovo.AN("W"), wd);
						}
					}
				}
			},
			actionAddReferWidget: function(e) {
				var pattern = this.value.page_tools && this.value.page_tools.pattern && this.value.page_tools.pattern[0] || {};
				if (!pattern.widgets) {
					Vue.set(pattern, "widgets", {});
				}
				var we = this.itemSelected;
				if (we) {
					var ve = we.__vue__;
					while(ve && ve.vctag != "ova" && ve.vctag != "ovo-widget") {
						ve = ve.$parent;
					}
					if (ve) {
						var wd;
						if (ve.vctag == "ova" && ve.instWidget && ve.instWidget.define) {
							wd = $.clone(ve.instWidget.define);
						} else if (ve.vctag == "ovo-widget") {
							wd = $.clone(ve.value);
						}
						if (wd) {
							delete wd.datum;
							Vue.set(pattern.widgets, "W"+ovo.AN("W"), wd);
						}
					}
				}
			},
			actionSelectItem: function(e) {
				this.itemSelected = e;
				if (e) {
					for(var i=0; i<this.operations.length; i++) {
						this.operations[i].enabled=true;
					}
				} else {
					for(var i=0; i<this.operations.length; i++) {
						this.operations[i].enabled=false;
					}
				}
				var ve;
				var we = this.itemSelected;
				if (we) {
					ve = we.__vue__;
					while(ve && ve.vctag != "ova" && ve.vctag != "ovo-widget") {
						ve = ve.$parent;
					}
				}
				var wd;
				var wdd;
				if (ve) {
					if (ve.vctag == "ova" && ve.instWidget && ve.instWidget.define) {
						wd = ve.instWidget.define;
						wdd = ve.instWidget.context && ve.instWidget.context.columns && ve.instWidget.context.columns[wd.datum];
					} else if (ve.vctag == "ovo-widget") {
						wd = ve.value;
						wdd = {};
					}
				} else {
					wd = this.value;
					wdd = {};
				}
				this.value.selectedItem.props = wd;
				this.value.selectedItemDatum.props = wdd;
			},
		},
	},
	"ovo-designer": {
		template: '<ovo-designer-editor :value="editpage" @change="change"></ovo-designer-editor>',
		props: {
			value: {},
		},
		computed: {
			editpage: function() {
				//this.reviseValue();
				return this.value.work;
			},
		},
		methods: {
			change: function(e) {
				this.$emit("change", {value: this.value});
			},
		},
	},
	"ovo-designer-editor": {
		template: '<ovo-draggable-editor>'
			+ '<ovo style="position: absolute; left:0; top:0; width:100%; height:100%; overflow: auto;" scene="bfde" :page="epage" @change="onchange"></ovo>'
			+ '</ovo-draggable-editor>',
		props: {
			value: {},
		},
		computed: {
			epage: function() {
				if (this.value) {
					document.title = "编辑 - " + (
						this.value.design && this.value.design.info && this.value.design.info.title
						|| ((this.value.app && (this.value.app+" - ") || "") + (this.value.name || "新页面"))
						);
				}
				return this.value;
			},
		},
		methods: {
			onchange: function(e) {
				console.log("designer editor value change "+e);
			},
		},
	},
	"ovo-toolbox": {
		template: '<ovo-draggable-editor style="flex: 1 1 1px; overflow: auto; flex-flow: column nowrap; align-items: stretch;">'
		 + '<ovo-tools-shelf style="width:100%;min-height:100%;border:1px solid transparent;" :value="tools.pattern" :mode="tools.descr.mode" :editable="editable">'
		 + '</ovo-tools-shelf>'
		 + '<div style="position:absolute;z-index:0;left:1px;top:-2px;color:rgba(0,0,0,0.5);font-size:10px;">{{tools.descr.title}}</div>'
		 + '</ovo-draggable-editor>',
		props: {
			value: {},
		},
		computed: {
			editable: function() {
				return this.tools.descr.mode != "base";
			},
			tools: function() {
				return this.value || {
						descr: {
							title: "工具栏标题",
							mode: "工具类型",
						},
						pattern: [{}],
					}; 
			}
		},
	},
	"ovo-tools-shelf": {
		template: '<ovo-ctl :class="editable_class">'
		 + '<ovo-grid style="width:100%;border:0;" cols="1">'
		 + '<ovo-widget v-for="(w,k,i) in widgets" :key="k" :title="w.desc||w.name||k" :itmkey="k" :value="pattern(w)">{{i+1}} {{w.name||k}}</ovo-widget>'
		 + '</ovo-grid>'
		 + '</ovo-ctl>',
		props: {
			value: {},
			mode: { default: "value", },
			editable: {},
		},
		data: function() {
			return {
				exova: "tools shelf",
			};
		},
		computed: {
			editable_class: function() {
				return this.editable?"editable":"";
			},
			instWidget: function() {
				var iw = $.clone(this.value[0]) || {};
				iw.define = this.value[0];
				if (iw.widgets) {
					delete iw.widgets.root;
					for(var k in iw.widgets) {
						$.setHiddenAttribte(iw.widgets[k], "_itmkey", iw.widgets._itmkey || k);
					}
				} else {
					iw.widgets = {};
				}
				return iw;
			},
			widgets: function() {
				return this.instWidget.widgets;
			}
		},
		methods: {
			pattern: function(w) {
				if (this.mode=="refer") {
					var iw = {ctl: w._itmkey};
					$.setHiddenAttribte(iw, "_itmkey", w._itmkey);
					return iw;
				} else {
					return w;
				}
			},
		},
	},
	"ovo-widget": {
		template: '<ovo-ctl class="ovc-draggable">'
		 + '<div class="ovo-bfdw-tool"><span class="glyphicon glyphicon-plus"><slot></slot></span></div>'
		 + '<div class="ovo-bfdw-drag"><ovo-box style="width:1cm;height:0.5cm;overflow:visible; justify-content:center;"><span class="glyphicon glyphicon-plus"></span></ovo-box></div>'
		 + '<div class="ovo-bfdw-tmpl" :itmkey="itmkey">{{value}}</div>'
		 + '</ovo-ctl>',
		props: {
			itmkey: {},
			value: {},
		},
	},
	"ovo-draggable-editor": {
		template: '<ovo-draggable-view @dragging="dragging">'
			+ '<slot></slot>'
			+ '</ovo-draggable-view>',
		methods: {
			dragging: function(e) {
				if ($(e.target_element).hasClass("ovo-tools-shelf")) {
					if ($(e.target_element).hasClass("editable")) {
						this.addWidget(e.dragging_widget, e.target_cwidget, e.target_element, e.xx, e.yy);
					}
				} else {
					this.moveItem(e.dragging_widget, e.target_cwidget, e.target_element, e.xx, e.yy);
				}
			},
			edraggingwidget: function(e) {
				if (e && e.__vue__) {
					var eova = e.__vue__;
					if (eova.vctag == "ovo") {
						eova = eova.$children[0];
					}
					if (eova.vctag == "ovc") {
						eova = eova.$children[0];
					}
					while(eova) {
						if ((eova.vctag == "ova" || eova.exova) && eova.instWidget && eova.instWidget.define._ow_parent) {
							//引用widget只能拖拽引用的实例
							return eova.instWidget;
						}
						if (eova.vctag == "ovo-widget") {
							return {
								define: eova.value,
							};
						}
						eova = eova.$parent;
					}
				}
				return null;
			},
			targetwid: function(wtarget) {
				while (wtarget && wtarget.wparent && wtarget.wparent.referwidgetinfo) {
					wtarget = wtarget.wparent;
				}
				return wtarget && wtarget.define._ow_id;
			},
			widgetString: function(w) {
				var s = JSON.stringify(w);
				return s;
			},
			addWidget: function(dragging_widget, target_cwidget, target_element, xx, yy) {
				//widgets定义，是实际定义的widgets信息
				var define_widgets = target_cwidget.define.widgets;
				if (!define_widgets) {
					define_widgets = {};
					Vue.set(target_cwidget.define, "widgets", define_widgets);
				}
				//widgets列表，是widgets定义的副本，并给每个widget增加了key字段用于回溯widget在列表中的位置
				var list_widgets = target_cwidget.widgets;
				if (!target_cwidget.index_widgets) {
					target_cwidget.index_widgets = {};
					for (var ik in list_widgets) {
						var w = list_widgets[ik];
						var s = this.widgetString(w);
						target_cwidget.index_widgets[s] = ik;
					}
				}
				var dws = this.widgetString(dragging_widget);
				//widgets列表中不存在，确定
				if (!target_cwidget.index_widgets[dws]) {
					while (!dragging_widget._itmkey
						|| (list_widgets[dragging_widget._itmkey] && list_widgets[dragging_widget._itmkey]._itmkey!=dragging_widget._itmkey)) {
						$.setHiddenAttribte(dragging_widget, "_itmkey", "W"+ovo.AN("W"));
					}
					//插入到widgets定义中
					if (!define_widgets[dragging_widget._itmkey]) {
						// 避免无限循环
						var cdw = $.clone(dragging_widget);
						// widget定义中不需要key字段
						$.setHiddenAttribte(cdw, "_itmkey", dragging_widget._itmkey);
						Vue.set(define_widgets, dragging_widget._itmkey, cdw);
					}
				}
			},
			moveItem: function(dragging_widget, target_cwidget, target_element, xx, yy) {
				var target_widget_define = target_cwidget && target_cwidget.define;
				if (!target_widget_define) {
					// 拖拽到编辑区外的部件
					if (dragging_widget._ow_parent) {
						// 从部件树中删除
						Vue.delete(dragging_widget._ow_parent.items, dragging_widget._itmkey);
						delete dragging_widget._ow_parent;
					}
					return;
				}
				if (dragging_widget._ow_id == this.targetwid(target_cwidget)) {
					console.error("dragging widget self");
					return;
				}
				var fd = $(target_element).css("flex-direction");
				var idx_dragging_widget = -1;
				var dmin = { v: 1e308, dp:"", ctl:null, idx:0, };
				if (target_cwidget && target_cwidget.widgets) {
					if (fd == "column") {
						for(var i=0; i<target_cwidget.widgets.length; i++) {
							var swgtid = target_cwidget.widgets[i];
							var scte = $("#"+swgtid);
							var awidget = this.edraggingwidget(scte[0]);
							if (!awidget) {
								console.error("widget tree confused");
							}
							if (this.targetwid(awidget) == dragging_widget._ow_id) {
								idx_dragging_widget = i;
							} else {
								var dv = window.distancev(scte, xx, yy);
								if (dv.dvt < dmin.v) { dmin.v = dv.dvt; dmin.dp = "vt"; dmin.ctl = swgtid; dmin.idx=idx_dragging_widget>=0?(i-1):i; }
								if (dv.dvb < dmin.v) { dmin.v = dv.dvb; dmin.dp = "vb"; dmin.ctl = swgtid; dmin.idx=idx_dragging_widget>=0?(i+1):(i+2); }
							}
						}
					} else {
						for(var i=0; i<target_cwidget.widgets.length; i++) {
							var swgtid = target_cwidget.widgets[i];
							var scte = $("#"+swgtid);
							var awidget = this.edraggingwidget(scte[0]);
							if (!awidget) {
								console.error("widget tree confused");
							}
							if (this.targetwid(awidget) == dragging_widget._ow_id) {
								idx_dragging_widget = i;
							} else {
								var dh = window.distanceh(scte, xx, yy);
								
								if (dh.dhl < dmin.v) { dmin.v = dh.dhl; dmin.dp = "hl"; dmin.ctl = swgtid; dmin.idx=idx_dragging_widget>=0?(i-1):i; }
								if (dh.dhr < dmin.v) { dmin.v = dh.dhr; dmin.dp = "hr"; dmin.ctl = swgtid; dmin.idx=idx_dragging_widget>=0?(i+1):(i+2); }
							}
						}
					}
				}
				if (dmin.ctl && (!ovo.ldmin || dmin.ctl != ovo.ldmin.ctl || dmin.idx != ovo.ldmin.idx)) {
					if (ovo.ldmin) {
						$("#"+ovo.ldmin.ctl).css("background-color", ovo.ldmin.laststyle);
						delete ovo.ldmin;
					}
					dmin.laststyle = $("#"+dmin.ctl).css("background-color");
					$("#"+dmin.ctl).css("background-color", "rgba(0,0,255,0.1)");
					ovo.ldmin = dmin;
				}
				if (idx_dragging_widget != dmin.idx) {
					if (ovo.ldmin) {
						$("#"+ovo.ldmin.ctl).css("background-color", ovo.ldmin.laststyle);
						delete ovo.ldmin;
					}
					var before_widget_id = target_cwidget && target_cwidget.widgets[dmin.idx];
					var before_element = before_widget_id && $("#"+before_widget_id);
					var before_widget = before_element && this.edraggingwidget(before_element[0]);
							
					if (!dragging_widget._itmkey) {
						var nwk = "W"+ovo.AN("W");
						$.setHiddenAttribte(dragging_widget, "_itmkey", nwk);
					}
					if (dragging_widget._ow_parent == target_widget_define) {
						// 父级没有变化
						var oks = Object.keys(target_widget_define.items);
						if(oks.length==1){
							// 父级的唯一孩子
							return
						} else if (before_widget && before_widget.define._itmkey) {
							if (oks.indexOf(before_widget.define._itmkey)==oks.indexOf(dragging_widget._itmkey)+1) {
								// 兄弟间的顺序也没有变化
								return;
							}
						} else if (!before_widget && oks.indexOf(dragging_widget._itmkey)==oks.length-1) {
							// 最后一个孩子，兄弟间的顺序也没有变化
						}
					}
					// 父级改变或兄弟顺旬改变
					
					// remove from old parent items
					if (dragging_widget._ow_parent) {
						Vue.delete(dragging_widget._ow_parent.items, dragging_widget._itmkey);
						//console.log("delete item "+dragging_widget._itmkey+" from "+dragging_widget._ow_parent._s);
					//} else {
						//console.error("no parent");
						//pattern no parent
					}

					// assign ctrl to new parent
					// 避免无限循环
					var cdw = $.clone(dragging_widget);
					// 保持相同ID
					$.setHiddenAttribte(cdw, "_ow_id", dragging_widget._ow_id);
					if (dragging_widget["_from"] == "pattern") {
						$.setHiddenAttribte(dragging_widget, "_itmkey", "W"+ovo.AN("W"));
						delete dragging_widget["_from"];
					}
					$.setHiddenAttribte(cdw, "_itmkey", dragging_widget._itmkey);
					
					if (target_widget_define.items) {
						while (target_widget_define.items[cdw._itmkey]) {
							var nwk = "W"+ovo.AN("W");
							$.setHiddenAttribte(cdw, "_itmkey", nwk);
						}
					}
					cdw.name=cdw._itmkey;
					$.setHiddenAttribte(cdw, "_ow_parent", target_widget_define);
					
					console.log("insert item "+cdw._itmkey+" into "+target_widget_define._s);
					Vue.set(target_widget_define, "items", this.insertItem(target_widget_define.items, before_widget && before_widget.define._itmkey, cdw._itmkey, cdw));
					$.setHiddenAttribte(dragging_widget, "_ow_parent", target_widget_define);

					reviseWidgetInfo = function(widget, from_widget) {
						if (from_widget) {
							$.setHiddenAttribte(widget, "_n", from_widget["_n"]);
							$.setHiddenAttribte(widget, "_s", from_widget["_s"]);
							var widget_path = (widget._ow_parent && (widget._ow_parent._ow_path+"/") || "/") + widget._itmkey;
							$.setHiddenAttribte(widget, "_ow_path", widget_path);
							var items = widget.items;
							for(var sk in items) {
								var sw = items[sk];
								$.setHiddenAttribte(sw, "_ow_parent", widget);
								$.setHiddenAttribte(sw, "_itmkey", sk);
								sw = reviseWidgetInfo(sw, from_widget.items && from_widget.items[sk]);
							}
						}
					}
					reviseWidgetInfo(cdw, dragging_widget);
				}
			},
			insertItem: function (obj, beforeKey, newKey, nv) {
				var nobj = {};
				var oks = obj && Object.keys(obj) || [];
				for (var i = 0; i < oks.length; i++) {
					if (beforeKey == oks[i]) {
						//插到beforeKey之前
						nobj[newKey] = nv;
					}
					nobj[oks[i]] = obj[oks[i]];
				}
				//没找到beforeKey的情况下,插到末尾
				nobj[newKey] = nv;
				//返回新对象
				return nobj;
			},
		},
	},
	"ovo-draggable-view": {
		//draggable-view内有draggable标记的element都可以在draggable-view之间拖拽
		template: '<ovo-view style="position: relative;" @mousemove.native="mousemove" @mouseout.native="mouseout" @mousedown.native="mousedown" @mouseup.native="mouseup">'
			+ '<slot></slot>'
			+ '<div id="dvhelper" style="position:fixed;left:100vw;top:100vh;z-index:9999;"></div>'
			+ '</ovo-view>',
		data: function () {
			var me = this;
			//dv_drag_helper拖拽过程显示的element
			var dv_drag_helper = function(e_mousedown) {
				var we = dragging_element = $(this);
				var de = we.children(".ovo-bfdw-drag");
				$("#dvhelper").html(
					//新增，从Toolbox拖入
					de && de.html()
					|| //移动，
					('<div style="width:'+we.width()+'px;height:'+we.height()+'px;border:1px dotted blue;">'
					 +'</div>'));
				var e = $("#dvhelper").children()[0];
				e.style.pointerEvents = "none";
				var te = we.children(".ovo-bfdw-tmpl");
				if (te[0]) {
					//新增，从Toolbox拖入
					var pattern = {};
					//console.log("pattern = "+$(te).html());
					eval("pattern="+$(te).html());
					$.setHiddenAttribte(pattern, "_n", ovo.AN("wsn"));
					$.setHiddenAttribte(pattern, "_s", pattern["_n"]);
					$.setHiddenAttribte(pattern, "_itmkey", $(te).attr("itmkey"));
					$.setHiddenAttribte(pattern, "_from", "pattern");
					e.dragging_widget = pattern;
					if (!e.dragging_widget) {
						console.error("!pattern");
					}
				} else {
					//移动
					var etarget = we[0];
					//e.id = etarget.id;
					var dragging_element = etarget;
					var dragging_cwidget = me.edraggingwidget(dragging_element);
					while(dragging_cwidget.wparent.referwidgetinfo) {
						dragging_cwidget = dragging_cwidget.wparent;
					}
					e.dragging_widget = dragging_cwidget.define;
					if (!e.dragging_widget) {
						console.error("!ova");
					}
					me.$emit("message", (e.dragging_widget["-v"]||"-") + " : " + (e.dragging_widget._ow_path || ""));
				}
				e.innerHTML=("<nobr>"+e.dragging_widget._s+"</nobr>")+e.innerHTML;
				return e;
			};
			var dv_drag_start = function(e,u) {
			};
			var dv_drag_drag = function(e,u) {
				me.message = u.helper[0].parentElement.outerHTML;
				var oe = e.originalEvent;
				var xx = oe.originalEvent.pageX || oe.originalEvent.x || 0;
				var yy = oe.originalEvent.pageY || oe.originalEvent.y || 0; 
				//var id = u.helper[0].id;
				var dragging_widget = u.helper[0].dragging_widget;
				me.dv_drag_drag(u.helper[0], xx, yy, dragging_widget);
			};
			var dv_drag_stop = function(e,u) {
				me.dv_drag_stop();
			};
			return {
				ddwidget: {
					revert: false,
					cursor: "default",
					distance: 2,
					cursorAt: {left:-15, top: 1},
					//containment: ".ovo-bfd-view",
					zIndex:999,
					//refreshPositions: true,
					//helper: "clone", "clone"会把id去掉, 用$.clone(this)会保留id, 用function自定义
					helper: dv_drag_helper,
					start: dv_drag_start,
					drag: dv_drag_drag,
					stop: dv_drag_stop,
				},
			};
		},
		methods: {
			elementInstWidget: function(e) {
				if (e && e.__vue__) {
					var eova = e.__vue__;
					if (eova.vctag == "ovo") {
						eova = eova.$children[0];
					}
					if (eova.vctag == "ovc") {
						eova = eova.$children[0];
					}
					while(eova) {
						if ((eova.vctag == "ova" || eova.exova) && eova.instWidget) {
							//引用widget只能拖拽引用的实例
							return eova.instWidget;
						}
						if (eova.vctag == "ovo-widget") {
							return {
								define: eova.value,
							};
						}
						eova = eova.$parent;
					}
				}
				return null;
			},
			edraggingwidget: function(e) {
				if (e && e.__vue__) {
					var eova = e.__vue__;
					if (eova.vctag == "ovo") {
						eova = eova.$children[0];
					}
					if (eova.vctag == "ovc") {
						eova = eova.$children[0];
					}
					while(eova) {
						if ((eova.vctag == "ova" || eova.exova) && eova.instWidget && eova.instWidget.define._ow_parent) {
							//引用widget只能拖拽引用的实例
							return eova.instWidget;
						}
						if (eova.vctag == "ovo-widget") {
							return {
								define: eova.value,
							};
						}
						eova = eova.$parent;
					}
				}
				return null;
			},
			etargetwidget: function(e) {
				if (e && e.__vue__) {
					var eova = e.__vue__;
					if (eova.vctag == "ovo") {
						eova = eova.$children[0];
					}
					if (eova.vctag == "ovc") {
						eova = eova.$children[0];
					}
					while(eova) {
						if ((eova.vctag == "ova" || eova.exova) && eova.instWidget) {
							return eova.instWidget;
						}
						eova = eova.$parent;
					}
				}
				return null;
			},
			targetwid: function(wtarget) {
				while (wtarget && wtarget.wparent && wtarget.wparent.referwidgetinfo) {
					wtarget = wtarget.wparent;
				}
				return wtarget && wtarget.define._ow_id;
			},
			dv_drag_drag: function(draghelper, xx, yy, dragging_widget) {
				var thisview = this.$el;
				if (!dragging_widget) {
					console.error("NO dragging_widget!");
					return;
				}
				//给拖曳对象widget define赋值一个隐藏的唯一ID
				if (!dragging_widget._ow_id) {
					$.setHiddenAttribte(dragging_widget, "_ow_id", ovo.AN("$WID"));
				}
				var draggin_widget_wid = dragging_widget._ow_id;
				//target element
				var te = null;
				var tv = null;
				var tw = null;
				var etarget = window.elementFromPoint(xx, yy);
				var wtarget = this.etargetwidget(etarget);
				var targetwid = this.targetwid(wtarget);
				while (etarget) {
					if (targetwid==draggin_widget_wid) {
						//目标id与当前id一致
						te = null;
					} else if ($(etarget).hasClass("ovo-draggable-view")) {
						if (!tv && te) {
							tv = etarget;
						}
					} else if (te == null
							&& ($(etarget).hasClass("ovo-tools-shelf")
								|| ($(etarget).hasClass("ova")
									&& ($(etarget).hasClass("ovo-box")
										|| $(etarget).hasClass("ovo-grid-cell")
										|| $(etarget).hasClass("ovo-table-cell")
										|| $(etarget).hasClass("ovc"))))) {
						te = etarget;
						tw = wtarget;
						tv = null;
					}
					etarget = etarget.parentElement;
					wtarget = this.etargetwidget(etarget);
					targetwid = this.targetwid(wtarget);
				}
				// !tv && !te  目标不存在，鼠标在窗口外
				// tv && !te   目标是拖曳对象自身，循环会继续，因此不会发生这种情况
				// !tv && te   目标不在可编辑区域
				// tv && te    目标在可编辑区域
				//console.log((tv!=null) +" "+ (te!=null)+" "+ (tw!=null));
				//if (!tv && !te) {
				//	console.log("mouse out");
				//}
				if (!tv || te) {
					if (te != ovo.hover_ctl_element) {
						//与上次目标不一样
						if (ovo.hover_ctl_element) {
							//恢复上次目标状态
							ovo.hover_ctl_element.style.border = ovo.hover_ctl_oborder;
						}
						var fd;
						if (tv) {
							//目标在designer内部
							ovo.hover_ctl_element = te;
							ovo.hover_ctl_oborder = te && te.style.border;
							te.style.border = "1px solid red";
							fd = $(te).css("flex-direction");
						} else {
							//目标不存在
							delete ovo.hover_ctl_oborder;
							delete ovo.hover_ctl_element;
							te = null;
							//
							//current_view.dragout;
						}
					//	this.moveItem(dragging_widget, this.etargetwidget(te), fd, xx, yy);
					//
						this.$emit("dragging", {
								dragging_widget: dragging_widget,
								target_cwidget: this.etargetwidget(te),
								target_element: te,
								xx: xx,
								yy: yy,
							});
					//
					}
				} else {
					//目标是dragging_widget自己
					this.dv_drag_stop();
				}
			},
			mousemove: function (e) {
				// 为避免初始化时间过长,在鼠标滑过相应控件时对其进行拖拽事件绑定等耗时初始化操作
				var me = this;
				var thisview = this.$el;
				if (!thisview) {
					console.error("?? $el is null");
					return
				}
				if (e.buttons == 0) {
					//获取当前可拖拽元素
					var xx = e.pageX || e.x || 0;
					var yy = e.pageY || e.y || 0;
					var ele = window.elementFromPoint(xx, yy);
					while (ele && !$(ele).hasClass("ovc-draggable")) {
						ele = ele.parentElement;
					}
					if (ele) {
						if (ele != ovo.hover_ctl_element) {
							//切换高亮当前可拖拽元素
							if (ovo.lastTopView != thisview) {
								if (ovo.lastTopView) {
									//恢复上次前端视图层次
									$(ovo.lastTopView).css("z-index", ovo.lastTopViewZIndex);
								}
								ovo.lastTopViewZIndex = $(thisview).css("z-index");
								$(thisview).css("z-index", 999); //将当前视图切换到最前端
								ovo.lastTopView = thisview;
							}
							if (ovo.hover_ctl_oborder) {
								//恢复上次高亮可拖拽元素显示状态
								ovo.hover_ctl_element.style.border = ovo.hover_ctl_oborder;
							}
							ovo.hover_ctl_oborder = ele.style.border;
							ovo.hover_ctl_element = ele;
							ele.style.border = "1px solid red";
							if (!($(ele).hasClass("ovo")&&ele.parentElement==thisview)) {
								//如果不是根节点,则进行可拖拽初始化
								setTimeout(function(){
										$(ele).prop("tabIndex", -1);
										$(ele).on("mousedown", function(e){ e.target.focus(); });
										$(ele).draggable(me.ddwidget);
									}, 1);
							}
							//显示当前可拖拽元素信息
							var eiw = this.elementInstWidget(ele);
							if (eiw) {
								Object.defineProperty(eiw, "value", {
									enumerable: true,
									configurable: true,
									get: function() {
										return eiw.define.value;
									},
									set: function(v) {
										eiw.define.value = v;
									},
								});
							}
							this.$emit("message", (eiw && (eiw.define._ow_path && (eiw.define._s + " : " + eiw.define._ow_path) || (eiw.define._itmkey && ("W:" + eiw.define._itmkey))) || ele.className)+"  "+ele.style.border);
						}
						//当前有高亮选择,避免dv_drag_stop调用 	
						return;
					}
				}
				this.dv_drag_stop();
			},
			mousedown: function(e) {
				//if (ovo.hover_ctl_element) {
					if (ovo.hover_ctl_element != ovo.select_ctl_element) {
						if (ovo.select_ctl_oborder != null) {
							//恢复上次被选控件状态
							ovo.select_ctl_element.style.border = ovo.select_ctl_oborder;
						}
						ovo.select_ctl_oborder = ovo.hover_ctl_oborder;
						ovo.select_ctl_element = ovo.hover_ctl_element;
						ovo.actionsChain(this, "selectItem", ovo.select_ctl_element);
						if (ovo.hover_ctl_element) {
							ovo.hover_ctl_oborder = "1px dashed red";
						}
					}
				//}
			},
			mouseup: function(e) {
				if (ovo.select_ctl_element && ovo.select_ctl_element.id) {
					var sce = $("#"+ovo.select_ctl_element.id);
					if (sce.length>0) {
						ovo.select_ctl_element=sce[0];
						ovo.select_ctl_element.style.border="1px dashed red";
					} else {
						ovo.select_ctl_element = null;
						ovo.select_ctl_oborder = null;
						ovo.actionsChain(this, "selectItem", null);
					}
				}
			},
			dv_drag_stop: function(e) {
				if (ovo.hover_ctl_element) {
					ovo.hover_ctl_element.style.border = ovo.hover_ctl_oborder;
					delete ovo.hover_ctl_oborder;
					delete ovo.hover_ctl_element;
				}
				if (ovo.ldmin) {
					$("#"+ovo.ldmin.ctl).css("background-color", ovo.ldmin.laststyle);
					delete ovo.ldmin;
				}
				if (ovo.lastTopView) {
					$(ovo.lastTopView).css("z-index", ovo.lastTopViewZIndex);
					delete ovo.lastTopView;
				}
			},
			mouseout: function (e) {
				if (e.buttons == 0) {
					this.dv_drag_stop();
				}
			},
		},
	},
	
	
	"ovo-popup": {
		template: '<div style="display:none;"><slot></slot></div>',
		props: {
			dialog: { default: function() {
						return {
							title: "",
							attachElement: null,
						};
					}, },
		},
		mounted: function() {
			var me = this;
			this.$watch("dialog", function (nv,ov) {
				if (ovo.popupDialog) {
					ovo.popupDialog.dialog("close");
					ovo.popupDialog = null;
				}
				if (nv.attachElement) {
					ovo.popupDialog = $(me.$el);
						ovo.popupDialog.dialog({
								modal: false,
								title: nv.title,
								dialogClass: "ui-dialog-no-close",
								resizable: false,
								position: { my: "left top", at: "left bottom", of: nv.attachElement },
							});
				}
				if (!ovo.watchFocus) {
					n = 0;
					ovo.watchFocus = function(e) {
						if (ovo.popupDialog) {
							var fe = e.target;
							while (fe != document.body) {
								console.log("in "+n+" : "+fe.outerHTML.substring(0, 150));
								n++;
								if (fe == ovo.popupDialog[0].parentElement) {
									return;
								}
								fe = fe.parentElement;
							}
							ovo.popupDialog.dialog("close");
							ovo.popupDialog = null;
						}
					}
					$(document).on("focusin", ovo.watchFocus);
				}
			}, {
				deep: true,
			});
		},
	},
	"ovo-file-any": {
		template: '<div>'
			+'测试：'
			+'<button @click="fileSelect" value="">自动生成</button>'
			+'<button @click="fileSelect" value="a">a</button>'
			+'<button @click="fileSelect" value="b">b</button>'
			+'<button @click="fileSelect" value="c">c</button>'
			+'<button @click="fileSelect" value="d">d</button>'
			+'<br/>'
			+'选择云端文件<br/>'
			+'home<br/>'
			+'+- layout<br/>'
			+' +- <span style="color:blue;">default</span><br/>'
			+'+- schema<br/>'
			+'+- data<br/>'
			+'选择本地文件<br/>'
			+'<input type="file"></input><br/>'
			+'<input type="checkbox" checked="true">上传至服务器</input><br/>'
			+'</div>',
		props: {
		},
		computed: {
		},
		methods: {
			fileSelect: function(e) {
				this.$emit("change", {fileSelected: e.target.value});
			},
		},
	},

	"ovo-bfde-ctl": {
		template: '<ovo-ctl>'
		 + '<slot></slot>'
		 + '<ovo-bfde-ctl-name><nobr>{{wova.instWidget.define._s}}</nobr></ovo-bfde-ctl-name>'
		 + '</ovo-ctl>',
		computed: {
			wova: function() {
				var wova = this.$parent;
				while(wova.vctag!="ova") {
					wova = wova.$parent;
				}
				return wova;
			},
		},
		mounted: function() {
			for (var i=0; i<this.$children.length; i++) {
				var c=this.$children[i];
				var e=$(c.$el);
				var p=$(c.$el.parentElement);
				if (e.hasClass("ova") && (p.hasClass("ovc") || p.hasClass("ovc-cell"))) {
					e.addClass("ovc-draggable")
				}
			}
		},
	},
	"ovo-bfde-ctl-name": {
		template: '<div style="position:absolute;z-index:0;left:1px;top:-2px;color:rgba(0,0,0,0.5);font-size:10px;">'
		 + '<slot></slot>'
		 + '</div>',
	},
	
	"ovo-bfde-ctlx": {
		template: '<ovo-ctl :value="value">'
		 + '<slot></slot>'
		 + '<ovo-bfde-float-option v-if="showOption"></ovo-bfde-float-option>'
		 + '</ovo-ctl>',
		props: {
			value: {},
		},
		data: function() {
			return {
				showOption: false,
			};
		},
		mounted: function() {
			var id = this.$el.id;
			var ctrl = ovo.index(id);
			var isovc = $(this.$el).hasClass("ovc");
			this.showOption = ctrl!=null && !isovc;
			if (ctrl) {
			}
		},
	},
	
	"ovo-bfde-float-option": {
		template: '<div @mousemove="mousemove" @mouseout="mouseout">'
		 +'<div @mouseout="mouseout" ref="props" '
		 +'style="overflow:visible;padding:2px;display:none;flex-flow:column nowrap;position:absolute;z-index:999;left:3px;top:3px;border:1px solid gray;background-color:rgba(220,220,220,0.9);">'
		 +'<div style="padding:2px;border-bottom:1px solid #efefef;display:flex;justify-content:center;"><ovo-autosize-input style="flex:1;justify-content:center;" :value="settingData" :placeholder="inheritData" @change="dataChange"></ovo-autosize-input></div>'
		 +'<div style="padding:2px;white-space:nowrap;"><label>字段&nbsp;</label><input ref="key" :value="key"></input></div>'
		 +'<div style="padding:2px;white-space:nowrap;"><label>类型&nbsp;</label><input ref="type" :value="type"></input></div>'
		 +'<div style="padding:2px;white-space:nowrap;"><button @click="group">组合</button><button @click="ungroup">分解</button></div>'
		 +'</div></div>',
		data: function() {
			return {
				inheritData: "",
				settingData: "",
				title: "",
				key: "",
				type: "",
			};
		},
		methods: {
			dataChange: function(e) {
				var id = this.$el.parentElement.id;
				var ctrl = ovo.index(id);
				ctrl.data = e.value;
			},
			group: function(e) {
				var id = this.$el.parentElement.id;
				var ctrl = ovo.index(id);
				if (ctrl.ctl == "box") {
					ctrl.ctl = "ctl";
				} else if (ctrl.ctl == "ctl") {
					var ctn = "f" + window.stamp;
					var tfn = "ovo-" + ctn;
					var cd = {};
					cd[tfn] = $.extend(true, {}, ovo.components["ovo-field"]);
					cd[tfn].pattern = JSON.parse(JSON.stringify(ctrl));
					ovo.loadComponent(cd);
					ovo.updateValue(ctrl, {ctl: ctn});
					ovo.widgets.push({title: "user defined ", pattern: {ctl: ctn}});
				} else {
					// can't group
				}
			},
			ungroup: function(e) {
				var id = this.$el.parentElement.id;
				var ctrl = ovo.index(id);
				if (ctrl.ctl == "ctl") {
					ctrl.ctl = "box";
				} else if (ctrl.ctl == "box") {
					// can't ungroup
				} else {
					var vwidget = this.$parent;
					var vn = vwidget;
					while (vn && vn.$options._componentTag != "ova") {
						vn = vn.$parent;
					}
					vn = vn.$parent;
					if (vn.$parent && vn.$parent.$options._componentTag != "ovo-"+ctrl.ctl+"-ovo") {
						var mm = vn.layout;
						mm = JSON.parse(JSON.stringify(mm));
						mm.ctl = "box";
						ovo.updateValue(ctrl, mm);
					} else {
						// not a ovc
					}
				}
			},
			mousemove: function(e) {
				var ctlbox = this.$el.parentElement
				var ctrl = ovo.index(ctlbox.id);
				
				var pctl = ctrl && ovo.index(ctrl.$ovoPID && ctrl.$ovoPID());
				this.settingData = ctrl.settingData = ctrl && (ctrl.field || ctrl.data) || "";
				this.inheritData = ctrl.inheritData = pctl && (pctl.settingData || pctl.field || pctl.data || pctl.inheritData) || "-";
				this.title = pctl && (pctl.field || pctl.data) || "data";
				this.key = ctrl && (ctrl.attr || ctrl.field || ctrl.data) || "-";
				this.type = ctrl.ctl == "minicheck" && "boolean" || ctrl.type || ctrl.attr && ctrl.ctl || "object";
				this.$refs["props"].style.display = "flex";
				var e = $(this.$refs["props"]);
				var container = $(".ovo-bfdv-editor");
				if (e.offset().left + e.width() > container.offset().left+container.width()-20) {
					if (e.css("left")) {
						e.css("left", "");
						e.css("right", "3px");
					}
				} else if (e.offset().left < container.offset().left) {
					if (e.css("right")) {
						e.css("right", "");
						e.css("left", "3px");
					}
				}
				if (e.offset().top + e.height() > container.offset().top+container.height()-20) {
					if (e.css("top")) {
						e.css("top", "");
						e.css("bottom", "3px");
					}
				} else if (e.offset().top < container.offset().top) {
					e.css("bottom", "");
					e.css("top", "3px");
				}
			},
			mouseout: function(e) {
				this.$refs["props"].style.display = "none";
			},
		},
	},
	
	"ovo-bfde-minicheck": {
		template: '<ovo-ctl style="flex-flow:column;">'
		 + '<div style="white-space:nowrap;">{{flag}}{{label}}</div>'
		 + '<input type="checkbox" :checked="value" @click="change"></input>'
		 + '</ovo-ctl>',
		props: {
			flag: {},
			label: {},
			value: {},
		},
		methods: {
			change: function(e) {
				console.log(pcl + "ovo-bfde-minicheck change " + JSON.stringify(e));
				this.$emit("change", {value: e.target.checked});
			},
		},
	},

	"ovo-bfde-label": {
		template: '<ovo-autosize-input :value="value" :title="title" @change="change">'
		 + '</ovo-autosize-input>',
		props: {
			value: {},
			title: {}
		},
		methods: {
			change: function(e) {
				console.log(pcl + "ovo-bfde-label change " + JSON.stringify(e));
				this.$emit("change", e);
			},
		},
	},
	
	"ovo-bfde-stringxx": {
		template: '<ovo-autosize-input :value="value" :defaultValue="defaultValue" @change="change">'
		 + '</ovo-autosize-input>',
		props: {
			value: {},
			defaultValue: {},
		},
		methods: {
			change: function(e) {
				console.log(pcl + "ovo-bfde-string change " + JSON.stringify(e));
				this.$emit("change", e);
			},
		},
	},
	
	"ovo-bfde-comment": {
		template: '<ovo-autosize-input :value="value" @change="change">'
		 + '</ovo-autosize-input>',
		props: {
			value: {},
		},
		methods: {
			change: function(e) {
				console.log(pcl + "ovo-bfde-comment change " + JSON.stringify(e));
				this.$emit("change", e);
			},
		},
	},

};
