
var LinkageData = function() {
	var _id = LinkageData.prototype.instances++;
	var _me = this;
	var _modcount = 0;
	var _dataArray = [];
	Object.defineProperty(this, "values", {
		enumerable: false,
		configurable: true,
		get: function() {
			return _dataArray;
		},
		set: function(v) {
			_me.refill(v);
		},
	});
	var _source = null;
	if (!(arguments.length==1 && arguments[0]=="ROOT")) {
		_source = new LinkageData("ROOT");
		_source.linked[_id] = this;
	}
	Object.defineProperty(this, "linked", {
		enumerable: false,
		configurable: true,
		value: {},
		writable: false,
	});
	this.link = function(source) {
		this.unlink();
		if (source) {
			this.refill(source.values);
			_source = source;
			_source.linked[_id] = this;
		}
	}
	this.unlink = function() {
		if (_source) {
			if (_source.linked) {
				delete _source.linked[_id];
			}
			_source = new LinkageData("ROOT");
			_source.linked[_id] = this;
		}
	}
	this.refill = function(sourceDataArray) {
		this.length = 0;
		this.push.apply(this, sourceDataArray);
	}
	this.backfill = function() {
		if (_source) {
			delete _source.linked[_id];
			_source.refill(_dataArray);
			_source.linked[_id] = this;
			_source.backfill();
			_source.fireChangeEvent();
		}
	}
	Object.defineProperty(this, "isRawArray", {
		enumerable: false,
		configurable: true,
		value: false,
		writable: false,
	});
	var _jsonstringstamp=-1
	var _jsonstringvalue=""
	Object.defineProperty(this, "jsonString", {
		enumerable: false,
		configurable: true,
		get: function() {
			if (_jsonstringstamp != _modcount) {
				_jsonstringvalue = JSON.stringify(_dataArray);
				_jsonstringstamp = _modcount;
			}
			return _jsonstringvalue;
		},
		set: function(sd) {
			var d;
			try{
				eval("d="+sd);
			}catch(err){
				throw("parse data " + sd + " error: " + err.message);
			}
			//重置数组
			var isArray = ($.type(d)=="array");
			if (isArray) {
				this.refill(d);
			} else {
				this.refill([d]);
			}
			Object.defineProperty(this, "isRawArray", {
				enumerable: false,
				configurable: true,
				value: isArray,
				writable: false,
			});
		},
	});
	this.onchange = function() {}
	this.isChanged = function() {
		if (_source) {
			return _source.jsonString != this.jsonString; 
		}
		return true;
	}
	this.fireChangeEvent = function() {
		this.onchange();
		for(var k in this.linked) {
			var lai = this.linked[k];
			lai.fireChangeEvent();
		}
	}
	
	var _arrayMethods=['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
	_arrayMethods.forEach(function(method) {
		Object.defineProperty(_me, method, {
			enumerable: false,
			configurable: true,
			value: function() {
				var r = Array.prototype[method].apply(_dataArray, arguments);
				_modcount++;
				for(var k in _me.linked) {
					var lai = _me.linked[k];
					lai[method].apply(lai, arguments);
				}
				return r;
			},
			writable: false,
		});
	});
	Object.defineProperty(this, "length", {
		enumerable: false,
		configurable: true,
		get: function() {
			return _dataArray.length;
		},
		set: function(n) {
			_dataArray.length=n;
			_modcount++;
			for(var k in this.linked) {
				var lai = this.linked[k];
				lai.length=n;
			}
		},
	});
	Object.defineProperty(this, "get", {
		enumerable: false,
		configurable: true,
		value: function(i) {
			return _dataArray[i];
		},
		writable: false,
	});
	Object.defineProperty(this, "set", {
		enumerable: false,
		configurable: true,
		value: function(i,v) {
			_dataArray[i] = v;
			_modcount++;
			for(var k in this.linked) {
				var lai = this.linked[k];
				lai.set(i,v);
			}
			return _dataArray[i];
		},
		writable: false,
	});
	Object.defineProperty(this, "del", {
		enumerable: false,
		configurable: true,
		value: function(i) {
			var v=_dataArray[i];
			delete _dataArray[i];
			_modcount++;
			for(var k in this.linked) {
				var lai = this.linked[k];
				lai.del(i);
			}
			return v;
		},
		writable: false,
	});
};
(function() {
	LinkageData.prototype = {};
	Object.defineProperty(LinkageData.prototype, "instances", {
		enumerable: false,
		configurable: true,
		value: 0,
		writable: true,
	});
})();

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
			var isArray = ($.type(d)=="array");
			if (isArray) {
				dd.refill(d);
			} else {
				dd.refill([d]);
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
		dd.onloaded();
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
			dd.onloaded();
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
		var cacheData = cache[url];
		if (!cacheData || !cacheData.expires || (new Date()).getTime()>(cacheData.expires)) {
			if (!cacheData) {
				cacheData = new LinkageData();
				Object.defineProperty(cacheData, "_src", {
					enumerable: false,
					configurable: true,
					value: url,
					writable: false,
				});
				cacheData.url = function() { return this._src; };
				cacheData.src = function() { return this._src; };
				cacheData.isLoaded = function() { return false; };
				cacheData.isArray = function() { return true; };
				cacheData.onloaded = function() {
					Object.defineProperty(cacheData, "expires", {
							enumerable: false,
							configurable: true,
							value: (new Date()).getTime()+5000,
							writable: false,
						});
					if (cacheData.isChanged()) {
						cacheData.backfill();
					}
				};
			}
			// 读取到的数据一定是数组形式
			cacheData = _load(cacheData, url);
			cache[url] = cacheData;
			if (url != cacheData.url()) {
				cache[cacheData.url()] = cacheData;
			}
		}
		return cacheData;
	};
	this.save = function(dat) {
		if (dat && dat.src && dat.src()) {
			if (dat.isChanged()) {
				try{
					var dvs=dat.values;
					for (var i=0; i<dvs.length; i++) {
						if (!dvs[i].id) {
							dvs[i].id=FAR.get("&cmd=id").id;
						}
					}
					var wds = "";
					if (dat.isArray()) {
						wds = JSON.stringify(dvs, null, 4);
					} else {
						if (dat.length > 0) { // ==1
							wds = JSON.stringify(dvs[0], null, 4);
						}
					}
					var e = FAR.post(dat.src(), wds);
					if (e.error) {
						throw("save data " + dat.src() + " returned error: " + e.error);
					}
				}catch(err){
					throw("save data " + dat.src() + " error: " + err.message + "\r\n" + err.stack);
				}
				dat.backfill();
			}
		}
	};
	return this;
}

var DAR = new Dabra();
