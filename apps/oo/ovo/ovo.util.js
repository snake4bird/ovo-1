//依赖检查 jQuery 和 Vue
{
	if (typeof jQuery === 'undefined' || typeof Vue === 'undefined') {
		throw new Error('ovo JavaScript requires jQuery and Vue')
	}
	var version = $.fn.jquery.split(' ')[0].split('.');
	if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1)) {
		throw new Error('ovo JavaScript requires jQuery version 1.9.1 or higher')
	}
}

;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));

if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

// date.format
Date.prototype.format = function (format) {
	var o = {
		"M+": this.getMonth() + 1, // month
		"d+": this.getDate(), // day
		"h+": this.getHours(), // hour
		"m+": this.getMinutes(), // minute
		"s+": this.getSeconds(), // second
		"q+": Math.floor((this.getMonth() + 3) / 3), // quarter
		"S": this.getMilliseconds() // millisecond
	}

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}

	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
}

window.stamp = {
	toString: function () {
		var t = (new Date()).getTime();
		if (t <= window.time) {
			t = window.time + 1;
		}
		window.time = t;
		return t;
	}
};

// console日志加时间输出
window.now = {
	toString: function () {
		return ((new Date()).format("yyyy-MM-dd hh:mm:ss.S"));
	}
};

window.pcl = {
	toString: function () {
		return now + " : ";
	}
};

var handleCircular = function() {  
    var cache = [];
    var keyCache = []
    return function(key, value) {
    	//console.log(now+" : "+"json stringify - "+key);
		if (typeof value == 'object' && value != null) {
            var index = cache.indexOf(value);
            if (index != -1) {
                return '[Circular refer ' + keyCache[index] + ']';
            }
            cache.push(value);
			var ck = key || 'root';
			keyCache.push(ck);
        }
        if (typeof value == 'function') {
        	return '[Function ' + value.name + ']';
        }
        return value;
    }
}

$.setHiddenAttribte = function(obj,key,value) {
	Object.defineProperty(obj, key, {
			enumerable: false,
			configurable: true,
			value: value,
			writable: false,
		});
	return obj;
}

// Recursive Refer Object to String
$.rro2s = function(o, key, sp) {
	if (o && typeof(o) == 'object') {
		if (o.__recursion__) {
			//console.error("__recursion__: "+key+" ==> "+o.__recursion__);
			return "[Recursive "+key+" ==> "+o.__recursion__+"]";
		}
		var csp;
		if (sp!=null) {
			sp = sp+"  ";
			if (sp.length > 20) {
				return "[Recursive too deep]";
			}
			csp = "\r\n"+sp;
		} else {
			sp = "";
			csp = "";
		}
		try {
			Object.defineProperty(o, "__recursion__", {
								enumerable: false,
								configurable: true,
								value: (key?key:"o"),
								writable: false,
							});
		} catch(e) {
			return "[Recursive here! "+e+"]"
		}
		var s = "";
		for(var k in o) {
			if (typeof(o[k]) != 'function') {
				s += csp+k+":"+$.rro2s(o[k], o.__recursion__+"."+k, sp);
				csp = csp?csp:"\r\n";
			}
		}
		delete o.__recursion__;
		return s;
	} else if (typeof(o) == 'string') {
		return '"'+o+'"';
	} else {
		return ""+o;
	}
};

$.clone = function(o) {
	return o?JSON.parse(JSON.stringify(o)):null;
}

window.o2s = function(o) {
	return JSON.stringify(o, handleCircular(), " ");
};

// 同步加载文本
window.loadtext = function (url) {
	try {
		return $.ajax({
			url: url,
			mimeType: "text/plain",
			async: false,
			cache: false,
		}).responseText;
	} catch (e) {
		console.log(pcl + e.message);
	}
	return "";
};

