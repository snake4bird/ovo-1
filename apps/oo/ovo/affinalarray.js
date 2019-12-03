
var AffinalArray = function(source) {
	var _id = AffinalArray.prototype.instances++;
	var _source = source? source.items? source.items: source : [];
	if (!_source.onchange) {
		var _ods = null;
		var _onchangecallback = [];
		_docallback = function(cb) {
			setTimeout(function(){cb.call(_source)}, 0);
		}
		_update = function() {
			var ods = JSON.stringify(_source);
			if (_ods != ods) {
				_ods = ods;
				for (var i = 0; i<_onchangecallback.length; i++) {
					if (_onchangecallback[i]) {
						_docallback(_onchangecallback[i]);
					}
				}
			}
		};
		_source.onchange = function(cb){
			if (_onchangecallback.indexOf(cb)<0) {
				_onchangecallback.push(cb);
				_docallback(cb);
			}
		};
		//监听数组变化
		_source = new Proxy(_source, {
			get: function(obj, prop) {
				return obj[prop];
			},
			set: function(obj, prop, val) {
				obj[prop] = val;
				_update();
				return val;
			},
		});
	}
	Object.defineProperty(this, "items", {
		enumerable: false,
		configurable: false,
		value: _source,
		writable: false,
	});
	Object.defineProperty(this, "length", {
		enumerable: false,
		configurable: false,
		get: function() {
			return this.items.length;
		},
		set: function(v) {
			this.items.length = v;
		},
	});
	return new Proxy(this, {
		get: function(obj, prop) {
			if ((prop|0)==prop) {
				return obj.items[prop];
			}
			return obj[prop];
		},
		set: function(obj, prop, val) {
			if ((prop|0)==prop) {
				obj.items[prop] = val;
			} else {
				obj[prop] = val;
			}
			return val;
		},
	});
};
(function(){
	AffinalArray.prototype = new Array();
	Object.defineProperty(AffinalArray.prototype, "instances", {
		enumerable: false,
		configurable: false,
		value: 0,
		writable: true,
	});
	Object.defineProperty(AffinalArray.prototype, "update", {
		enumerable: false,
		configurable: true,
		value: function(){},
		writable: true,
	});
})();

var LinkageArray = function() {
	var _id = LinkageArray.prototype.instances++;
	Array.call(this);
	if (arguments.length == 1 && ((arguments[0] | 0) === arguments[0])) {
		this.length = arguments[0];
	} else {
		this.push.apply(this, arguments);
	}
	var _modcount=0;
	Object.defineProperty(this, "modcount", {
		enumerable: false,
		configurable: true,
		get: function() {
			return _modcount;
		},
		set: function(v) {
			if (_modcount != v) {
				_modcount = v;
				this.onchange();
			}
		},
	});
	var _source = null;
	Object.defineProperty(this, "linked", {
		enumerable: false,
		configurable: true,
		value: {},
		writable: false,
	});
	this.onchange = function() {}
	this.link = function(source) {
		this.unlink();
		if (source && source instanceof LinkageArray) {
			this.refill.apply(this, source);
			_source = source;
			_source.linked[_id] = this;
		}
	}
	this.unlink = function() {
		if (_source) {
			delete _source.linked[_id];
			_source = null;
		}
	}
	this.backfill = function() {
		_source.refill.apply(_source, this);
	}
	var _datastringstamp=-1
	var _datastringvalue=""
	this.dataString = function() {
		if (_datastringstamp != _modcount) {
			var s = "[";
			for(var i=0; i<this.length; i++) {
				s += (i==0?"":",") + JSON.stringify(this[i]);
			}
			s += "]";
			_datastringvalue = s;
			_datastringstamp = _modcount;
		}
		return _datastringvalue;
	}
	this.isChanged = function() {
		return _source.dataString() != this.dataString(); 
	}
	return new Proxy(this, {
		set: function(obj, prop, val) {
			obj[prop] = val;
			if ((prop|0)==prop) {
				this.modcount++;
				for(var k in this.linked) {
					var lai = this.linked[k];
					lai[prop] = val;
				}
			}
			return val;
		},
	});
};
(function(){
	// 创建一个没有实例方法的类
	var Super = function(){};
	Super.prototype = Array.prototype;
	// 将实例作为子类的原型
	// 目的是减少隐藏实例的内存占用，只是为了要实际父类的原型
	LinkageArray.prototype = new Super();
	// 实例计数
	Object.defineProperty(LinkageArray.prototype, "instances", {
		enumerable: false,
		configurable: true,
		value: 0,
		writable: true,
	});
	Object.defineProperty(LinkageArray.prototype, "refill", {
		enumerable: false,
		configurable: true,
		value: function() {
			this.length = 0;
			var r = Array.prototype.push.apply(this, arguments);
			this.modcount++;
			for(var k in this.linked) {
				var lai = this.linked[k];
				lai.refill.apply(lai, arguments);
			}
			return r;
		},
		writable: false,
	});
	['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function (method) {
		Object.defineProperty(LinkageArray.prototype, method, {
			enumerable: false,
			configurable: true,
			value: function() {
				var r = Array.prototype[method].apply(this, arguments);
				this.modcount++;
				for(var k in this.linked) {
					var lai = this.linked[k];
					lai[method].apply(lai, arguments);
				}
				return r;
			},
			writable: false,
		});
	});
	['sort', 'reverse'].forEach(function (method) {
		Object.defineProperty(LinkageArray.prototype, method, {
			enumerable: false,
			configurable: true,
			value: function() {
				var r = Array.prototype[method].apply(this, arguments);
				this.modcount++;
				for(var k in this.linked) {
					var lai = this.linked[k];
					lai.refill.apply(lai, this);
				}
				return r;
			},
			writable: false,
		});
	});
	Object.defineProperty(LinkageArray.prototype, "get", {
		enumerable: false,
		configurable: true,
		value: function(i) {
			return this[i];
		},
		writable: false,
	});
	Object.defineProperty(LinkageArray.prototype, "set", {
		enumerable: false,
		configurable: true,
		value: function(i,v) {
			this[i] = v;
			return this[i];
		},
		writable: false,
	});
})();

