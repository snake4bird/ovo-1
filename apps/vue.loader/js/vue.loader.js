
// 用于加载Vue组件
var VueLoader = new function(){
	var D = document;
	var me = this;
	this.debug = function(s) { return window.VueLoaderDebug && window.VueLoaderDebug(s); };

	// Vue的错误信息会输出到console，不会抛出异常
	Vue.config.errorHandler = function (err, vm, info) {
		console.error(info + " error " + (err.message||err) + "\r\n" + (err.stack||""));
		throw err;
	};
	
	var sceneTag = function(scene, vctag, a) {
		if (scene && a.indexOf(scene) != 0) {
			// 是否使用场景设置
			var pdash = a.indexOf("-");
			if (pdash>0) {
				// 组件名称中包含缺省场景
				var default_scene = a.substring(0, pdash+1);
				if (scene.indexOf(default_scene)==0) {
					// 设置场景与缺省场景存在继承关系
					var stag = scene + a.substring(pdash);
					if (vctag !=stag && Vue.component(stag)) {
						// 与父组件不能同名，否则会死循环
						// 存在设置场景相关组件
						return stag;
					}
				}
			}
		}
		return a;
	};
	
	var sceneClass = function(scene, vctag) {
		if (scene && vctag.indexOf(scene) != 0) {
			// 场景设置与组件场景不一致，如果一致会重复添加
			var pdash = vctag.indexOf("-");
			if (pdash>0) {
				// 组件名称中包含缺省场景
				var default_scene = vctag.substring(0, pdash+1);
				if (scene.indexOf(default_scene)==0) {
					// 设置场景与缺省场景存在继承关系
					return scene + vctag.substring(pdash);
				}
			}
		}
		return vctag;
	};
	
	var fixCurrentInherit = function(vm) {
		var cdata = vm.$vnode && vm.$vnode.componentOptions && vm.$vnode.componentOptions.propsData;
		if (!cdata) {
			cdata = {};
			if (vm.$vnode && vm.$vnode.componentOptions) {
				vm.$vnode.componentOptions.propsData = cdata;
			} else {
				cdata = vm;
			}
		}
		// inherit skin & scene
		cdata["ovaInheritSkin"] = vm.skin || vm.ovaInheritSkin || vm.$parent && (vm.$parent.skin || vm.$parent.ovaInheritSkin)  || "";
		cdata["ovaInheritScene"] = vm.scene || vm.ovaInheritScene || vm.$parent && (vm.$parent.scene || vm.$parent.ovaInheritScene)  || "";
		return cdata;
	};
	
	var fixElementInherit = function(vm, vc, cdata, nd) {
		if (!nd.attrs) {
			nd.attrs = {};
		}
		var ovaInheritSkin = nd.attrs.ovaInheritSkin = cdata.ovaInheritSkin;
		var ovaInheritScene = nd.attrs.ovaInheritScene = cdata.ovaInheritScene;
		//修正样式类
		var pdata = vm.$vnode && vm.$vnode.data || {};
		var pcls = pdata['class'] || {};
		var cls = nd['class'];
		if (!cls) {
			nd['class'] = cls = {};
		}
		var vctag = vc.vctag;
		cls[vctag] = (pcls[vctag]==null||pcls[vctag]);
		{
			//vattrs["_skin"] = ovaInheritSkin; // for debug
			if (ovaInheritSkin) {
				cls[ovaInheritSkin + '-' + vctag] = (pcls[ovaInheritSkin + '-' + vctag]==null);
			}
			if (ovaInheritScene) {
				//vattrs["_scene"] = ovaInheritScene; // for debug
				var stag = sceneClass(ovaInheritScene, vctag);
				cls[stag] = (pcls[stag]==null||pcls[stag]);
				if (ovaInheritSkin) {
					cls[ovaInheritSkin + '-' + stag] = (pcls[ovaInheritSkin + '-' + stag]==null);
				}
			}
		}
		if (nd.staticClass) {
			var scs = nd.staticClass.split(/\s+/);
			for (var i=0; i<scs.length; i++) {
				var cn = scs[i].trim();
				if (cn[0]=='-') {
					// 减号开头表示去除class，只能去除在此之前设置的class，在此之后仍然可以再设置此class
					cls[cn.substring(1)] = false;
				} else {
					cls[cn] = true;
				}
			}
			nd.staticClass = "";
		}
	};
	
	var ovaInherit = function(vm, vc, nd) {
		if (vc && !vc.options.pure) {
			if (!vc.vctag) {
				// 初始化阶段
				var props = vc.options.props;
				if (!props) {
					props = vc.options.props = {};
				}
				// 自动修正场景属性
				props.ovaInheritScene = {};
				// 自动修正皮肤属性
				props.ovaInheritSkin = {};
				// 自动添加数据属性
				props.value = props.value || {};
				// 自动添加占位符属性
				props.placeholder = props.placeholder || {};
				// 初始化标记
				vc.vctag = vc.options.name;
			}
			//修正当前节点继承属性值
			var cdata = fixCurrentInherit(vm);
			//填充子节点继承属性值
			fixElementInherit(vm, vc, cdata, nd);
		}
	};
	
	var ovaCreateElement = function(vm,oc,a,b,c,d) {
		if (!b || Array.isArray(b) || typeof b === 'string' || typeof b === 'number') {
			d = c;
			c = b;
			b = {};
		}
		a = sceneTag(vm.ovaInheritScene, vm.vctag, a);
		var vc = Vue.component(a);
		ovaInherit(vm,vc,b);
		var r = oc.call(vm,a,b,c,d);
		return r;
	};
	
	Vue.mixin({
		beforeCreate: function() {
			//Vue render组件时，通过 _c或$createElement 调用 createElement 创建元素（子组件或HTML Element）
			if (!this._oc && this._c) {
				this._oc = this._c;
				this._c = function(a,b,c,d) {
					return ovaCreateElement(this, this._oc, a, b, c, d);
				};
			}
			if (!this.$oc && this.$createElement) {
				var vm = this;
				vm.$oc = vm.$createElement;
				vm.$createElement = function(a,b,c,d) {
					return ovaCreateElement(vm, vm.$oc, a, b, c, d);
				};
			}
			// options经Vue解析后，结构化的Vue组件定义,内容包括:template,props,data,computed,methods,....
			// 这里可以对组件定义 options 进行适当调整
			var options = this.constructor.options;
			var vctag = this.vctag = options.name;
			var pure = this.pure = options.pure;
			if (vctag && !pure) {
				var props = options.props;
				if (!props) {
					props = options.props = {};
				}
				// 自动修正场景属性
				props.ovaInheritScene = {};
				// 自动修正皮肤属性
				props.ovaInheritSkin = {};
				// 自动添加数据属性
				props.value = props.value || {};
				// 自动添加占位符属性
				props.placeholder = props.placeholder || {};
			}
		},
	});
	
	var cutStr = function(txt, ss, se) {
		var is = txt.indexOf(ss);
		var ie = is>=0?txt.indexOf(se, is):-1;
		return (is>=0 && ie>=is)?txt.substring(is+ss.length,ie).trim():"";
	};
	
	var getTag = function(txt, tag) {
		var n = 0;
		var ss = "<" + tag;
		var se = "</"+tag+">";
		var rta = [];
		while(n<txt.length) {
			var is = txt.indexOf(ss, n);
			is = is>=0?txt.indexOf(">", is):-1;
			var ie = is>=0?txt.indexOf(se, is):-1;
			var n = ie>=0?(ie+se.length):(txt.length+1);
			var s = (is>=0 && ie>=is)?txt.substring(is+1,ie).trim():"";
			if (s) {
				rta.push(s);
			}
		}
		return rta;
	};
	
	var getAttr = function(txt, tag, key) {
		var p = new RegExp(key+"\\s*=\\s*([\\\'\\\"])([^\\1]*)\\1");
		var s = cutStr(txt, "<" + tag, ">");
		var s = s.match(p);
		return s&&s.length>2&&s[2]&&s[2].trim()||"";
	};
	
	this.addCSS = function(css) {
		var e=D.createElement('style');
		e.setAttribute("type","text/css");
		e.styleSheet&&(e.styleSheet.cssText=css)||e.appendChild(D.createTextNode(css));
		D.getElementsByTagName('head')[0].appendChild(e); 
	};
	
	this.addJS = function(js) {
		var e=D.createElement('script');
		e.appendChild(D.createTextNode(js));
		try {
			D.getElementsByTagName('head')[0].appendChild(e); 
		} catch(e) {
			console.log(js);
		}
	};
	
	this.decode = function(txt) {
		return txt;
	};
	
	this.parseVC = function(url, txt, pure) {
		var ret = [];
		if (txt) {
			//
			txt = this.decode(txt);
			//一个文件中可以包含多个组件
			var vcs = getTag(txt, "code");
			if (vcs.length==0) {
				vcs = [txt];
			}
			var loadedcb = false;
			for(var vci=0; vci<vcs.length; vci++) {
				var code = vcs[vci];
				if (code) {
					try {
						var style = getTag(code, "style")[0];
						if (style) {
							this.debug("style:"+style);
							this.addCSS(style);
						}
						var template = getTag(code, "template")[0];
						var vcname = getAttr(code, "script", "id");
						var script = getTag(code, "script")[0];
						if (!script && !template && !style) {
							script = code;
						}
						if (template) {
							//合并template到script
							script = script.replace(/\{/, "{\r\ntemplate:'"+template.replace(/'/g, "\\'").replace(/\t/g,"\\t").replace(/\r/g,"\\r").replace(/\n/g,"\\n")+"',");
						}
						script = "/*** "+url+" ***/\r\nVue.component('" + vcname + "', " + script + ");";
						this.debug("script:"+script);
						this.addJS(script);
						//eval(script);
						ret.push(vcname);
						var vc = Vue.component(vcname);
						if (!vc) {
							console.error("Vue component " + vcname + " is NOT loaded.");
						} else if (pure) {
							vc.options.pure = true;
						}
						loadedcb = loadedcb || args_onloaded.vcs && args_onloaded.cb && args_onloaded.vcs.indexOf(vcname)>=0;
					} catch (e) {
						console.log(url + " parseVC Error: " + e.message);
					}
				}
			}
			if (loadedcb) {
				me.onloaded(args_onloaded.vcs, args_onloaded.cb);
			}
		}
		return ret;
	};
	
	this.url_load = null;
	this.cb_done = null;
	this.done = function(cb) {
		if (this.url_load) {
			this.cb_done = cb;
		} else {
			if (cb) {
				return cb();
			}
		}
		return this;
	};
	
	this.loadOne = function(url, cb, pure) {
		if (cb) {
			me.debug("异步加载 "+url);
			me.url_load = url;
			$.ajax({
					url: url,
					mimeType: "text/plain",
					cache: false,
				}).done(function(txt){
					me.parseVC(url, txt, pure);
					if (cb) {
						cb();
					}
					if (me.cb_done) {
						me.cb_done();
					}
				});
		} else {
			me.debug("同步加载 "+url);
			me.url_load = null;
			me.parseVC(url,
				$.ajax({
					url: url,
					mimeType: "text/plain",
					async: false,
					cache: false,
				}).responseText, pure);
		}
		return me;
	};
	
	this.loadVC = function(url, cb, pure) {
		if ($.type(url) == "string") {
			me.loadOne(url,cb,pure);
		} else if (cb) {
			var urli = 0;
			var loadcb = function() {
				if (urli<url.length) {
					me.loadOne(url[urli], loadcb, pure);
					urli++;
				} else {
					cb();
				}
			};
			loadcb();
		} else {
			for (var i=0; i<url.length; i++) {
				me.loadOne(url[i], undefined, pure);
			}
		}
		return me;
	};

	var args_onloaded = {};
	this.onloaded = function(vcs, cb) {
		var b = true;
		for (var i=0; b && i<vcs.length; i++) {
			b = Vue.component(vcs[i])?true:false;
		}
		if (b && cb) {
			cb();
			args_onloaded = {};
		} else {
			args_onloaded = {vcs: vcs, cb: cb};
		}
	};

	// document加载结束后（status==interactive）,加载所有<link rel='vc'/>
	// <!-- link加载方式,在document interactive之后,同步加载,可以保证在document completed之前加载完成 -->
	// <link rel="vc" href="vue.sample.1.htm"></link>
	// <!-- Vue Component Loader -->
	// <script src="vue.loader.js"></script>
	// <!-- link加载方式,在document interactive之后,强制异步加载,不能保证在document completed之前加载完成,需要另外处理，通过VueLoader.onloaded确保指定组件加载完成后再执行相关操作 -->
	// <!-- link加载方式,在document interactive之后,强制单纯加载,不进行自动皮肤和场景继承处理 -->
	// <link rel="vc" href="vue.sample.4-5.htm" type="async/pure"></link>
	{
		var loadVCLink = function() {
			var links = D.getElementsByTagName('link');
			for (var i=0; i<links.length; i++) {
				if (links[i].rel == "vc" && !links[i].loaded) {
					links[i].loaded = true;
					var type = links[i].type || "";
					var types = type.trim().split(/\s*\/\s*/);
					var href = links[i].href || links[i].src;
					if (href) {
						me.loadVC(links[i].href, types.indexOf("async")>=0?function(){}:undefined, types.indexOf("pure")>=0);
					}
				}
			}
		};
		// 避免被后续相关代码覆盖或覆盖之前相关代码
		var orsca = [];
		if (D.onreadystatechange) {
			orsca.push(D.onreadystatechange);
		}
		D.onreadystatechange = function(e) {
			for(var i=0; i<orsca.length; i++) {
				orsca[i](e);
			}
		};
		D.__defineSetter__("onreadystatechange", function(f) {
			orsca.push(f);
		});
		// 
		D.onreadystatechange = function() {
			//console.log("loadVC "+D.readyState);
			if (D.readyState == "interactive") {
				loadVCLink();
			}
		};
	}
	
	return this;
}();

//扩展Vue接口
Vue.loadVC = VueLoader.loadVC;

Vue.updateValue = function (ov, nv) {
	var oks = ov?Object.keys(ov):[];
	var nks = nv?Object.keys(nv):[];
	var i = 0;
	var tv = {};
	// 更新顺序一致的属性
	for (; i < oks.length && i < nks.length && nks[i] == oks[i]; i++) {
		var x = nks[i];
		if ($.type(nv[x]) == "object" && $.type(ov[x]) == "object") {
			Vue.updateValue(ov[x], nv[x]);
		} else if (ov[x] != nv[x]) {
			ov[x] = nv[x];
		}
	}
	// 缓存顺序不一致的属性，
	// function不需要保证顺序一致性，原因是更新过程会导致函数失效
	for (var oi = i; oi < oks.length; oi++) {
		var x = oks[oi];
		if ($.type(ov[x]) != "function") {
			tv[x] = ov[x];
			Vue.delete(ov, x);
		}
	}
	// 按新顺序变更原始对象的属性
	for (; i < nks.length; i++) {
		var x = nks[i];
		if (tv[x]!=null) {
			// order changed only
			Vue.set(ov, x, tv[x]);
			if ($.type(nv[x]) == "object" && $.type(ov[x]) == "object") {
				Vue.updateValue(ov[x], nv[x]);
			} else if (ov[x] != nv[x]) {
				ov[x] = nv[x];
			}
		} else {
			Vue.set(ov, x, nv[x]);
		}
	}
};

var getStamp = function() {
	var t = (new Date()).getTime();
	if (t <= window.time) {
		t = window.time + 1;
	}
	window.time = t;
	return t;
};

Vue.completeValue = function (ov, dv, cc) {
	if (!cc) {
		cc = getStamp();
	}
	if ($.type(ov)=="object" && $.type(dv)=="object") {
		if (dv.__cv_stamp__!=cc) {
			Object.defineProperty(dv, "__cv_stamp__", {
								enumerable: false,
								configurable: true,
								value: cc,
								writable: false,
							});
			var oks = ov?Object.keys(ov):[];
			var dks = dv?Object.keys(dv):[];
			var i = 0;
			for (; i < dks.length; i++) {
				var x = dks[i];
				if (ov[x]) {
					Vue.completeValue(ov[x], dv[x], cc);
				} else {
					Vue.set(ov, x, dv[x]);
				}
			}
		}
	}
	return ov;
};

Vue.delaySetValue = function(me, dd, sd, ok) {
	var md = {
		me: me,
		dd: dd,
		sd: sd,
		ok: ok,
	};
	if (md.dd && md.sd && md.ok) {
		if (md.sd instanceof Array && md.dd instanceof Array) {
			md.ks = null;
			md.kl = md.sd.length;
		} else {
			md.ks = Object.keys(md.sd);
			md.kl = md.ks.length;
		}
		md.ki = 0;
		md.dt = 0;
		var setdata = function (md) {
			if (md.ki < md.kl) {
				if (md.ks) {
					var k = md.ks[md.ki];
					var v = md.sd[k];
					Vue.set(md.dd, k, v);
				} else {
					md.dd[md.ki] = md.sd[md.ki];
				}
				md.ki++;
				md.dt = md.dt < 100 ? (md.dt + 1) : 1;
				setTimeout(function () {
					setdata(md)
				}, md.dt);
			} else {
				md.ok(md.me);
			}
		};
		setdata(md);
	}
};

