/**
2017-5-18  系统死机，正在编辑的文件内容全部变成了空字节。重新开始。
2017-8-25  增加页面数据 mapping，
2017-11-1  重构页面结构 app[page[design[info, widgets, columns, schemas], widgets, columns, schemas, data]]
	app: { 应用由页面page组成
		page: { 页面由静态配置信息design{widget,column,refer,schema}和动态数据信息param,data组成
			design: {
				info: {
					title: 当前页面标题
				},
				widgets: { 当前页面布局部件
					root: { 当前页面布局根部件，起始部件
					},
					"<widget name>": {
							widget用于数据的展现，widget的相关数据data定义为column key，通过widget相同的数据可以有不同的多种展现形式，数据是对象数组，一些widget只针对第一对象进行展现
							widget名字不能包含特殊字符
							widget的嵌套会被自动阻止
						ctl: 引用widget或vue component，缺省为box
							 自动添加 ovo-[<scene>-] 起始标记
							"[[app.]page.]<widget name> | ctl | box | view | grid | table | list | tree | label | string | text | date | check | select | ... <ovo-[<scene>-] control name>",
						cls: {
								定义样式类名称
							"css class name": true,
							...
						},
						css: { 直接指定style
							"style-k": "style-v",
							...
						},
						items: {
							"<item key>": {
								sub widget
							},
							...
						},
						datum: "column key", widget的相关数据,参考column key
						value: {}, datum为空的时候使用的缺省值
						placeholder: {}, datum为空的时候使用的缺省值
					},
				},
				columns: { 布局部件关联的数据定义
					<column key>: { column定义数据来源，数据缓存在context.data中，
								数据来源包括：
									数据库中的数据(data)，通过REST接口获得数据，接口参数可能用到其它column的引用
									其它页面（page.column）中对应的关联数据，
									schema中定义的元数据，
									model.param中提供的参数数据
									静态数据
									* 表达式，用于复杂情况的处理，表达式中可以调用函数方法
						key: {
							type: "", refer | schema | param | static | complex | combine | express(保留)
							val: {}, 静态数据
									static => <value>
							obj: "schema key", 对应schema key
							fld: "field key", 对应schema中的field key
							attr: "attribute name", 对应schema中的field定义的属性
									schema => <class name>.<field key>.<attribute name> 访问schema定义
											  <class name>.<field key> 访问动态加载数据或<class name>.<field key>.default
							key: "", 引用数据
									refer => <refer app>.<refer page>.<column key>
									param => <param key>
							columns：{}, 组合
									complex => 直接合成多个columns，可以嵌套，不允许递归，column之间的数据保持原来的独立状态
									combine => 重组联合多个columns，可以嵌套，不允许递归，column之间的数据会进行交叉重组
							...
									express(保留) => { get: "express return value", set: "express set value vs $V", }
						},
						...
					},
					...
					
				},
				schemas: { 页面相关数据的元数据
					<class name>: {
						src: "http[s]://username:password@server:port/app/version/module/function/path/....?..=..&[column1]=[column2]",  RESTful GET|POST|PUT|DELETE
						fields: {
							field: {
								<attribute>: "attribute value",
								type: "string",
									// *!rel === mapset(string-class name, set[id])
									// tag
									// refer
									// contain
									// depend
									// map(key{primitve}, value{primitve})
									// set(primitve)
									// list(primitve)
									// +json*
								require: true,
								unique: true,
								default: "A1",
								label: "标识",
								title: "DD的标识",
								desc: "标识只能是字母数字的组合",
								...
							},
							...
						},
					},
					...
				},
				<reserved>: {
					refer: { 参考页面 RESTful API
						key: {
													http://u:p@s:p/oo/apps                  
							app: "app name",        http://u:p@s:p/oo/apps/app.name
							page: "page name",      http://u:p@s:p/oo/apps/app.name/pages/page.name
													返回值 like follow，静态design，由设计器编辑或手写编辑，
													design: {
														widgets: {
															...
														},
														columns: {
															...
														},
														refers: {
															...
														},
														schemas: {
															...
														},
													},
							param: {
								key: value,
								...
							},              		运行时，根据参数，解析page内容，动态加载相关数据，根据当前用户权限可能有所不同
													参考页面与当前页面之间的关系 opener | container | link
													page: {
														design: {
															...
														},
														params: {
															...
														},
														datas: {
															...
														},
													}
													page局部数据访问,意义？？分开存储，便于共享
													http://u:p@s:p/oo/apps/app.name/pages/page.name/widgets
													http://u:p@s:p/oo/apps/app.name/pages/page.name/widgets/widget.name 
													http://u:p@s:p/oo/apps/app.name/pages/page.name/columns/column.name
													http://u:p@s:p/oo/apps/app.name/pages/page.name/refers/refer.name
													http://u:p@s:p/oo/apps/app.name/pages/page.name/schemas/schema.name
						},
						...
					},
					...
				},
				schema: { 页面相关数据的元数据
					class: {
						src: "http[s]://username:password@server:port/app/version/module/function/path/....?..=..&[column1]=[column2]",  RESTful GET|POST|PUT|DELETE
						fields: {
							field: {
								<attribute>: "attribute value",
								type: "string",
									// *!rel === mapset(string-class name, set[id])
									// tag
									// refer
									// contain
									// depend
									// map(key{primitve}, value{primitve})
									// set(primitve)
									// list(primitve)
									// +json*
								require: true,
								unique: true,
								default: "A1",
								label: "标识",
								title: "DD的标识",
								desc: "标识只能是字母数字的组合",
								...
							},
							...
						},
					},
					country: {
						src: "http://127.0.0.1/ro/v1/countries",
						fields: {
							id: {},
							name: {},
							value: {},
							desc: {},
						},
					},
					province: {
						src: "http://127.0.0.1/ro/v1/countries/[country.id]/provinces",
						fields: {
							id: {},
							name: {},
							value: {},
							desc: {},
						},
					},
					city: {
						src: "http://127.0.0.1/ro/v1/countries/[country.id]/provinces/[province.id]/cities",
						fields: {
							id: {},
							name: {},
							value: {},
							desc: {},
						},
					},
					District: {
						src: "http://127.0.0.1/ro/v1/countries/[country.id]/provinces/[province.id]/cities/[city.id]/districts",
						fields: {
							id: {},
							name: {},
							value: {},
							desc: {},
						},
					},
					...
				},
			}, // end of design
			param: { 页面参数，仅在运行时有效，
					数据来源：
						1. 从URL解析得到
						2. 从父页面传入
						3. 缺省设置
				key: value,
				...
			},
			widgets: { 运行时widget的实例
				<widget>: {
					define: <指向design中的widget定义>,
					id: "widget id 与对应的 html element id 一致",
					widgets: [
						sub widgets id
					],
				},
				...
			},
			columns: { 运行时column的实例
				<column>: {
					define: <指向design中的column定义>
					dat: 数据
				},
				...
			},
			schemas: { 运行时schema的实例
				<schema>: {
					define: <指向design中的schema定义>
					dat: 数据数组
				},
				...
			},
			data: { 页面相关的缓存数据，仅在运行时有效，数据由多个数据对象数组组成
				objects: [
					{
						field: value,
						...
					},
					...
				],
				...
			},
		},
	},

2018-3-12  整理
	window|document: { 当前HTML
		_: { 依赖 lodash },
		$|JQuery: { 依赖JQuery，JQueryUI },
		Vue: { 依赖Vue },
		VueLoader: { 依赖VueLoader，用于加载可复用Vue组件
			自动增加皮肤和场景属性，以及相关处理过程
		},
		Dabra: { 依赖Dabra，用于数据存取
			cache: { 缓存数据索引，key-value
				key: value, 数组形式的数据集合，
					ads.{ 扩展数组对象的方法
						ods: 数据的字符串形式，用于比对数据变化
						loadtime: 数据加载时间，避免短时间重复读取数据
						src: 数据源REST URL
						url: 实际存取的数据源REST URL
						isChanged: 数据是否被改变
						isArray: 数据是否为数组，纯对象数据会被转化为只有一个元素的数组，回写时转换回对象存储
						...
					},
			},
		},
		ovo: { OVO launcher,
			index: JSON对象索引
			loadData: 加载数据
			saveData: 保存数据
			...
		},
	},
	OVO-VueComponentElement: { 通过ova创建的Vue组件实例，
		ovo: {
			scene: 组件场景
			skin:  皮肤
			page:  { 当前主页面
				url: 
				app:
				design: { 当前页面设计
					widgets: {},
					columns: {},
					schemas: {},
				},
				params: { 页面传入参数
				},
				datas: { 外部数据缓存
				},
				widgets: { 实例化构件布局
				},
				columns: { 关联数据
				},
				schemas: { 元数据
				},
			},
		},
	},
2018-8-1   	重构程序架构 ovo[ovc[ova[vue.loader[vue], data.mapping, dat.accesser[data.access.rest.api], utils[bootstrap, jquery, lodash]]]]
2018-8-1   	确定页面配置结构 app[page[design[info, widgets, columns, schemas]]]
			确定页面实例结构	props[page.context[design[info, widgets, columns, schemas], widget[define], instance.widget[widgets, columns, schemas, data]]]

2018-11-1   重新调整整体架构
			简化程序代码，规范数据样式，减少数据随意性
			明确提示不规范数据的应有样式

2019-7-31   清理废弃代码

 */

