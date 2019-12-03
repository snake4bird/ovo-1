
ovo_ctrl_view = {
	"ovo-text-view": {
		template: '<ovo-ctl>'
		 + '<textarea ref="textarea" @focus="focus" @blur="blur" @input="input" :value="text"></textarea>'
		 + '<div>{{message}}</div>'
		 + '</ovo-ctl>',
		props: {
			value: {},
		},
		data: function () {
			return {
				curpos: 0,
				lastinputchar: '',
				message: "",
				inputting: "",
				text: "",
			}
		},
		mounted: function () {
			//console.log(pcl + "text view mounted!");
			var readonly = this.$refs["textarea"].readOnly;
			this.$watch("value", function () {
				//console.log(pcl + "text view watch value changed! " + this.inputting.length);
				if (this.inputting) {
					this.inputting = "";
				} else {
					try {
						this.text = JSON.stringify(this.value, null, 4);
						this.$refs["textarea"].readOnly = readonly;
					} catch(e) {
						this.text = $.rro2s(this.value);
						readonly = this.$refs["textarea"].readOnly;
						this.$refs["textarea"].readOnly = true;
					}
					this.message = "";
				}
			}, {
				deep: true,
				immediate: true,
			});
		},
		beforeUpdate: function () {
			//console.log(pcl + "text view before updated!");
		},
		updated: function () {
			//console.log(pcl + "text view updated! curpos=" + this.curpos + ", lastinputchar=" + this.lastinputchar);
			if (this.curpos > 0) {
				this.$refs["textarea"].selectionStart = this.$refs["textarea"].selectionEnd = this.curpos;
			} else if (this.curpos < 0) {
				var cp = this.$refs["textarea"].value.length + this.curpos;
				var n = this.$refs["textarea"].value.lastIndexOf(this.lastinputchar, cp) + 1;
				this.$refs["textarea"].selectionStart = this.$refs["textarea"].selectionEnd = n;
			}
		},
		methods: {
			focus: function(e) {
			},
			blur: function(e) {
				this.curpos = 0;
			},
			input: function (event) {
				//console.log(pcl + "text view inputting!");
				try {
					this.curpos = event.target.selectionStart - event.target.value.length; 
					this.lastinputchar = event.target.value[event.target.selectionStart-1];
					this.inputting = event.target.value;
					this.text = event.target.value;
					//var tm;
					//eval("tm="+event.target.value);
					var tm = JSON.parse(event.target.value);
					this.inputting = "";
					this.$emit("change", {
						value: tm
					});
					this.message = "";
				} catch (e) {
					console.log(pcl + e.stack);
					this.message = e.message;
					this.inputting = "";
				}
			},
		},
	},
	"ovo-json-text-editor": {
		template: '<ovo-text-view :value="value" @change="change">'
		 + '</ovo-text-view>',
		props: {
			value: {},
		},
		methods: {
			change: function(e) {
				this.$emit("change", e);
			},
		},
	},
	"ovo-json-text-reader": {
		template: '<ovo-ctl class="ovo-text-view">'
		 + '<textarea readonly :value="text"></textarea>'
		 + '</ovo-ctl>',
		props: {
			value: {},
		},
		computed: {
			text: function() {
				return $.type(this.value)=="string"?this.value:JSON.stringify(this.value,null,4);
			},
		},
	},
	"ovo-properties": {
		props: {
			value: {},
			title: {},
		},
		computed: {
			kvpx: function() { return this.value && this.value.props || {}; },
			kvps: function() {
				var o={};
				for (k in this.kvpx) {
					var v=this.kvpx[k];
					if (typeof(v) != "object") {
						o[k]=v;
					} else {
						var o2={};
						for (k2 in v) {
							if (typeof(v[k2]) != "object") {
								o2[k2]=v[k2];
							}
						}
						o[k]=o2;
					}
				}
				return o;
			},
		},
		render: function(h) {
			return h("ovo-table", {
				style: {
					"overflow": "auto",
					"border": "0",
				},
				attrs: {
					cols: 2,
					title: this.title,
				},
			}, this.contents(h));
		},
		methods: {
			kveditor: function(h, o, k) {
				return h("ovo-string", {
						attrs: {
							value: o[k]
						},
						on: {
							change: function(v) {
								o[k]=v.value;
							},
						},
					});
			},
			contents: function(h) {
				var ncs = [];
				for(var k in this.kvps) {
					var nk = h("ovo-label", { attrs: { value: k}, });
					var nv = this.kveditor(h, this.kvps, k);
					ncs.push(nk);
					ncs.push(nv);
				}
				return ncs;
			},
		},
	},
	"ovo-jsoneditor": {
		template: '<ovo-ctl>'
		 + '</ovo-ctl>',
		props: {
			value: {},
		},
		data: function() {
			return {
				editor: null,
			};
		},
		computed: {
			json: function() {
				var o={};
				for (k in this.value.props) {
					var v=this.value.props[k];
					try {
						o[k] = $.clone(v);
					} catch(e) {
						o[k] = e.message;
					}
				}
				return o;
			},
		},
		mounted: function() {
			// create the editor
			var container = this.$vnode.elm;
			var options = {navigationBar: false};
			this.editor = new JSONEditor(container, options);
			
			this.editor.setName("OVO PAGE JSONEDITOR");
			//editor.setMode("view");
			this.editor.set(this.json);
			
			this.$watch("json", function () {
				// set json
				try {
					this.editor.update(this.json);
				} catch(e) {
					this.editor.update([e.message]);
				}
			}, {
				deep: true,
			});
		},
	},
	// 字段, 横排
	"ovo-fieldxx": {
		render: function (h) {
			var me = this;
			var dcs = [h("div"), h("div"), h("div")];
			var scs = this.$slots.default;
				if (scs) {
					if (scs.length == 0) {
						scs = dcs;
					} else if (scs.length == 1) {
						scs = [dcs[0], scs[0], dcs[2]];
					} else if (scs.length == 2) {
						scs = [scs[0], scs[1], dcs[2]];
					}
				} else {
					scs = dcs;
				}
				return h("ovo-ctl", {
					'class': "ovo-fieldxx"
				}, scs);
		},
	},
	// 列表，竖排
	"ovo-list": {
		render: function (h) {
			var me = this;
			var scs = this.$slots.default;
				var head = "";
				if (scs.length > 0 && scs[0] && scs[0].data && scs[0].data.attrs && scs[0].data.attrs.type == "head") {
					head = h("div", {
							style: "border-bottom:1px solid gray;",
						}, [scs[0]]);
					scs = scs.splice(1);
				}
				var tail = "";
				if (scs.length > 0 && scs[scs.length - 1] && scs[scs.length - 1].data && scs[scs.length - 1].data.attrs && scs[scs.length - 1].data.attrs.type == "tail") {
					tail = h("div", {
							style: "border-top:1px solid gray;",
						}, [scs[scs.length - 1]]);
					scs = scs.splice(0, scs.length - 1);
				}
				var list = h("ovo-box", {
						style: "border: 0; flex: 1 1 1px; overflow: auto; flex-flow: column nowrap;",
					}, scs);
				return h("ovo-box", {
					'class': {
						"ovo-list": true,
					},
					style: "flex-flow: column nowrap; align-items: stretch; height: 100%;"
				}, [head, list, tail]);
		},
	},
	"ovo-label": {
		template: '<ovo-ctl>'
		 + '<label :title="title">{{value}}</label>'
		 + '</ovo-ctl>',
		props: {
			value: {},
			title: {},
		},
	},
	"ovo-string": {
		template: '<ovo-ctl>'
		 + '<input class="form-control" :value="svalue" :placeholder="placeholder" @input="input"></input>'
		 + '</ovo-ctl>',
		props: {
			value: {},
			placeholder: {},
		},
		computed: {
			fvalue: function() {
				return $.type(this.value)=="object"&&this.value.value!=undefined?this.value.value:this.value;
			},
			avalue: function() {
				return (this.fvalue instanceof Array)?this.fvalue[0]:this.fvalue;
			},
			svalue: function() {
				return this.avalue && ($.type(this.avalue)=="string"?this.avalue:$.rro2s(this.avalue)) || "";
			},
		},
		methods: {
			input: function(e) {
				var me = this;
				var et = e.target;
				var nv = et.value;
				setTimeout(function(){
					if (et.value == nv) {
						me.$emit("change", {value: nv});
					}
				}, 500);
			},
		},
	},
	"ovo-selector": {
		template: '<ovo-ctl><select ref="selector" @change="change">'
				+'<option v-if="withnew" :id="withnew.id" :name="withnew.name" :value="withnew.value" :selected="checked.value==withnew.value?true:false">{{withnew.desc}}</option>'
				+'<option v-for="opt in options" :id="opt.id" :name="opt.name" :value="opt.value" :selected="checked.value==opt.value?true:false">{{opt.desc}}</option>'
				+'</select>'
				+'<input v-if="editable" :value="checked.value" @change="change_value" @focus="selectAll"></input>'
				+'<input v-if="editable" :value="checked.desc" @change="change_desc" @focus="selectAll"></input>'
				+'</ovo-ctl>',
		props: {
			value: {}, 
		},
		computed: {
			editable: function() { return this.value.editable; },
			withnew: function() { return this.value.withnew?$.clone(this.value.withnew):null; },
			options: function() { return this.value.options; },
			cvalues: function() {
				if (!this.value.value) {
					return null;
				}
				var vs = {};
				if ($.type(this.value.value)=="string") {
					vs[this.value.value] = 1;
				} else if (this.value.value instanceof Array) {
					for(var i = 0; i<this.value.value.length; i++) {
						vs[this.value.value[i]] = 1;
					}
				} else {
					vs = this.value.value;
				}
				return vs;
			},
			checked: function() {
				var selected_option = null;
				for(var k in this.options) {
					if (this.cvalues[this.options[k].value]) {
						selected_option = this.options[k];
					}
				}
				if (!selected_option && this.withnew && this.cvalues[this.withnew.value]) {
					selected_option = this.withnew;
				}
				if (!selected_option && this.options && this.options.length>0) {
					selected_option = this.options[0];
				}
				return selected_option || {};
			},
		},
		beforeMount: function() {
			if (this.value && (!this.value.options || !this.value.value)) {
				console.error("selector value data format error.");
			}
		},
		mounted: function() {
			var selv = this.$refs.selector.value;
			//console.log("selector mounted " + selv);
		},
		updated: function() {
			var selv = this.$refs.selector.value;
			//console.log("selector updated " + selv);
			if (selv != this.value.value) {
				this.emit_change(selv);
			}
		},
		methods: {
			selectAll: function(e) {
				$(e.target).select();
			},
			emit_change: function(selv) {
				this.$emit("change", {value: {editable: this.editable, withnew: this.value.withnew, options: this.options, value: [selv]}});
			},
			change: function(e) {
				var selv = e.target.value;
				//console.log("selector value: "+selv);
				this.emit_change(selv);
			},
			update_options: function() {
				if (!this.checked.value && !this.checked.desc) {
					// delete
					for(var k in this.options) {
						if (this.options[k] == this.checked) {
							this.value.options.splice(k, 1)
							this.$forceUpdate();
						}
					}
				} else {
					// insert
					if (this.checked == this.withnew &&
						this.checked.value != this.value.withnew.value &&
						this.checked.desc != this.value.withnew.desc) {
						this.value.options.splice(0,0,this.checked);
						this.emit_change(this.checked.value);
					}
				}
			},
			change_value: function(e) {
				this.checked.value = e.target.value;
				this.update_options();
			},
			change_desc: function(e) {
				this.checked.desc = e.target.value;
				this.update_options();
			},
		},
	},
	"ovo-link": {
		template: '<ovo-ctl><a :name="value" @click="click"><slot style="pointer-events:none;"></slot></a></ovo-ctl>',
		props: {
			value: {},
		},
		methods: {
			click: function(e) {
				this.$emit("click", {value: this.value});
			},
		},
	},
	"ovo-option": {
		template: '<ovo-link :value="value.key" @click="click"><span :style="style">{{value.text}}</span></ovo-link>',
		props: {
			value: {},
		},
		computed: {
			style: function() {
				var css = this.value.css||{};
				css["text-decoration"] = (this.value.selected)?"underline":"none";
				return css;
			},
		},
		methods: {
			click: function(e) {
				this.$emit("click", {value: this.value});
			},
		},
	},
	"ovo-choice": {
		template: '<ovo-box><ovo-option v-for="v in options" :key="v.key" :value="v" @click="click"></ovo-option></ovo-box>',
		props: {
			value: {},
		},
		computed: {
			options: function() {
				var css0 = this.value.css && this.value.css.normal || {};
				var css1 = this.value.css && this.value.css.selected || {};
				var vos = this.value.options;
				var vk = this.value.value && this.value.value.key;
				for(var k in vos) {
					var o = vos[k];
					Vue.set(o, "selected", (o.key == vk));
					Vue.set(o, "css", $.extend(o.css, (o.key == vk)?css1:css0));
				}
				return vos;
			},
		},
		methods: {
			click: function(e) {
				this.value.value = e.value;
				this.$emit("change", {value: this.value});
			},
		},
	},
	"ovo-button": {
		template: '<ovo-ctl><button ref="btn" class="btn" disabled="disabled" :class="btnclass" @click="click" :value="value" :title="title"><slot></slot></button></ovo-ctl>',
		props: {
			btnclass: { default: "btn-default btn-xs" },
			value: {},
			title: {},
			action: {},
			enabled: {},
		},
		mounted: function() {
			this.$refs.btn.disabled=(this.enabled==false);
		},
		updated: function() {
			if (this.$refs.btn) {
				this.$refs.btn.disabled=(this.enabled==false);
			}
		},
		methods: {
			click: function(e) {
				//按钮的点击操作,直接转换为方法调用,调用顺序就是当前按钮在组件树中自顶向下的组件路径中对应的方法
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
				var action = this.action || this.value.action || this.value.key || this.value;
				if (action) {
					var cvci = this;
					ovo.actionsChain(cvci, action, this.value, 
						function() {
							cvci.$emit("click", e);
						});
				} else {
					this.$emit("error", "按钮没有定义动作");
				}
			},
		},
	},
	"ovo-autosize-input": {
		template: '<ovo-ctl>'
		 + '<input ref="input" class="form-control" :value="svalue" :placeholder="defaultValue" :title="title" @input="input"></input>'
		 + '<div ref="hiddenTextH" class="form-control" :style="xInnerStyle"><span>{{defaultValue}}</span></div>'
		 + '<div ref="hiddenTextV" class="form-control" :style="xInnerStyle"><span>{{svalue}}</span></div>'
		 + '</ovo-ctl>',
		props: {
			value: {},
			defaultValue: {},
			title: {},
		},
		computed: {
			svalue: function() {
				return this.value && ($.type(this.value)=="string"?this.value:$.rro2s(this.value)) || "";
			},
			xInnerStyle: function() {
				return $.extend({}, this.style, { "white-space":"nowrap", "position":"absolute", "display":"block", "visibility":"hidden", "top":"0px", "right":"0px", "width":"auto", "z-index":"-1", });
			},
		},
		mounted: function() {
			var me = this;
			setTimeout(function() {
					$(me.$refs["input"]).css("width", (Math.max($(me.$refs["hiddenTextV"]).outerWidth(), $(me.$refs["hiddenTextH"]).outerWidth())) + "px");
				}, 1);
		},
		updated: function() {
			var me = this;
			setTimeout(function() {
					$(me.$refs["input"]).css("width", (Math.max($(me.$refs["hiddenTextV"]).outerWidth(), $(me.$refs["hiddenTextH"]).outerWidth())) + "px");
				}, 1);
		},
		methods: {
			input: function(e) {
				var me = this;
				console.log(pcl+" value change "+e.target.value);
				$(me.$refs["hiddenTextV"]).html(e.target.value); //{{value}} 有时候不会自动刷新
				//this.svalue = e.target.value;
				setTimeout(function() {
						$(me.$refs["input"]).css("width", (Math.max($(me.$refs["hiddenTextV"]).outerWidth(), $(me.$refs["hiddenTextH"]).outerWidth())) + "px");
					}, 1);
				this.$emit("change", {value: e.target.value});
			},
		},
	},
	"ovo-keyvalue": {
		template: '<ovo-ctl>'
		 + '<ovo-label :value="value.key" @change="labelChange"></ovo-label>'
		 + '<ovo-string style="flex:1 1 100px;" :value="value.value" @change="valueChange"></ovo-string>'
		 + '</ovo-ctl>',
		props: {
			value: {},
		},
		methods: {
			labelChange: function(e) {
				console.log(pcl+" kv KEY change "+e.value);
				this.$emit("change", {value: {key:e.value, value: this.value.value}});
			},
			valueChange: function(e) {
				console.log(pcl+" kv VALUE change "+e.value);
				this.$emit("change", {value: {key:this.value.key, value: e.value}});
			},
		},
	},
	"ovo-minicheck": {
		template: '<ovo-ctl>'
		 + '<span v-if="value" :title="label">{{flag}}</span>'
		 + '</ovo-ctl>',
		props: {
			flag: { default: "*" },
			label: {},
			value: {},
		},
	},
	"ovo-comment": {
		template: '<ovo-ctl>'
		 + '<div>{{value}}</div>'
		 + '</ovo-ctl>',
		props: {
			value: {},
		},
	},
	"ovo-datum": {
		template: '<ovo-box><slot></slot></ovo-box>',
		props: {
			data: {},
		},
	},
	"ovo-field": {
		template: '<ovc :layout="layout" :schema="schema" :data="data" @change="change"></ovc>',
		props: {
			schema: {},
			data: {},
			field: {}
		},
		computed: {
			xvalue: function() { return this.data && this.field && this.data[this.field] || null; },
			fschema: function() { return this.schema && this.field && this.schema[this.field] || this.schema; },
			layout: function() {
				return this.flayout($.clone(this.$options.pattern), this.field, this.xvalue, this.fschema);
			},
		},
		methods: {
			change: function(e) {
				if (!e.layout) {
					this.$emit("change", e);
				}
			},
			flayout: function(p, f, v, m){
				if (!f) { 
					f = "";
				}
				if (!m) {
					m = {};
				}
				p.field = f
				p.type = m.type?m.type:"string";
				p.title = m.title?m.title:f;
				if (p.items && p.items.length) {
					for(var i = 0; i<p.items.length; i++) {
						var item = p.items[i];
						var a = item.attr;
						var iv;
						if (a) {
							iv = m[a]!=null?m[a]:(a=="label"?f.toUpperCase():"");
						}
						if (!a || a=="default") {
							if (!item.ctl) {
								item.ctl = p.type;
							}
							if (!item.defaultValue) {
								item.defaultValue = m.default!=null?m.default:p.type;
							}
							if (this.schema != this.data && v!=null) {
								iv = v;
							} else {
								iv = (m.default!=null?m.default:"");
							}
						}
						if (!item.value && iv) {
							item.value = iv;
						}
					}
				}
				return p;
			},
		},
		pattern: {
			ctl: "ctl",
			items: [
				{
					ctl: "minicheck",
					attr: "require",
					css: {
						"flex": "2 2 20px",
						"color": "red",
					},
					flag: "*",
					label: "必填",
				},
				{
					ctl: "minicheck",
					attr: "unique",
					css: {
						"flex": "2 2 20px",
						"color": "blue",
					},
					flag: "#",
					label: "唯一",
				},
				{
					ctl: "label",
					attr: "label",
					css: {
						"flex": "20 20 100px",
					},
				},
				{
					ctl: "string",
					attr: "default",
					css: {
						"flex": "40 40 300px",
					},
				},
				{
					ctl: "comment",
					attr: "desc",
					css: {
						"flex": "40 40 400px",
					},
				},
			],
		},
	},
};
