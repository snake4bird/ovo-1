$.FileManager = function() {
	var me = this;
	var cur_js_path = function () {
			var all_js = document.scripts;
			var cur_js = all_js[all_js.length - 1];
			return cur_js.src.substring(0, cur_js.src.lastIndexOf("/"));
		}();
	var cur_doc_base = cur_js_path.substring(0, cur_js_path.lastIndexOf("/"));
	me.urls = {
		id: cur_doc_base+"/?cmd=id",
		servers: cur_doc_base+"/?cmd=servers",
		proc: cur_doc_base+"/?cmd=proc",
		proc_start: cur_doc_base+"/?cmd=proc.start",
		proc_status: cur_doc_base+"/?cmd=proc.status",
		proc_end: cur_doc_base+"/?cmd=proc.end",
		list: cur_doc_base+"/?cmd=list",
		get: cur_doc_base+"/?cmd=get",
		read: cur_doc_base+"/?cmd=read",
		md5: cur_doc_base+"/?cmd=md5",
		mkdir: cur_doc_base+"/?cmd=mkdir",
		save: cur_doc_base+"/?cmd=save",
		del: cur_doc_base+"/?cmd=del",
		backup: cur_doc_base+"/?cmd=backup",
		restore: cur_doc_base+"/?cmd=restore",
	};
	
	var cbset = function() {
		this._cb = null;
		this._response = null;
		this.cb = function(response){
			if (this._cb) {
				this._cb(response);
				this._response = null;
			} else {
				this._response = response;
			}
		};
		this.done = function(cb) {
			this._cb = cb;
			if (this._response) {
				this.cb(this._response);
			}
			return this;
		};
		return this;
	};
	
	var go = function(url, fpath) {
		var cbs = new cbset();
		url += (fpath?("&path=" + encodeURIComponent(fpath)):"");
		$.ajax({url : url})
			.done(function(responseText) {
				var response;
				eval("response="+responseText);
				cbs.cb(response);
			});
		return cbs;
	};
	
	var uploadChunkBytes = function(url, bytes, rangefrom, rangeto, cb) {
		url += "&rfrom="+rangefrom+"&rto="+rangeto;
		$.ajax({
			url: url,
			type: "PUT",
			processData: false,
			data: bytes,
		}).done(function(responseText){
			cb(responseText);
		});
	}

	var uploadBytesConitnue = function(url, bytes, chunksize, rf, rt, events) {
		if (rt > bytes.byteLength) {
			rt = bytes.byteLength;
		}
		var chunkbytes = (rf==0&&rt==bytes.byteLength)?bytes:bytes.slice(rf, rt);
		uploadChunkBytes(url, chunkbytes, rf, rt,
			function(responseText){
				events.onprogress();
				if (rt >= bytes.byteLength) {
					events.oncompleted(responseText);
				} else {
					// console.log("upload chunk complete " + rf + " - " + rt);
					rf = rt;
					rt += chunksize;
					uploadBytesConitnue(url, bytes, chunksize, rf, rt, events);
				}
			});
	}
	
	var uploadBytes = function(rcd, inputfile, bytes, chunksize, events) {
		var url = me.urls.save;
		var fpath = rcd + "/" + inputfile.name;
		url += "&path=" + encodeURIComponent(fpath) + "&ftime=" + inputfile.lastModified;
		uploadBytesConitnue(url, bytes, chunksize, 0, chunksize, events);
	}

	this.id = function() {
		return go(me.urls.id);
	};
	this.servers = function() {
		return go(me.urls.servers);
	};

	this.proc = function(fpath) {
		return go(me.urls.proc, fpath);
	};
	this.proc.start = function(fpath) {
		return go(me.urls.proc_start, fpath);
	};
	this.proc.status = function(pid) {
		return go(me.urls.proc_status+"&pid=" + pid);
	};
	this.proc.end = function(pid) {
		return go(me.urls.proc_end+"&pid=" + pid);
	};

	this.list = function(fpath) {
		return go(me.urls.list, fpath);
	};
	
	this.get = function(fpath) {
		var url = me.urls.get;
		url += "&path=" + encodeURIComponent(fpath);
		var w = window.open(url);
	};

	this.read = function(fpath) {
		return go(me.urls.read, fpath);
	};

	this.md5 = function(fpath) {
		return go(me.urls.md5, fpath);
	};
	
	this.mkdir = function(fpath) {
		return go(me.urls.mkdir, fpath);
	};
	
	this.save = function(fpath, content, chunksize) {
		var cbs = new cbset();
		
		var url = me.urls.save;
		url += "&path=" + encodeURIComponent(fpath);
		
		$.ajax({url : url, type: "PUT", processData: false, data: content})
			.done(function(responseText) {
				var response = JSON.parse(responseText);
				cbs.cb(response);
			});
		return cbs;
	};
	
	this.upload = function(rcd, fileinput, bytes, chunksize, events) {
		return uploadBytes(rcd, fileinput, bytes, chunksize, events);
	};

	this.del = function(fpath) {
		return go(me.urls.del, fpath);
	};
	
	this.backup = function(fpath) {
		return go(me.urls.backup, fpath);
	};
	
	this.restore = function(fpath) {
		return go(me.urls.restore, fpath);
	};
};
$.FM = new $.FileManager();