var ovo = new function () {
	var me = this;
	// 缺省参数值
	this.default = {
		scene: "",
		skin: "",
		page: { // page context
			url: "",
			app: "",
			design: {
				widgets: {
					root: {
						ctl: undefined,
						css: undefined,
						datum: undefined,
						value: undefined,
						placeholder: undefined,
						items: undefined,
					},
				},           // layout, widget, unit, component, ...
				columns: {}, // variable, tuple, tensor, struct, info ...
				schemas: {}, // meta, schema, data, record, ...
			},
			params: {},
			datas: {},
			widgets: {},
			columns: {},
			schemas: {},
		},
	};
	this.keywords = {
		id: true,
		key: true,
		name: true,
		context: true,
		//
		ctl: true,
		css: true,
		items: true,
		datum: true,
		line: true,
		lines: true,
		//
		scene: true,
		skin: true,
		ovaInheritSkin: true,
		ovaInheritScene: true,
		page: true,
		itmkey: true,
		layout: true,
		widget: true,
		value: true,
		placeholder: true,
		wparent: true,
		define: true,
		itemkey: true,
		//
	};

	var sequence_number = {};
	var sequence_number_fset = {};
	this.AN = function(k, reset, fset) {
		if (!isNaN(reset)) {
			sequence_number[k] = reset;
			sequence_number_fset[k] = fset;
		} else {
			if (sequence_number[k] == undefined) {
				sequence_number[k] = 0;
			} else {
				sequence_number[k]++;
			}
			fset = sequence_number_fset[k];
		}
		if (fset) {
			fset(sequence_number[k]);
		}
		return sequence_number[k];
	};
	
	var data_index = {};
	//运行时数据索引
	// TODO 需要垃圾清理
	this.index = function (d, pd) {
		if ($.type(d) == "string") {
			return data_index[d];
		} else if (d) {
			var id = d.$ovoID && d.$ovoID();
			if (!id) {
				id = "ID" + window.stamp;
				d.$ovoID = function () {
					return id;
				};
				data_index[id] = d;
			}
			if (pd) {
				var pid = $.type(pd) == "string" && pd || pd.$ovoID && pd.$ovoID();
				if (!pid) {
					pid = this.index(pd);
				}
				if (!d.$ovoPID || d.$ovoPID() != pid) {
					d.$ovoPID = function () {
						return pid;
					};
				}
			}
			return id;
		}
	};

	this.cur_js_path = function () {
		var all_js = document.scripts;
		var cur_js = all_js[all_js.length - 1];
		return cur_js.src.substring(0, cur_js.src.lastIndexOf("/"));
	}();

	this.loadComponent = function (component_define) {
		var comdef;
		try {
			if (component_define.constructor == String) {
				comdef = loadjson(this.cur_js_path + "/" + component_define);
			} else {
				comdef = component_define;
			}
			for (var name in comdef) {
				if (!comdef[name].props) {
					comdef[name].props = {};
				}
				if (!comdef[name].props.value) {
					comdef[name].props.value = {};
				}
				if (!comdef[name].props.placeholder) {
					comdef[name].props.placeholder = {};
				}
				Vue.component(name, comdef[name]);
			}
		} catch (e) {
			console.log(pcl + "ovo component loading error: " + e.message);
		}
	};

	this.loadDirective = function (directive_define) {
		var dirdef;
		try {
			if (directive_define.constructor == String) {
				dirdef = loadjson(this.cur_js_path + "/" + directive_define);
			} else {
				dirdef = directive_define;
			}
			for (var name in dirdef) {
				Vue.directive(name, dirdef[name]);
			}
		} catch (e) {
			console.log(pcl + "ovo directive loading error: " + e.message);
		}
	};

	var loadComponents = function () {
		me.loadComponent(ovo_base_view);
		if ("version" == "动态视图定义") {
			me.loadComponent("ovo.ctrl.js");
			me.loadComponent("ovo.app.js");
		} else {
			// development phase, 在 html-head-script 中包含
			me.loadComponent(ovo_ctrl_view);
			me.loadComponent(ovo_app_view);
		}
	};


	var loadDirectives = function () {
		me.loadDirective(ovo_base_dirs);
	};

	var re_abs_url1 = /^\/.*/;
	var re_abs_url2 = /^\w*:\/\/.*/;
	var _toAbsoluteURL = function(url, homepath) {
		if (!(re_abs_url1.test(url) || re_abs_url2.test(url))) {
			// 相对路径改为绝对路径
			return homepath+"/"+url;
		}
		return url;
	};

	this.ovoParentPath = this.cur_js_path.substring(0, this.cur_js_path.lastIndexOf("/"));
	this.load = function(pn) {
		pn = _toAbsoluteURL(pn, this.ovoParentPath);
		if (pn.substring(pn.length-5, pn.length)!=".json") {
			// 增加文件后缀名
			pn += ".json";
		}
		return window.loadjson(pn);
	};
	
	this.dar_dats = "/oo";
	this.toAbsoluteURL = function(url) {
		return _toAbsoluteURL(url, this.dar_dats);
	};
	
	this.dar_apps = "/oo/apps";
	var pdcache = {};
	this.loadPageDesign = function(appname, pagename) {
		try{
			var url = appname+"/pages/"+pagename+".json";
			if (url[0]!="/") {
				url = this.dar_apps+"/"+url;
			}
			return this.loadData(pdcache, url, url);
		}catch(e){
			throw("load page design " + appname + "." + pagename + " error: " + e.message);
		}
	};
	this.loadData = function(cache, objname, datasrc) {
		var dat = cache[objname] = DAR.load(datasrc);
		
		return dat;
	};
	this.saveData = function(dat) {
		DAR.save(dat);
	};
	this.saveDataAll = function(cache) {
		for(objname in cache) {
			var dat = cache[objname];
			this.saveData(dat);
		}
	};
		
	this.render = function (e, d) {
		loadDirectives();
		loadComponents();
		var p = d.page;
		document.title = p.design && p.design.info && p.design.info.title
					|| p.params&&(p.params.app+" "+p.params.page)
					|| "ovo";
		$(e).html('<ovo tabIndex="-1"></ovo>');
		this.vm = new Vue({
				el: e,
				data: d,
			});
		return this.vm;
	};

	Vue.mixin({
		beforeCreate: function() {
			// 自动增加事件传递
			if (!this._events.message) {
				this._events.message = [function(e){
					if (this.$parent) {
						this.$parent.$emit("message", e);
					}
				}];
			}
			if (!this._events.change) {
				this._events.change = [function(e){
					if (this.$parent) {
						this.$parent.$emit("change", e);
					}
				}];
			}
			if (!this._events.action) {
				this._events.action = [function(e){
					if (this.$parent) {
						this.$parent.$emit("action", e);
					}
				}];
			}
			if (!this._events.error) {
				this._events.error = [function(e){
					if (this.$parent) {
						this.$parent.$emit("error", e);
					}
				}];
			}
		},
	});

	{
		document.onreadystatechange = function() {
			if (document.readyState == "complete") {
				console.log("ovo start!");
				var model = $.extend(true, {}, ovo.default);
				if (document.location.search) {
					var re = /[?&]([^\=]+)=([^\&]*)/g;
					var arr;  
					while ((arr = re.exec(document.location.search)) != null) {
						model.page.params[arr[1]] = arr[2];
					}
				}
				if (!model.page.params.app) {
					model.page.params.app="ovo";
				}
				if (!model.page.params.page) {
					model.page.params.page="home";
				}
				//console.log(pcl+"model.page.params:"+o2s(model.page.params));
				var pd = ovo.loadPageDesign(model.page.params.app, model.page.params.page)
				pd.onchange = function(){
					model.page.url = pd.url();
					model.page.app = model.page.params.app;
					model.page.name = model.page.params.page;
					model.page.design = pd.values[0];
					//console.log(pcl+"model.page.design"+o2s(model.page.design));
					model.scene=model.page.params.app;
					ovo.render("#ovo_container", model);
				};
			}
		};
	}
	
	return this;
}();