var la0 = new Array(5);
console.log(la0);
var la1 = new LinkageArray(5);
console.log(la1);
var la2 = new LinkageArray("ab", "cde", 123);
console.log(la2);

var la = new LinkageArray();
la.link(la2);

la2.push("haha");
console.log(la);

console.log("!!!");


var createLinkageData = function(dat) {
	var dd = [];
	var ddchangecallback = [];
	var isnew = true;
	dd.flush = function(dat) {
		dd.length = 0;
		Array.prototype.push.apply(dd, dat)
		isnew = false;
	};
	dd.update = function() {
		var ods = JSON.stringify(this);
		if (this._ods != ods) {
			Object.defineProperty(dd, "_ods", {
				enumerable: false,
				configurable: true,
				value: ods,
				writable: false,
			});
			this.docallback();
		}
		isnew = false;
	};
	dd.docallback = function() {
		for (var i = 0; i<ddchangecallback.length; i++) {
			if (ddchangecallback[i]) {
				ddchangecallback[i].call(dd);
			}
		}
	};
	dd.onchange = function(cb) {
		if (ddchangecallback.indexOf(cb)<0) {
			ddchangecallback.push(cb);
			setTimeout(function(){cb.call(dd)}, 0);
		}
	};
	Object.defineProperty(dd, "_o_push", {
		enumerable: false,
		configurable: true,
		value: dd.push,
		writable: false,
	});
	dd.push = function() {
		var r = this._o_push.apply(this, arguments);
		dd.update();
		return r;
	}
	Object.defineProperty(dd, "_o_splice", {
		enumerable: false,
		configurable: true,
		value: dd.splice,
		writable: false,
	});
	dd.splice = function() {
		var r = this._o_splice.apply(this, arguments);
		dd.update();
		return r;
	}
	if (dat && dat.length > 0) {
		dd.flush(dat);
		if (dat.onchange) {
			dat.onchange(function() {
				dd.flush(dat);
			});
		}
	}
	return dd;
};