FileUploader = new function() {
	this.getObjectURL = function(file) {
		var url = null;
		if (window.createObjectURL) { // basic
			url = window.createObjectURL(file);
		} else if (window.URL && window.URL.createObjectURL) { // mozilla(firefox)
			url = window.URL.createObjectURL(file);
		} else if (window.webkitURL && window.webkitURL.createObjectURL) { // webkit or chrome
			url = window.webkitURL.createObjectURL(file);
		}
		return url;
	};
	
	this.upload = function(file, rcd){
		var events = {
			onloadstart: function() {},
			onloading: function() {},
			onloadend: function() {},
			onprogress: function() {},
			oncompleted: function(responseText) {},
			onerror: function(e) {},
		};
		var uploader = {
			onloadstart: function(cb) { events.onloadstart = $.type(cb)=='function'?cb:function(){}; return this; },
			onloading: function(cb) { events.onloading = $.type(cb)=='function'?cb:function(){}; return this; },
			onloadend: function(cb) { events.onloadend = $.type(cb)=='function'?cb:function(){}; return this; },
			onprogress: function(cb) { events.onprogress = $.type(cb)=='function'?cb:function(){}; return this; },
			oncompleted: function(cb) { events.oncompleted = $.type(cb)=='function'?cb:function(responseText){}; return this; },
			onerror: function(cb) { events.onerror = $.type(cb)=='function'?cb:function(e){}; return this; },
		};
		var reader = new FileReader();
		
		var waiting_timer = null;
		var wait_loading = function() {
			inner_events.onprogress();
			waiting_timer = window.setTimeout(wait_loading, 500);
		}
		var clear_waiting = function() {
			if (waiting_timer) {
				window.clearTimeout(waiting_timer);
				waiting_timer = null;
			}
		}

		var inner_events = {
			onloadstart: function() { events.onloadstart(); },
			onloading: function() { events.onloading(); },
			onloadend: function() { events.onloadend(); },
			onprogress: function() { events.onprogress(); },
			oncompleted: function(responseText) { clear_waiting(); events.oncompleted(responseText); },
			onerror: function(e) { console.log(e); clear_waiting(); events.onerror(e); },
		};

		reader.onloadstart = function () {
			// 这个事件在读取开始时触发
			// console.log("onloadstart file.name=" + file.name + " file.size=" + file.size);
			inner_events.onloadstart();
			inner_events.onprogress();
		}
		reader.onprogress = function (p) {
			// 这个事件在读取进行中定时触发
			// console.log("onprogress loaded " + p.loaded);
			inner_events.onloading();
			inner_events.onprogress();
		}
		reader.onload = function () {
			// 这个事件在读取成功结束后触发
			// console.log("load file success");
		}
		reader.onloadend = function () {
			inner_events.onloadend();
			inner_events.onprogress();
			// 这个事件在读取结束后，无论成功或者失败都会触发
			if (reader.error) {
				inner_events.onerror(reader.error);
			} else {
				// console.log("file loaded, ready to upload");
				try {
					$.FM.upload(rcd, file, reader.result, 1024*1024, inner_events);
				} catch(e) {
					inner_events.onerror(e);
				}
			}
		}

		wait_loading();
		window.setTimeout(function(){reader.readAsArrayBuffer(file);}, 1);
		
		return uploader;
	};
	
	return this;
};