ovo.updateValue = Vue.updateValue;
ovo.delaySetValue = Vue.delaySetValue;


ovo.schemaGenerateByLayout = function(layout) {
	var simple_datum = /^[a-zA-Z]\w*(\s*\.\s*\w+)*$/;
	var genProps = function(props, widget, cp) {
			var pp = cp?cp:props;
			if ($.type(widget.datum)=="string" && simple_datum.test(widget.datum.trim())) {
				var ps = widget.datum.split(".");
				var vp = props;
				for (var i = 0; i<ps.length; i++) {
					var tp = vp[ps[i]];
					if (!tp) {
						vp[ps[i]] = tp = {};
					}
					vp = tp;
				}
				pp = vp;
			}
			if (widget.field) {
				pp = pp[widget.field] = {};
			}
			if (widget.type) {
				pp.type = widget.type;
			}
			if (widget.attr) {
				pp[widget.attr] = widget.value;
			}
			if (widget.items) {
				for(var i = 0; i < widget.items.length; i++) {
					var sw = widget.items[i];
					genProps(props, sw, pp);
				}
			}
			if (widget.title) {
				pp.title = widget.title;
			}
			return props;
		};
		
	var props = genProps({}, layout.root);
	return {props: props};
};

ovo.isField = function(schema) {
	var s = 0;
	var o = 0;
	for(var k in schema) {
		var f = schema[k];
		if (f != null) {
			if ($.type(f) == "object") {
				o++;
			} else if ($.type(f) == "string" || $.type(f) == "boolean" || $.type(f) == "number") {
				s++;
			} else {
				console.error(pcl + "元数据描述信息只能为基本类型，忽略 " + $.type(f) + " " + k + "");
			}
		}
	}
	return (o == 0 || s > 0);
};

ovo.layoutGenerateWidget = function(layout, schema, fieldname) {
	if (!layout.items) {
		layout.items = [];
	}
	layout.items.push({ctl:"label", filed: fieldname, css:{"justify-content":"center",}, value: fieldname.toUpperCase(),});
	for(var k in schema) {
		var f = schema[k];
		if (ovo.isField(f)) {
			var field = {ctl:"field", datum: fieldname, field: k};
			layout.items.push(field);
		} else {
			var widget = {ctl: "datum", css:{"flex-flow":"column","align-items":"stretch",}, datum: (fieldname?(fieldname+"."):"")+k};
			ovo.layoutGenerateWidget(widget, f, (fieldname?(fieldname+"."):"")+k);
			layout.items.push(widget);
		}
	}
};


var ovo_base_dirs = {
	"delay-set-value": {
		bind: function (el, binding, vnode) {
			/* 
				延迟设置要显示的数据，用于大量数据显示输出，避免界面阻塞
				usage in render:
					createElement(tag, 
						{
							...
							directives: [ {
								name: 'delay-set-value', 
								value: {
									me: this,
									dd: this.view_object_or_array,
									sd: this.org_object_or_array,
									ok: function(){
										me.view_object_or_array = me.org_object_or_array;
										// 最终保证数据一致，响应数据变化
									}
								} }
							],
							...
						}
					)
				usage in template:
					<...     v-delay-set-value="{me: this, dd: this.view_object_or_array, sd: this.org_object_or_array, ok: function(){ me.view_object_or_array = me.org_object_or_array; }}" ...>
			*/
			var me = vnode.context;
			var md = binding.value;
			ovo.delaySetValue(me, md.dd, md.sd, md.ok);
		},
	},
};