//数据存取REST API 
//依赖FAR
//客户端cache处理
//REMINDER: 数据存取应该在服务器端实现，客户端模拟无法保证数据准确性
function Dabra(){
	var cache = {};
	var me = this;
	//数据加载完成，解析数据内容
	var _loadfile_success = function(src, dd, sd) {
		//目前只能接收json格式的文本内容
		if (sd.trim().length>0) {
			var d;
			try{
				eval("d="+sd);
			}catch(err){
				throw("parse data " + src + " error: " + err.message);
			}
			//重置数组
			dd.length = 0;
			var isArray = true;
			if ($.type(d)!="array") {
				dd.push(d);
				isArray = false;
			} else {
				Array.prototype.push.apply(dd, d); //array concat
			}
			dd.isArray = function() { return isArray; };
		}
		//空白文件保留内存中的缺省数据
		Object.defineProperty(dd, "_src", {
			enumerable: false,
			configurable: true,
			value: src,
			writable: false,
		});
		dd.src = function() { return this._src; };
		dd.isLoaded = function() { return true; };
		dd.update();
	}
	//数据加载没有找到json数据
	var _loadfile_nojson = function(url, dd, jo) {
		if (jo.files) {
			//重置数组
			dd.length = 0;
			//如果是目录，返回文件列表
			for(fn in jo.files) {
				var f = jo.files[fn];
				dd.push({
					id: f.path,
					name: f.path,
					value: f.path,
					desc: f.name,
				});
			}
			Object.defineProperty(dd, "_src", {
				enumerable: false,
				configurable: true,
				value: url,
				writable: false,
			});
			dd.isArray = function() { return true; };
			dd.src = function() { return this._src; };
			dd.isLoaded = function() { return true; };
			dd.update();
		} else {
			console.warn("data " + url + " not found");
		}
	}
	var _loadfile = function(src, cb) {
		try{
			FAR.get(src, function(o){
				cb(o, o && o.content);
			});
		}catch(err){
			throw("load data " + src + " error: " + err.message + "\r\n" + err.stack);
		}
	}
	var _load = function(dd, url) {
		//加载原始url
		var osrc = url;
		_loadfile(osrc, function(jo, sd) {
			if (sd) {
				_loadfile_success(osrc, dd, sd);
			} else if (osrc.substring(osrc.length-5)!=".json") {
				//加载同名json文件
				var jsrc = osrc+".json";
				_loadfile(jsrc, function(o, sd) {
					if (sd) {
						_loadfile_success(jsrc, dd, sd);
					} else {
						//加载目录说明_.json文件
						var dsrc = osrc+"/_.json";
						_loadfile(dsrc, function(o, sd) {
							if (sd) {
								_loadfile_success(dsrc, dd, sd);
							} else {
								_loadfile_nojson(osrc, dd, jo);
							}
						});
					}
				});
			} else {
				_loadfile_nojson(osrc, dd, jo);
			}
		});
		return dd;
	}
	this.load = function(url) {
		var dd = cache[url];
		if (!dd || !dd.expires || (new Date()).getTime()>(dd.expires)) {
			if (!dd) {
				dd = new LinkageArray();
				Object.defineProperty(dd, "_src", {
					enumerable: false,
					configurable: true,
					value: url,
					writable: false,
				});
				dd.url = function() { return this._src; };
				dd.src = function() { return this._src; };
				dd.isLoaded = function() { return false; };
				dd.isArray = function() { return true; };
				dd.isChanged = function() { return (JSON.stringify(this))!=this._ods; };
				dd._o_update = dd.update;
				dd.update = function() {
					Object.defineProperty(dd, "expires", {
							enumerable: false,
							configurable: true,
							value: (new Date()).getTime()+5000,
							writable: false,
						});
					if (this._o_update) {
						this._o_update.apply(this, arguments);
					}
				};
				dd.update();
			}
			// 读取到的数据一定是数组形式
			dd = _load(dd, url);
			cache[url] = dd;
			if (url != dd.url()) {
				cache[dd.url()] = dd;
			}
		}
		return dd;
	};
	this.save = function(dat) {
		if (dat && dat.src && dat.src()) {
			if (!dat.isChanged || dat.isChanged()) {
				try{
					for (var i=0; i<dat.length; i++) {
						if (!dat[i].id) {
							dat[i].id=FAR.get("&cmd=id").id;
						}
					}
					var nds = JSON.stringify(dat);
					var wds = nds;
					if (!dat.isArray()) {
						if (dat.length==0) {
							wds = "";
						} else if (dat.length==1) {
							wds = JSON.stringify(dat[0]);
						}
					}
					var e = FAR.put(dat.src(), wds);
					if (e.error) {
						throw("save data " + dat.src() + " returned error: " + e.error);
					}
					Object.defineProperty(dat, "_ods", {
						enumerable: false,
						configurable: true,
						value: nds,
						writable: false,
					});
				}catch(err){
					throw("save data " + dat.src() + " error: " + err.message + "\r\n" + err.stack);
				}
			}
		}
	};
	return this;
}

var DAR = new Dabra();
