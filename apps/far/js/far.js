var FAR = new function(){
	var me = this;
	var cur_js_path = function () {
			var all_js = document.scripts;
			var cur_js = all_js[all_js.length - 1];
			return cur_js.src.substring(0, cur_js.src.lastIndexOf("/"));
		}();
	var cur_doc_base = cur_js_path.substring(0, cur_js_path.lastIndexOf("/"));
	this.base = cur_doc_base+"/?path=";
	this.go = function(type, rpath, data, cb) {
		var url = me.base+rpath;
		if (cb) {
			return $.ajax({url : url, type: type, mimeType: "text/plain", cache: false, processData: false, data: data})
				.done(function(responseText) {
					var response = JSON.parse(responseText);
					return cb && cb(response);
				});
		} else {
			var s = $.ajax({
				url: url,
				type: type,
				mimeType: "text/plain",
				async: false,
				cache: false,
				processData: false,
				data: data
			}).responseText;
			try{
				return JSON.parse(s);
			}catch(e){
				console.log(s);
				throw e
			}
		}
	}
	this.get = function(rpath, cb) {
		return this.go("GET", rpath, null, cb);
	};
	this.post = function(rpath, data, cb) {
		return this.go("POST", rpath, data, cb);
	};
	this.put = function(rpath, data, cb) {
		return this.go("PUT", rpath, data, cb);
	};
	this.del = function(rpath, cb) {
		return this.go("DELETE", rpath, null, cb);
	};
	return this;
}();