ovo.actionsChain = function(cvci, action, value, defaultproc) {
	//事件转换为动作链方法调用,调用顺序就是当前按钮在组件树中自底向上的组件路径中对应的方法
	//组件路径的一般形式是
	//root -> ovo -> ovc -> ova -> [custom vue component] -> ctl -> ... -> ova -> [custom vue component] -> ctl -> button
	//除了 root -> ovo -> ovc -> ova 之外, 越顶级越接近应用层, 因此需要降低ovo ovc ova的优先级
	//不允许调用root的方法
	//不允许跨应用调用
	//已经找过的组件不再找，降低box, ctl之类的基础组件优先级
	//ovo ovc ova作为底层支撑组件，优先级最低
	//调整后的组件方法寻找调用顺序是
	//[custom vue component] -> ... -> [base vue component] -> box -> ctl -> button -> ova -> ovc -> ovo
	//根据方法返回值决定是否继续下一级调用
	action = "action"+(action[0]).toUpperCase()+action.substring(1);
	var actionsChain = cvci.actionsChain;
	if (!actionsChain) {
		actionsChain = cvci.actionsChain = [];
		var tafs = {};
		var vc = cvci;
		while(vc) {
			var tag = vc.vctag;
			var af = typeof(vc[action])=="function" && vc[action];
			if (af && (true || !tafs[tag])) {
				if (tag == "ovo" || tag == "ovc" || tag == "ova") {
					actionsChain.splice(0,0,af);
				} else {
					actionsChain.push(af);
				}
				tafs[tag] = af;
			}
			//截止到ovo, 防止跨应用调用
			vc = tag && tag!="ovo" && vc.$parent;
		}
	}
	if (actionsChain.length>0) {
		var v = value;
		for(var i=actionsChain.length-1; i>=0; i--) {
			v = actionsChain[i](v);
			if (v===undefined) {
				//方法返回值为 undefined，则终止下一动作链方法调用
				i = 0;
			}
		}
	} else {
		if (defaultproc) {
			defaultproc();
		}
	}
};