// 加载JSON
window.loadjson = function (url, obj, key) {
	try {
		if ($.type(obj) == "object" && $.type(key) == "string") {
			$.ajax({
				url: url,
				mimeType: "text/plain",
				cache: false,
			}).done(function(txt) {
				if (txt) { 
					setTimeout(function() {
						try {
							var data;
							eval("data=" + txt);
							Vue.set(obj, key, data);
						} catch (e) {
							console.log(pcl + url + " 数据加载错误 " + e.message);
						}
					}, 0);
				}
			});
			return obj[key];
		} else {
			var txt = loadtext(url);
			if (txt) {
				var data;
				eval("data=" + txt);
				return data;
			}
		}
	} catch (e) {
		console.log(pcl + url + " 数据加载错误 " + e.message);
	}
	return {};
};

// 给对象增加$:{id,pid}
// 用于标记对象关系
window.index_all = function (d, pid) {
	if (typeof(d) == "object") {
		if (!d.$) {
			d.$ = { id: ""+window.stamp };
		}
		d.$.pid = pid;
		for(var x in d) {
			if (x != '$') {
				this.idx_all(d[x], d.$.id);
			}
		}
	}
};

window.distance = function (elem, xx, yy) {
	var left = parseInt(elem.offset().left);
	var top = parseInt(elem.offset().top);
	var right = left + parseInt(elem.outerWidth());
	var bottom = top + parseInt(elem.outerHeight());
	return {
		dlt: parseInt(Math.floor(Math.sqrt(Math.pow(xx - left, 2) + Math.pow(yy - top, 2)))),
		dlb: parseInt(Math.floor(Math.sqrt(Math.pow(xx - left, 2) + Math.pow(yy - bottom, 2)))),
		drt: parseInt(Math.floor(Math.sqrt(Math.pow(xx - right, 2) + Math.pow(yy - top, 2)))),
		drb: parseInt(Math.floor(Math.sqrt(Math.pow(xx - right, 2) + Math.pow(yy - bottom, 2)))),
	};
};

window.distanceh = function (elem, xx, yy) {
	var left = parseInt(elem.offset().left);
	var right = left + parseInt(elem.outerWidth());
	return {
		dhl: parseInt(Math.floor(Math.abs(xx - left))),
		dhr: parseInt(Math.floor(Math.abs(xx - right))),
	};
};

window.distancev = function (elem, xx, yy) {
	var top = parseInt(elem.offset().top);
	var bottom = top + parseInt(elem.outerHeight());
	return {
		dvt: parseInt(Math.floor(Math.abs(yy - top))),
		dvb: parseInt(Math.floor(Math.abs(yy - bottom))),
	};
};


Object.insertItem = function (obj, beforeKey, newKey, nv) {
	delete obj[newKey];
	if (beforeKey == null) {
		obj[newKey] = nv;
	} else {
		var oks = Object.keys(obj);
		for (var i = 0; i < oks.length && beforeKey != oks[i]; i++) {
		}
		obj[newKey] = nv;
		// 从 beforeKey 开始，后移所有属性
		for (; i < oks.length; i++) {
			var ok = oks[i];
			var v = obj[ok];
			delete obj[ok];
			obj[ok] = v;
		}
	}
};

window.elementFromPoint_check = false;
window.elementFromPoint_isRelative = true;
window.elementFromPoint = function (x, y) {
	if (!document.elementFromPoint)
		return null;
	if (!elementFromPoint_check) {
		var sl;
		if ((sl = $(document).scrollTop()) > 0) {
			elementFromPoint_isRelative = (document.elementFromPoint(0, sl + $(window).height() - 1) == null);
		} else if ((sl = $(document).scrollLeft()) > 0) {
			elementFromPoint_isRelative = (document.elementFromPoint(sl + $(window).width() - 1, 0) == null);
		}
		elementFromPoint_check = (sl > 0);
	}
	if (!elementFromPoint_isRelative) {
		x += $(document).scrollLeft();
		y += $(document).scrollTop();
	}
	return document.elementFromPoint(x, y);
};