var ovo_base_view = {
	"ovo": {
		// 页面入口
		props: {
			scene: {},
			skin: {},
			page: {},
		},
		computed: {
			cscene: function() {
				var scene = this.scene || this.$root.scene || ovo.default.scene;
				if (scene) {
					scene = scene=="ovo"?"ovo":("ovo-"+scene);
				}
				return scene;
			},
			cpage: function() {
				var ctx = this.page || this.$root.page;
				Vue.completeValue(ctx, $.clone(ovo.default.page)); //补充完整page context
				return ctx;
			},
			cskin: function() {
				return this.skin
					|| (this.cpage.columns["ovo-skin"] && this.cpage.columns["ovo-skin"].dat && this.cpage.columns["ovo-skin"].dat.key)
					|| this.$root.skin
					|| ovo.default.skin;
			},
		},
		render: function (h) {
			var vm = this.$vnode.context;
			var attrs = {};
			//修正传入参数
			//传入参数 scene, skin, page
			attrs.scene = this.cscene;
			attrs.context = this.cpage;
			attrs.skin = this.cskin;
			//确定下级组件参数 itmkey, widget, value
			attrs.itmkey = "root"; //ovo固定显示root widget
			attrs.widget = attrs.context.design && attrs.context.design.widgets && attrs.context.design.widgets[attrs.itmkey];
			//缺省事件处理
			var me = this;
			var oepc = this.$vnode.context._events.change;
			var oepe = this.$vnode.context._events.error;
			var oepa = this.$vnode.context._events.action;
			var events = {
					error: function(e) {
						me.$emit("error", e);
					},
					message: function(e) {
						if (me.cpage.columns["ovo-message"]) {
							me.cpage.columns["ovo-message"].dat = e;
						}
						me.$emit("message", e);
					},
					change: function(e) {
						console.log(pcl + "ovo change {" + Object.keys(e).join(":{...}") + ":{...}}");
						// 如果应用没有定义 on.change ，那么在这里定义缺省 on.change 处理
						if (!oepc) {
							if (e.page) {
								ovo.updateValue(attrs.context, e.page);
							}
							if (e.skin != null) {
								attrs.skin = e.skin;
							}
							if (e.scene) {
								attrs.scene = e.scene;
							}
						}
						me.$emit("change", e);
					},
					action: function(e) {
						me.$emit("action", e);
					},
				};
			return h("ovc", 
				{
					attrs: attrs,
					on: events,
				}, this.$children);
		},
	},
	"ovc": {
		// 组件入口
		props: {
			//传递参数
			scene: {},
			skin: {},
			context: {},
			//应用参数
			itmkey: {}, //当前widget的item key, 在父级widget.items中的key
			widget: {}, //展现对象
			value: {},  //展现数据，父级向子级传递参数
			placeholder: {}, //占位符数据
		},
		computed: {
			citmkey: function() {
				return this.itmkey || ("o"+ovo.AN("o")); //匿名widget名称显示为 "o<N>"
			},
			cwidget: function() {
				var widget = this.widget || this.context && this.context.design.widgets[this.citmkey] || {};
				return widget;
			},
		},
		render: function (h) {
			var me = this;
			var attrs = {};
			//下级组件参数
			attrs.context = this.context;
			attrs.itmkey = this.citmkey;
			attrs.layout = attrs.itmkey;
			attrs.widget = this.cwidget;
			attrs.value = this.value || attrs.widget.value || undefined;
			attrs.placeholder = this.placeholder || attrs.widget.placeholder || undefined;
			//CSS参数，自动添加layout-<widget name>
			var cls = {};
			cls["ovo-layout-"+attrs.itmkey]=true;
			var events = {
					error: function(e) {
						console.error(pcl + "Error：" + e.message);
						me.$emit("error", e);
					},
					message: function(e) {
						me.$emit("message", e);
					},
					change: function(e) {
						console.log(pcl + "ovc change {" + Object.keys(e).join(":{...}") + ":{...}}");
						me.$emit("change", e);
					},
					action: function(e) {
						me.$emit("action", e);
					},
				};
			return h("ova", 
				{
					'class': cls,
					attrs: attrs,
					on: events,
				}, this.$children);
		},
	},
	"ova": {
		// ovo 核心实现，不建议应用直接使用这个组件，应该使用 ovo或ovc 简化代理
		props: {
			//传递参数
			id: { default: null },
			context: {},
			layout: {}, //展现名称
			//应用参数
			itmkey: {}, //当前widget的item key, 在父级widget.items中的key index
			widget: {}, //展现对象定义
			//父级向子级传递的数据参数
			vline: { default: 0 },          //当前widget的value line, 当前value是父级value数据数组中的一个，vline代表其索引位置，如果父级value数据不是数组，vline为0
			vfield: { default: "-" },       //当前widget的value在父级value对象中的属性名，"-"表示当前value是父级value数据数组中的一个完整数据
			value: { default: undefined },  //展现数据，数据优先级最高，会覆盖widget中的定义，undefined表示使用widget中定义的数据
			placeholder: { default: undefined }, //指定展现数据占位符，会覆盖widget中的定义，undefined表示使用widget中定义的展现数据占位符
			//父级widget实例
			wparent: { default: null },
		},
		data: function() {
			return {
				vstamp: 0,
				value_source: undefined,
				mounted: false,
				referWidgetContext: undefined,
				subwidgetids: {},
			};
		},
		computed: {
			normWidget: function() { 
				var iwidget = {};
				//widget参数修正，ova只接受对象形式的widget定义
				if ($.type(this.widget) == "string") {
					iwidget = { ctl: this.widget };
				} else {
					//使用副本创建widget，以避免重用widget时导致的数据混乱
					iwidget = JSON.parse(JSON.stringify(this.widget));
				}
				iwidget.define = this.widget;
				return iwidget;
			},
			wid: function() {
				return this.id || ("ID"+window.stamp);
			},
			instWidget: function() { //widget的实例
				var iwidget = this.normWidget;
				iwidget.widgets = [];
				Object.defineProperty(iwidget, "context", {
						enumerable: false,
						configurable: true,
						value: this.context,
						writable: false,
					});
				iwidget.id = this.wid;//this.wparent && this.wparent.referwidgetinfo && this.wparent.id || ("ID"+window.stamp);
				iwidget.wparent = this.wparent;
				iwidget.referwidgetinfo = this.referWidgetInfo;
				var pcw = this.wparent;
				while(pcw && pcw.referwidgetinfo) {
					if ($.type(pcw.define)!="string") {
						var nwdgt = JSON.parse(JSON.stringify(pcw.define));
						delete nwdgt.ctl;
						//引用widget的属性覆盖当前widget的属性
						iwidget = $.extend(true, iwidget, nwdgt);
					}
					pcw = pcw.wparent;
				}
				iwidget.itemkey = this.itmkey;
				if (this.wparent) {
				//	this.wparent.widgets.push(iwidget.id);
				} else {
					//root or instant
					this.context.widgets[this.itmkey] = iwidget;
				}
				iwidget.wvalue = this.wvalue;
				return iwidget;
			},
			referWidgetInfo: function() {
				// 获取引用widget
				var refwgt = this.widget.ctl || ($.type(this.widget)=="string" && this.widget) || "";
				var sw = refwgt;
				var rwctx = this.context;
				var iw = sw.lastIndexOf(".");
				if (iw >= 0) {
					// 引用的是外部widget，其它页面的widget
					var sa = "";
					var sp = sw.substring(0, iw);
					sw = sw.substring(iw+1).trim();
					var ip = sp.lastIndexOf(".");
					if (ip>=0) {
						// 引用的是外部页面，其它应用的页面
						// 可以共享常用功能，常用widget
						sa = sp.substring(0, ip).trim();
						sp = sp.substring(ip+1).trim();
					}
					if (sp) {
						// 引用外部页面，需要动态加载相关页面
						if (this.referWidgetContext && this.referWidgetContext.referwidgetpath==refwgt) {
							//外部页面加载完毕
							console.log("referWidgetContext changed "+refwgt);
							return 	this.getReferWidgetInfo(this.referWidgetContext, refwgt, this.layout, iw, sw);
						}
						var ovame = this;
						var app = sa||this.page.app;
						var pd = ovo.loadPageDesign(app, sp);
						pd.onchange = function(){
								// 与当前页面使用相同的参数和数据
								rwctx = $.extend({}, rwctx);
								rwctx.url = pd.url();
								rwctx.app = app;
								rwctx.name = sp;
								rwctx.design = pd.values[0];
								rwctx.referwidgetpath = refwgt;
								ovame.referWidgetContext = rwctx;
								console.log("referWidgetContext loaded "+refwgt);
							};
						//引用页面加载中，返回临时数据
						console.log("referWidgetContext is loading "+refwgt);
						this.referWidgetContext = rwctx;
						return {
								context: rwctx,
								refwgt: refwgt,
								widget: {},
								widgetName: "rwtemp"+ovo.AN("rwtemp"),
							};
					}
				}
				this.referWidgetContext = rwctx;
				return this.getReferWidgetInfo(rwctx, refwgt, this.layout, iw, sw);;
			},
			subWidgets: function() {
				return this.instWidget.define.items;
			},
			design: function() {
				return this.context.design;
			},
			page: function() {
				return this.context;
			},
			columns: function() {
				return LDA.getColumn(this.page, "*", this, null, this.vstamp);
			},
			wplaceholder: function() {
				var value_placeholder;
				if (this.placeholder) {
					//参数指定
					value_placeholder = this.placeholder;
				} else if (this.normWidget.datum) {
					//通过column获取
					//console.log("get placeholder from page design "+ovo.index(this.design)+" column "+ovo.index(this.columns));
					var col = this.column;
					value_placeholder = col.default;
				} else {
					//widget指定
					//console.log("get placeholder from page design "+ovo.index(this.design));
					value_placeholder = this.normWidget.placeholder;
				}
				//console.log("placeholder="+o2s(value_placeholder));
				return value_placeholder || null;
			},
			schema: function() {
				//schema内部没有使用this.mounted，只是为了激活computed变量，使其重新计算
				if (this.instWidget.schema) {
					return this.getSchema(this.page, this.instWidget.schema, null, this.mounted);
				} else {
					return null;
				}
			},
			column: function() {
				//this.vstamp作为getColumn的参数不起作用，
				//其目的是当this.vstamp改变时激活computed变量，使其重新计算
				//this作为即将获取的column的referer，column的改变会触发所有referer的vstamp的改变
				//从而激活computed变量，使其重新计算，触发界面数据刷新
				if (this.normWidget.datum) {
					return LDA.getColumn(this.page, this.normWidget.datum, this, null, this.vstamp);
				}
				return null;
			},
			columnValue: {
				get: function() {
					var col = this.column;
					return col.dat;
				},
				set: function(v) {
					var col = this.column;
					if (col) {
						col.dat = v;
						//console.log("set value to page design "+ovo.index(this.design)+" column "+ovo.index(this.columns));
					} else {
						console.warn("set column value failed.");
					}
				},
			},
			wvalue: {
				get: function() {
					if (this.value !== undefined) {
						//通过传入参数给定的值
						this.value_source = "param";
						return this.value;
					}
					if (this.normWidget.datum) {
						//通过datum定义的column变量值
						//console.log("get value from page design "+ovo.index(this.design)+" column "+ovo.index(this.columns));
						var v = this.columnValue;
						if (v != undefined) {
							this.value_source = "datum";
							return v;
						}
					}
					this.value_source = "static";
					//通过design设置的静态值
					//console.log("get value from page design "+ovo.index(this.design));
					return this.normWidget.value;
				},
				set: function(v) {
					if (this.value_source == "param") {
						this.$emit("change", {value: v, vline: this.vline, vfield: this.vfield});
					} else if (this.value_source == "datum") {
						this.columnValue = v;
					} else {
						//this.value_source == "static"
						//console.log("set value to page design "+ovo.index(this.design));
						this.normWidget.value = v;
					}
				},
			},
			wvstring: function() {
				return typeof(this.wvalue)=="string"?this.wvalue:$.rro2s(this.wvalue);
			},
		},
		mounted: function() {
			this.mounted = true;
		},
		methods: {
			getReferWidgetInfo: function(rwctx, refwgt, layout, iw, sw) {
				var rwgt = rwctx && rwctx.design && rwctx.design.widgets && rwctx.design.widgets[sw];
				if (rwgt) {
					var wn = sw.replace(/\./g, "-");
					if (layout.indexOf("_"+wn) > 0) {
						//widget不能嵌套使用
						console.warn("终止Widget嵌套引用");
						console.log("Cancel widget loop refer "+layout + "     " + wn);
					} else {
						//引用widget
						//console.log("--> "+layout + "     " + wn);
						//返回 refer widget context
						return {
							context: rwctx,
							refwgt: refwgt,
							widget: rwgt,
							widgetName: wn,
						};
					}
				} else {
					if (iw >= 0) {
						console.warn("找不到外部Widget引用"+layout + "     " + refwgt);
					}
				}
				return null;
			},
			buildReferWidget: function(h, rwctx) {
				var me = this;
				var layout_name = (this.layout+"_"+rwctx.widgetName);
				var id = this.id;
				this.instWidget.widgets.push(id);
				return h("ova", {
						attrs: {
							//主参数
							id: id,
							context: rwctx.context,
							layout: layout_name,
							itmkey: this.itmkey,
							widget: rwctx.widget,
							vline: this.vline,
							vfield: this.vfield,
							value: this.wvalue,
							placeholder: this.wplaceholder,
							//向上索引
							wparent: this.instWidget,
						},
						on: {
							change: function(e) {
								//console.log(pcl + "ova " + me.instWidget.id + " change " + JSON.stringify(e));
								console.log(pcl + "ova refer " + me.layout + " [" + me.instWidget.id + "] change");
								if (e.value != null) {
									try {
										me.wvalue = e.value;
									} catch(ex) {
										me.$emit("error", {message: ex.message});
									}
								} else {
									me.$emit("change", e);
								}
							},
							error : function(e) {
								me.$emit("error", e);
							},
							message: function(e) {
								me.$emit("message", e);
							},
							action : function(e) {
								me.onaction(e);
							},
						},
					});
			},
			referWidget: function(h) {
				// 创建引用widget
				if (this.instWidget.referwidgetinfo) {
					return this.buildReferWidget(h, this.instWidget.referwidgetinfo);
				}
				return null;
			},
			buildSubWidget: function(h, itmkey, subwidget, vline, vfield, value, placeholder) {
				var me = this;
				var layout_name = (this.layout + "-v" + vline + "-" + vfield);
				var id = this.subwidgetids[layout_name];
				if (!id) {
					this.subwidgetids[layout_name] = id = ("ID"+window.stamp);
				}
				this.instWidget.widgets.push(id);
				return h("ova", {
						attrs: {
							//主参数
							id: id,
							context: this.context,
							layout: layout_name,
							itmkey: itmkey,
							widget: subwidget,
							vline: vline,
							vfield: vfield,
							value: value,
							placeholder: placeholder,
							//向上索引
							wparent: this.instWidget,
						},
						on: {
							change: function(e) {
								// ?? 需要贴近vue组件的设计, 利用props, 匹配value的数据结构, 改动会比较大
								// props定义了组件可接收数据的结构, 可以与value的数据结构匹配, 这样就不需要自己解析这么多东西了, 会简化很多
								console.log(pcl + "ova item " + me.itmkey + "_" + me.vline + " " + me.layout + " [" + me.instWidget.id + "] change e.vline=" + e.vline+" e.vfield=" + e.vfield);
								if (e.value!=null && e.vline!=null && e.vfield!=null) {
									try {
										if (me.wvalue && ($.type(me.wvalue)=="object"||me.wvalue instanceof Array)) {
											if ($.type(me.wvalue[e.vline])=="object"||me.wvalue[e.vline] instanceof Array) {
												me.wvalue[e.vline][e.vfield] = e.value;
											} else {
												me.wvalue[e.vfield] = e.value;
											}
											me.wvalue = me.wvalue;
										} else {
											me.$emit("change", e);
										}
									} catch(ex) {
										me.$emit("error", {message: ex.message});
									}
								} else {
									me.$emit("change", e);
								}
							},
							error : function(e) {
								me.$emit("error", e);
							},
							message: function(e) {
								me.$emit("message", e);
							},
							action : function(e) {
								me.onaction(e);
							},
						},
					});
			},
			widgetItems: function(h, items) {
				//**
				//** 当前widget的value为数组，根据数组长度创建多组Widget Items
				//**
				//** wvalue: [
				//**   {
				//**     每个数据元素是一个对象，对应每个数据元素创建一组Widget Items
				//**     数据对象的属性名与Widget Items Key或索引一致
				//**     itmkey: [...]
				//**   }
				//** ]
				//** 不影响当前widget对应的ctl对value的使用
				//** 
				//** 容器类widget value强制为数组，自动复制容器内的所有items，数组中每个数据对应一套复制的items
				//** 非容器类widget value为数组时，widget需自行处理
				//**
				var ses = [];
				var wv = this.wvalue; //多行数据
				var wvs = (wv instanceof Array)?wv:[wv];
				//wplaceholder 父级指定占位符
				var wp = this.wplaceholder;
				var wps = (wp instanceof Array)?wp:[wp];
				for (var wvi=0; wvi<wvs.length; wvi++) {
					var xwv = wvs[wvi]; //一行数据
					for (var ik in items) {
						var subwidget = items[ik];
						var vfield = subwidget.field || subwidget.datum || ik; //没有指定字段的情况下，缺省使用item key
						var v = vfield=="-" && xwv || xwv && xwv[vfield]; //一个字段，指定字段为"-"，表示整行数据
						var p = wps[wvi%wps.length]; //循环使用多个指定的占位符
						p = p && p[vfield] || p;  //指定字段使用占位符
						ses.push(this.buildSubWidget(h, ik, subwidget, wvi, vfield, v, p));
					}
				}
				return ses;
			},
			getSchema: function(page, name, refcolumn, mounted) {
				return LDA.getSchema(page, name, refcolumn, mounted);
			},
			saveData: function(datum) {
				dtm = (datum instanceof Array)?datum:[datum];
				for(var i=0; i<dtm.length; i++) {
					var col = LDA.getColumn(this.page, dtm[i]);
					col.save();
				}
			},
			actionTodo: function(v) {
				console.log(pcl + this.layout + " button action "+o2s(v));
				return v;
			},
			onaction: function(e) {
				var me = this;
				if (e.value == "save") {
					me.saveData(e.datum);
					me.$emit("change", {});
				} else if (e.value == "submit") {
					me.saveData(e.datum);
					me.$emit("change", {});
				} else if (e.value == "new") {
					if (me.value_source=="datum" && (me.instWidget.datum == e.datum || e.datum == null)) {
						//当前widget设置了datum
						var schema = me.getSchema(me.page, me.instWidget.datum);
						schema.newObject(e.vline);
						me.$emit("change", {}); //刷新父级widget
					} else {
						//使用最接近设置了相同datum的widget的数据行vline信息 作为要操作的数据行
						var ne = {value: e.value, vline: me.vline, datum: e.datum};
						if (ne.datum === undefined) {
							//使用最接近的明确设置的datum
							ne.datum = me.instWidget.schema || me.instWidget.datum || null;
						}
						me.$emit("action", ne);
					}
				} else if (e.value == "add") {
					if (me.value_source=="datum" && (me.instWidget.datum == e.datum || e.datum == null)) {
						//当前widget设置了datum
						var schema = me.getSchema(me.page, me.instWidget.datum);
						schema.newObject(e.vline+1);
						me.$emit("change", {}); //刷新父级widget
					} else {
						//使用最接近设置了相同datum的widget的数据行vline信息 作为要操作的数据行
						var ne = {value: e.value, vline: me.vline, datum: e.datum};
						if (ne.datum === undefined) {
							//使用最接近的明确设置的datum
							ne.datum = me.instWidget.schema || me.instWidget.datum || null;
						}
						me.$emit("action", ne);
					}
				} else if (e.value == "del") {
					if (me.value_source=="datum" && (me.instWidget.datum == e.datum || e.datum == null)) {
						//当前widget设置了datum
						var schema = me.getSchema(me.page, me.instWidget.datum);
						schema.delObject(e.vline);
						me.$emit("change", {}); //刷新父级widget
					} else {
						//使用最接近设置了相同datum的widget的数据行vline信息 作为要操作的数据行
						var ne = {value: e.value, vline: me.vline, datum: e.datum};
						if (ne.datum === undefined) {
							//使用最接近的明确设置的datum
							ne.datum = me.instWidget.schema || me.instWidget.datum || null;
						}
						me.$emit("action", ne);
					}
				} else {
					me.$emit("action", e);
				}
			},
		},
		render: function(h) {
			var me = this;
			console.log("ova render "+this.layout);
			//引用widget处理
			var rw = this.referWidget(h);
			if (rw) {
				// 引用widget在处理过程中，已经覆盖了当前widget的属性
				return rw;
			}
			//包含widget处理
			var ses = this.widgetItems(h, this.subWidgets);
			//widget输出
			// specific class
			var cls = $.extend({},this.instWidget.cls);
			// specific style
			var css = $.extend({},this.instWidget.css);
			// ensure widget ctl
			var ctl = this.instWidget.ctl || "box";
			var vc = (this.ovaInheritScene && Vue.component(this.ovaInheritScene + "-" + ctl)) || Vue.component("ovo-" + ctl);
			if (!vc) {
				ctl = "box";
				vc=Vue.component("ovo-box");
			}
			var vctag = vc.options.name;
			if (ses.length == 0 && this.wvalue && (ctl == "ctl" || ctl == "box" || ctl == "view")) {
				ses.push(h("pre", {style:{width:"100%",height:"100%"}}, this.wvstring));
			}
			var vcprops = vc.options.props;
			// all attributes
			var attrs = {};
			for(var k in this.instWidget) {
				if (k[0] != '$' && ovo.keywords[k]==undefined) {
					var val = this.instWidget[k];
					if (vcprops[k]!=undefined && typeof(val)=="string" && this.columns.dat[val]!=undefined) {
						attrs[k] = this.columns.dat[val];
					} else {
						attrs[k] = val;
					}
					attrs[k] = val;
				}
			}
			if (ctl == "grid" || ctl == "table") {
				attrs.cols = Object.keys(this.instWidget.items).length || 1;
			}
			if (ctl == "table") {
				attrs.header = this.widgetItems(h, this.instWidget.define.header);
				attrs.tailer = this.widgetItems(h, this.instWidget.define.tailer);
			}
			if (this.instWidget.schema) {
				attrs.schema = this.schema; 
				//这没写错！schema: function() {
				//schema 是LDA.schema实例 
			}
			if (this.instWidget.title) {
				attrs.title = this.instWidget.title;
			}
			// 外层定义的值覆盖内层定义的值
			attrs.id = this.instWidget.id;
			if (this.wvalue != null) {
				attrs.value = this.wvalue;
			}
			if (this.wplaceholder != null) {
				attrs.placeholder = this.wplaceholder;
			}
			// change event
			var events = {
					error: function(e) {
						me.$emit("error", e);
					},
					message: function(e) {
						me.$emit("message", e);
					},
					change: function(e) {
						console.log(pcl + "ova " + me.layout + " [" + me.instWidget.id + "] " + vctag + " value change");
						if (e.value != null) {
							try {
								me.wvalue = e.value;
							} catch(ex) {
								me.$emit("error", {message: ex.message});
							}
						} else {
							me.$emit("change", e);
						}
					},
					action: function(e) {
						me.onaction(e);
					},
				};
			return h(vctag, 
				{
					style: css,
					'class': cls,
					attrs: attrs,
					on: events,
				}, ses);
		},
	},
	/** 控件 ctl 无参数 */
	"ovo-ctl": {
		template: '<div><slot></slot></div>',
	},
	/** 盒子 box 无参数 */
	"ovo-box": {
		//ovc-是标记性质的class名称前缀
		//ovc-cell是具有容器性质的组件标记
		template: '<ovo-ctl class="ovc-cell"><slot></slot></ovo-ctl>',
	},
	/** 视图 view 无参数 */
	"ovo-view": {
		template: '<ovo-box><slot></slot></ovo-box>',
	},
	"ovo-vm-box": {
		template: '<ovo-box><slot></slot></ovo-box>',
	},
	"ovo-vt-box": {
		template: '<ovo-box><slot></slot></ovo-box>',
	},
	"ovo-vb-box": {
		template: '<ovo-box><slot></slot></ovo-box>',
	},
	"ovo-hl-box": {
		template: '<ovo-box><slot></slot></ovo-box>',
	},
	"ovo-hc-box": {
		template: '<ovo-box><slot></slot></ovo-box>',
	},
	"ovo-hr-box": {
		template: '<ovo-box><slot></slot></ovo-box>',
	},
	/** 网格 grid 接收cols参数 */
	"ovo-grid": {
		render: function(h) {
			var scs = this.$slots.default;
			var rows = [];
			if (!(scs && scs.length)) {
				scs = [""];
			}
			for (var n = 0, r = 0; n<scs.length; r++) {
				var cells = [];
				for (var c=0; n<scs.length && c<this.cols; c++, n++) {
					var cls = {'ovo-grid-column':true};
					cls['ovo-grid-column-'+c] = true;
					cls['ovo-grid-cell'] = true;
					cls['ovo-grid-cell-'+r+"-"+c] = true;
					cls['ovc-cell'] = true;
					var cell = h("ovo-ctl", {'class':cls,}, [scs[n]]);
					cells.push(cell);
				}
				var cls = {'ovo-grid-row':true};
				cls['ovo-grid-row-'+r] = true;
				var row = h("ovo-ctl", {'class':cls,}, cells);
				rows.push(row);
			}
			return h("ovo-ctl", {}, rows);
		},
		props: {
			cols: { default: 3, },
		},
	},
	/** 表格 table 接收一维数组类型的caption, 二维数组类型的data参数，
	 *  如果caption不是数组类型，那么caption将被包装到一个数组中
	 *  如果data不是二维数组类型，那么data将被包装到1x1数组
	 *  数组中的数据可以是 基本类型（字符串、数值、布尔）或 widget对象
	 */
	"ovo-table": {
		methods: {
			rows: function(h, children, cols, td_th_cell, css) {
				var rows = [];
				if (children) {
					for (var n = 0, r = 0; n<children.length; r++) {
						var cells = [];
						for (var c=0; n<children.length && c<cols; c++, n++) {
							var cls = {};
							cls['ovo-table-column'] = true;
							cls['ovo-table-column-'+c] = true;
							cls['ovo-table-cell'] = true;
							cls['ovo-table-cell-'+r+"-"+c] = true;
							cls['ovc-cell'] = true;
							var cell = h(td_th_cell, {'class':cls,}, [children[n]]);
							cells.push(cell);
						}
						var cls = css || {};
						cls['ovo-table-row'] = true;
						cls['ovo-table-row-'+r] = true;
						if (td_th_cell=="th") {
							cls['ovo-table-head'] = true;
						}
						var row = h("tr", {'class':cls,}, cells);
						rows.push(row);
					}
				}
				return rows;
			},
		},
		render: function(h) {
			var rows = [];
			rows = rows.concat(this.rows(h, this.header, this.cols, "th", this.headercss));
			var scs = this.$slots.default;
			if (!(scs && scs.length)) {
				scs = [""];
			}
			rows = rows.concat(this.rows(h, scs, this.cols, "td", this.rowstyle));
			rows = rows.concat(this.rows(h, this.tailer, this.cols, "th", this.tailercss));
			var table = h("table", {}, rows);
			return h("ovo-ctl", {}, [table]);
		},
		props: {
			cols: { default: 3, },
			rowstyle: {},
			header: {},
			headercss: {},
			footer: {},
			footercss: {},
		},
	},
	"ovo-tablex": {
		template: '<ovo-ctl><table>'
				+'<tr v-if="caa"><th v-for="ca,ci in caa" :colspan="ca.colspan" :rowspan="ca.rowspan">'
				+'<ovc :layout="ca" :schema="schema" :data="data"></ovc>'
				+'</th></tr>'
				+'<tr v-for="dda,ri in ddaa"><td v-for="dd,di in dda" :colspan="dd.colspan" :rowspan="dd.rowspan" :width="dd.width" :height="dd.height">'
				+'<ovc :layout="dd" :schema="schema" :data="data"></ovc>'
				+'</td></tr>'
				+'</table></ovo-ctl>',
		props: {
			schema: {},
			data: {},
			caption: { },
			dataset: { },
		},
		computed: {
			caa: function() {
				var caa = this.caption;
				if (caa) {
					if (!(caa instanceof Array)) {
						caa = [caa];
					}
					for (var ci=0; ci<caa.length; ci++) {
						var ca = caa[ci];
						if ($.type(ca) != "object") {
							ca = caa[ci] = { ctl:"label", value: ca };
						}
					}
				}
				return caa;
			},
			ddaa: function() {
				var daa = this.dataset;
				if (!(daa instanceof Array)) {
					daa = [[daa]];
				}
				for (var ri=0; ri<daa.length; ri++) {
					var da = daa[ri];
					if (!(da instanceof Array)) {
						da = daa[ri] = [da];
					}
					for (var di=0; di<da.length; di++) {
						var d = da[di];
						if ($.type(d) != "object") {
							d = da[di] = { value: d };
						}
					}
				}
				return daa;
			},
		},
	},
	"ovo-tab" : {
		props: {
			value: {},
			captionAlign: {},
		},
		data: function() {
			return {
				selectedPage: 0,
			};
		},
		render: function(h) {
			var rows = [];
			var scs = this.$slots.default;
			if (!(scs && scs.length)) {
				scs = [""];
			}
			for (var n = 0; n<scs.length; n++) {
				rows.push(h("ovo-box", { 'style': "width:100%;height:100%;"+(n==this.selectedPage?"":"display:none;") }, [scs[n]]));
			}
			var pages = this.pages(h, scs);
			var caption = h("ovo-hl-box", { 'style': "flex:0 0 1;align-items:stretch;" }, pages);
			var content = h("ovo-box", { 'style': "flex:1 1 100%;align-items:stretch;width:100%;" }, rows);
			return h("ovo-ctl", { 'style': "width:100%;height:100%;flex-flow:column nowrap;" }, (this.captionAlign&&this.captionAlign=="bottom")?[content,caption]:[caption, content]);
		},
		methods: {
			pages: function(h, scs) {
				var rows = [];
				for (var n = 0; n<scs.length; n++) {
					rows.push(this.captionButton(h, scs, n));
				}
				return rows;
			},
			captionButton: function(h, scs, n) {
				var me=this;
				var pd = scs[n].componentOptions.propsData;
				var cn = scs[n].context;
				return h("ovo-box", 
					{
						style: "flex:0 0 1;align-items:stretch;",
						nativeOn: {
							click: function(e) {
								me.selectedPage=n;
							},
						},
					}, 
					[pd&&pd.widget&&pd.widget.title||cn&&cn.context&&cn.context.key||((cn&&cn.context&&cn.context.ctl||"page")+"-"+n)]);
			},
		},
	},
	"ovo-operation": {
		template: '<ovo-box><ovo-button v-for="v,k in vals" :key="k" :value="v.key||v" :action="v.action||v.key||v" :enabled="v.enabled" :title="v.title||v.key||v" @click="click(k)">{{v.text||v}}</ovo-button></ovo-box>',
		props: {
			value: {}
		},
		methods: {
			click: function(k) {
				var v = this.vals[k];
				this.$emit("action", {value: v.key || v, datum: v.datum});
			},
		},
		computed: {
			vals: function() {
				if (this.value instanceof Array) {
					return this.value;
				} else {
					return [this.value];
				}
			},
		},
	},
	"ovo-condition": {
		template: '<ovo-string v-model="value" @change="change"></ovo-string>',
		props: {
			schema: {}, //缺省与设置了datum的最近祖级schema一致
			skey: {},
			value: {},
		},
		methods: {
			change: function(e) {
				if (this.schema && this.schema.params) {
					this.schema.params[this.skey]=e.value;
					if (this.schema.dat.isChanged()) {
						alert("data changed.");
					}
					this.schema.stamp = -1;
					this.$emit("change", {});
				} else {
					this.$emit("change", e);
				}
			},
		},
	},
};
