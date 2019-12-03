/**
	Linkage Data Accesser

*/

LDA = function() {
	//会导致数据变化的内置属性和方法
	built_in_attribues={
		"Array": {
			length: Number,
		}
	},
	built_in_methods={
		"Array": {
			pop: Array.prototype.pop,
			push: Array.prototype.push,
			reverse: Array.prototype.reverse,
			shift: Array.prototype.shift,
			sort: Array.prototype.sort,
			splice: Array.prototype.splice,
			unshift: Array.prototype.unshift,
		},
		"Date": {
			setYear: Date.prototype.setYear,
			setFullYear: Date.prototype.setFullYear,
			setMonth: Date.prototype.setMonth,
			setDate: Date.prototype.setDate,
			setHours: Date.prototype.setHours,
			setMinutes: Date.prototype.setMinutes,
			setSeconds: Date.prototype.setSeconds,
			setMilliseconds: Date.prototype.setMilliseconds,
			setUTCFullYear: Date.prototype.setUTCFullYear,
			setUTCMonth: Date.prototype.setUTCMonth,
			setUTCDate: Date.prototype.setUTCDate,
			setUTCHours: Date.prototype.setUTCHours,
			setUTCMinutes: Date.prototype.setUTCMinutes,
			setUTCSeconds: Date.prototype.setUTCSeconds,
			setUTCMilliseconds: Date.prototype.setUTCMilliseconds,
			setTime: Date.prototype.setTime,
		}
	}
};

LDA.replaceVariable = function(schema, refcolumn, page, design, sv) {
	// 替换变量，字符串中的 {} 所包含的变量名，替换为对应的column值
	// 如果找不到对应的column，不做任何处理
	// 对应的column值为空，不做任何处理？
	var is = 0;
	var ie = 0;
	for(; (is = sv.indexOf("{", ie)) >= ie && (ie = sv.indexOf("}", is)) > is; ) {
		var k = sv.substring(is+1, ie);
		var col = LDA.getColumn(page, k, schema, null);
		schema.deps[col.name] = col.stamp;
		var rv = col.dat;
		if (rv) {
			// 变量取值？
			// 对象中的 value 属性
			// 数组的第一个元素
			if ($.type(rv)=="object") {
				rv = rv.value;
			}
			if (rv instanceof Array) {
				rv = rv[0];
			}
			if ($.type(rv)!="string") {
				rv = JSON.stringify(rv);
			}
			sv = sv.substring(0, is)+rv+sv.substring(ie+1);
			ie = is+rv.length+1;
		} else {
			//ignore undefined or null
		}
	}
	return sv;
};

LDA.getSchema = function(page, name, refcolumn) {
	var schema = page.schemas[name];
	if (!schema) {
		var schema_define = page.design.schemas[name];
		if (!schema_define) {
			console.error("not found schema define " + name);
			return {dat:[]};
		}
		// 初始化schema对象实例
		schema = $.clone(schema_define);
		schema._isSchema = true;
		schema.name = name;
		Object.defineProperty(schema, "page", {
						enumerable: false,
						configurable: true,
						value: page,
						writable: false,
					});
		Object.defineProperty(schema, "design", {
						enumerable: false,
						configurable: true,
						value: page.design,
						writable: false,
					});
		var _dat = new LinkageData();
		schema.dat = [];
		schema.deps = {};
		Object.defineProperty(schema, "refs", {
			enumerable: false,
			configurable: true,
			value: {},
			writable: false,
		});
		schema.url = schema.src;
		schema.default = {};
		{
			for(var fldname in schema.fields) {
				var fld = schema.fields[fldname];
				schema.default[fldname] = fld && fld.default || null;
			}
		}
		schema.transposeDA = function(ds, flds) {
			//  page定义中，按每个column进行存取
			//  每个column对应的数据是一个数组
			//  为方便数据存取，对数据矩阵做转置处理
			//  直接存取数据中指定字段的所有数据
			//  
			//  dat: [
			//      { A: aa1,    B: bb1,   C: cc1 },
			//      { A: aa2,    B: bb2,   C: cc2 },
			//      { A: aa3,    B: bb3,   C: cc3 },
			//   ],
			//
			//           A      B      C
			//      1   aa1    bb1    cc1
			//      2   aa2    bb2    cc2
			//      3   aa3    bb3    cc3
			// 
			//  ==>
			//  dat: {
			//     A: [ aa1, aa2, aa3 ],
			//     B: [ bb1, bb2, bb3 ],
			//     C: [ cc1, cc2, cc3 ],
			//   },
			//
			//           1      2      3
			//      A   aa1    aa2    aa3
			//      B   bb1    bb2    bb3
			//      C   cc1    cc2    cc3
			//
			function redirectDA(rds, i, ods, k) {
				Object.defineProperty(rds, i, {
					enumerable: true,
					configurable: true,
					get: function() {
						return ods[i][k];
					},
					set: function(v) {
						ods[i][k] = v;
					},
				});
			}
			for(var fld in flds) {
				// ds[fld] = [];
				// 隐藏属性，避免在JSON.stringify时无限递归
				Object.defineProperty(ds, fld, {
					enumerable: false,
					configurable: true,
					value: [],
					writable: false,
				});
				for(var i=0; i<ds.length; i++) {
					redirectDA(ds[fld], i, ds, fld);
				}
			}
		};
		schema.reload = function() {
			// 解析替换src url中的变量
			this.url = this.src;
			this.url = LDA.replaceVariable(this, refcolumn, this.page, this.design, this.url);
			this.url = ovo.toAbsoluteURL(this.url);
			if (!_dat.url || this.url!=_dat.url()) {
				// 加载数据
				var ldat = ovo.loadData(this.page.datas, this.name, this.url);
				_dat.link(ldat);
				_dat.url = function() { return ldat.url(); };
				// dat内容可能被交互改变
				_dat.onchange = function() {
					schema.dat=$.clone(_dat.values);
					if (schema.dat.length==0) {
						// 缺省数据
						if (schema.ensure=="default") {
							schema.dat.push($.clone(schema.default));
						}
					}
					schema.update();
				};
				_dat.save = function() {
					_dat.values=schema.dat;
					if (_dat.isChanged()) {
						ldat.values=schema.dat;
						ovo.saveData(ldat);
					}
				};
			}
			if (!this.flds) {
				this.flds = this.fields;
				if(!this.flds || $.type(this.flds) != "object") {
					console.error("必须指定元数据字段信息");
				}
			}
			_dat.onchange();
		};
		var _stamp = -1;
		schema.__defineGetter__("stamp", function() {
				return _stamp;
			});
		schema.__defineSetter__("stamp", function(stamp) {
				if (_stamp != stamp) {
					this.reload();
					_stamp = stamp;
				}
			});
		schema.update = function() {
			console.log("schema data changed, dat.length="+this.dat.length);
			this.transposeDA(this.dat, this.flds);
			for(var k in this.refs) {
				this.refs[k].update && this.refs[k].update();
			}
		};
		schema.newObject = function(pos) {
			var o = {};
			for(var fn in this.flds) {
				o[fn] = "";
			}
			if (pos === undefined) {
				this.dat.push(o);
			} else {
				this.dat.splice(pos, 0, o);
			}
			this.update();
		};
		schema.delObject = function(pos) {
			if (pos === undefined) {
				if (this.dat.length>0) {
					this.dat.splice(this.dat.length-1, 1);
				}
			} else {
				this.dat.splice(pos, 1);
			}
			this.update();
		};
		schema.savingcount = 0;
		schema.save = function() {
			if (this.savingcount == 0) {
				this.savingcount++;
				_dat.save();
				for(var k in this.refs) {
					if (typeof(this.refs[k].save)=="function") {
						this.refs[k].save();
					//} else {
					//	console.warn("refer object save is not function");
					}
				}
				this.update();
				this.savingcount--;
			}
		};
		Vue.set(page.schemas, name, schema);
		schema.stamp = 0;
	}
	if (refcolumn) {
		schema.refs[refcolumn.name] = refcolumn;
	}
	var depchanged = false;
	for(var k in schema.deps) {
		// update all deps' refs
		var col = LDA.getColumn(page, k, refcolumn, null);
		if (col.stamp != schema.deps[k]) {
			depchanged = true;
		}
	}
	schema.stamp = schema.stamp+(depchanged?1:0);
	return schema;
};


LDA.dataCombine = function(rv) {
	// 数据重组
	// 将多个columns组合为一个column
	// 每个column对应的数据是一个数组
	// 组合过程创建的新的数据结构只是对原始数据的索引，数据仍然保存在原对象中
	// dat:  {
	//     A: [ m11, m21, m31 ],
	//     B: [ m12, m22, m32 ],
	//     C: [ n1,  n2  ], 
	//     D: [ s1  ], 不同的column数据长度可能不同
	//   },
	//
	// 组合过程会对不同长度的数组进行交叉组合，组合后的数据长度是原始数据不同长度的最小公倍数
	//
	//  ==>
	//  dat:  [
	//     { A: m11, B: m12, C: n1, D: s1 },
	//     { A: m11, B: m12, C: n2, D: s1 },
	//     { A: m21, B: m22, C: n1, D: s1 },
	//     { A: m21, B: m22, C: n2, D: s1 },
	//     { A: m31, B: m32, C: n1, D: s1 },
	//     { A: m31, B: m32, C: n2, D: s1 },
	//   ],
	//
	var setOKVI = function(o, k, v, i) {
		var _v = v;
		var _k = k;
		var _i = i;
		o.__defineGetter__(k, function() {
			if (_v[_k] instanceof Array) {
				return _v[_k][_i];
			} else {
				return _v[_k];
			}
		});
		o.__defineSetter__(k, function(nv) {
			if (_v[_k] instanceof Array) {
				_v[_k][_i] = nv;
			} else {
				_v[_k] = nv;
			}
		});
	};
	var nrvs = [];
	var rvi = {};
	for(var k in rv) {
		if (rv[k] instanceof Array) {
			rvi[k] = rv[k].length;
		} else {
			rvi[k] = 1;
		}
	}
	var endofall=false;
	for(;!endofall;) {
		endofall = true;
		var nrv={};
		for(var k in rv) {
			rvi[k]--;
			
			setOKVI(nrv, k, rv, rvi[k]);
			
			if (rvi[k]<=0) {
				if (rv[k] instanceof Array) {
					rvi[k] = rv[k].length;
				} else {
					rvi[k] = 1;
				}
			} else {
				endofall=false;
			}
		}
		nrvs.push(nrv);
	}
	nrvs.$cov=rv;
	return nrvs;
};


LDA.getInnerColumnsDefaults = function(page, column) {
	var rv = {};
	for(var k in column.columns) {
		var col = column.columns[k];
		col = LDA.getColumn(page, column.name+"_"+k, column, col);
		var v = col.default;
		if (v != undefined) {
			rv[k] = v;
		}
	}
	return rv;
};

LDA.getColumnDefault = function(page, column) {
	if (column.type=="static") {
		return column.default;
	} else if (column.type=="refer") {
		var pg = page;
		if (column.page && column.page.url != page.url) {
			//TODO 引用其它页面的数据
			//pg = ovo.loadPageDesign(column.app||page.app, column.page.url);
			//...
		}
		var col = LDA.getColumn(pg, column.key, column, null);
		return col.default;
	} else if (column.type=="schema") {
		var schema = LDA.getSchema(page, column.obj, column);
		if (column.fld) {
			if (column.attr && column.attr!="default") {
				if (column.attr=="type") {
					return "string";
				}
				if (column.attr=="require" || column.attr=="unique") {
					return false;
				}
				return column.fld;
			}
			return schema.default[column.fld];
		} else {
			return schema.default;
		}
	} else if (column.type=="complex" || column.type=="combine") {
		var rv = LDA.getInnerColumnsDefaults(page, column);
		return rv;
	} else if (column.type=="expression") {
	} else {
		console.error("unkown column type "+column.type);
	}
};


LDA.getInnerColumnsDatas = function(page, column) {
	function redirectDA(rv, k, col) {
		Object.defineProperty(rv, k, {
			enumerable: true,
			configurable: true,
			get: function() {
				return col.dat;
			},
			set: function(v) {
				col.dat = v;
			},
		});
	}
	var rv = {};
	for(var k in column.columns) {
		var col = column.columns[k];
		col = LDA.getColumn(page, column.name+"_"+k, column, col);
		redirectDA(rv, k, col);
	}
	return rv;
};


LDA.getColumnData = function(page, column) {
	if (column.type=="static") {
		return column.val;
	} else if (column.type=="refer") {
		var pg = page;
		if (column.page && column.page.url != page.url) {
			//TODO 引用其它页面的数据
			//pg = ovo.loadPageDesign(column.app||page.app, column.page.url);
			//...
		}
		var col = LDA.getColumn(pg, column.key, column, null);
		return col.dat;
	} else if (column.type=="schema") {
		var schema = LDA.getSchema(page, column.obj, column);
		var dat = schema.dat;
		if (column.fld) { 
			if (column.attr) {
				var fld = schema && schema.fields && schema.fields[column.fld];
				var attr = fld && fld[column.attr];
				//返回指定字段信息中的指定属性值
				//"label"，"title"，"desc"缺省返回字段名
				//其它属性没有缺省值
				return attr || (column.attr=="label"||column.attr=="title"||column.attr=="desc")&&column.fld || undefined;
			}
			//字段值
			var dfs = dat[column.fld] || [];
			//返回值一定是数组
			return dfs.length>0 && dfs || [null];
		} else {
			return dat; //不指定fld，返回完整数据对象
		}
	} else if (column.type=="complex") {
		var rv = LDA.getInnerColumnsDatas(page, column);
		return rv;
	} else if (column.type=="combine") {
		var rv = LDA.getInnerColumnsDatas(page, column);
		//console.log("orvs:"+o2s([rv]));
		var nrvs = LDA.dataCombine(rv);
		//console.log("nrvs:"+o2s(nrvs));
		return nrvs;
	} else if (column.type=="expression") {
		column.dat = LDA.evalExpr(page, column, column.val);
	} else {
		console.error("unkown column type "+column.type);
	}
};

LDA.evalExpr = function(page, column, expr) {
	// TODO
	return expr;
}

LDA.setColumnData = function(page, column, v) {
	if (column.type=="static") {
		column.dat = column.val = v;
	} else if (column.type=="refer") {
		var pg = page;
		if (column.page && column.page.url != page.url) {
			//TODO 引用其它页面的数据
			//pg = ovo.loadPageDesign(column.app||page.app, column.page.url);
			//...
		}
		var col = LDA.getColumn(pg, column.key, null, null);
		col.dat = v;
	} else if (column.type=="schema") {
		var schema = LDA.getSchema(page, column.obj);
		if (column.fld) {
			var fld = schema && schema.fields && schema.fields[column.fld];
			var attr = fld && fld[column.attr];
			if (fld && column.attr) {
				fld[column.attr] = v;
			} else {
				if (schema.dat[column.fld] != v) {
					if (v instanceof Array) {
						schema.dat[column.fld].length=0;
						schema.dat[column.fld].push.apply(schema.dat[column.fld], v);
					} else {
						schema.dat[column.fld].length=0;
						schema.dat[column.fld].push.apply(schema.dat[column.fld], [v]);
					}
				}
			}
		} else {
			if (schema.dat != v) {
				if (v instanceof Array) {
					schema.dat.length=0;
					schema.dat.push.apply(schema.dat, v);
				} else {
					schema.dat.length=0;
					schema.dat.push.apply(schema.dat, [v]);
				}
			}
		}
	} else if (column.type=="complex" || column.type=="combine") {
		var cov = v;
		if (v.$cov) {
			// 组合数据的数据结构只是对原始数据的索引，数据仍然保存在原对象中
			cov = v.$cov;
		}
		for(var k in column.columns) {
			var col = column.columns[k];
			col = LDA.getColumn(page, column.name+"_"+k, null, null);
			col.dat = cov[k];
		}
	} else if (column.type=="expression") {
	} else {
		console.error("unkown column type "+column.type);
	}
};


LDA.saveColumnData = function(page, column) {
	if (column.type=="static") {
		//ignore
	} else if (column.type=="refer") {
		var pg = page;
		if (column.page && column.page.url != page.url) {
			//TODO 引用其它页面的数据
			//pg = ovo.loadPageDesign(column.app||page.app, column.page.url);
			//...
		}
		var col = LDA.getColumn(pg, column.key, null, null);
		col.save();
	} else if (column.type=="schema") {
		var schema = LDA.getSchema(page, column.obj);
		schema.save();
	} else if (column.type=="complex" || column.type=="combine") {
		for(var k in column.columns) {
			var col = column.columns[k];
			col = LDA.getColumn(page, column.name+"_"+k, null, null);
			col.save();
		}
	} else if (column.type=="expression") {
	} else {
		console.error("unkown column type "+column.type);
	}
};


LDA.getColumn = function(page, columnkey, refcolumn, column_define) {
	var column = page.columns[columnkey];
	if (!column) {
		if (!column_define) {
			column_define = page.design.columns[columnkey];
			if (columnkey == "*" && !column_define) {
				column_define = { type: "complex", columns: {} };
				for (var ck in page.design.columns) {
					column_define.columns[ck] = { type: "refer", key: ck };
				}
			}
		}
		if ($.type(column_define) == "string") {
			column_define = {
				type: "refer",
				key: column_define,
			};
		}
		// 初始化column对象实例
		column = column_define?$.clone(column_define):{};
		column.name = columnkey;
		Object.defineProperty(column, "page", {
						enumerable: false,
						configurable: true,
						value: page,
						writable: false,
					});
		Object.defineProperty(column, "refs", {
						enumerable: false,
						configurable: true,
						value: {},
						writable: false,
					});
		column.vstamp = 0;
		column.update = function() {
			this.default = LDA.getColumnDefault(this.page, this);
			this.dat = LDA.getColumnData(this.page, this);
		};
		Object.defineProperty(column, "_recurcount", {
						enumerable: false,
						configurable: true,
						value: 0,
						writable: true,
					});
		column.save = function() {
			if (this._recurcount == 0) {
				this._recurcount++;
				LDA.saveColumnData(this.page, this);
				for(var k in this.refs) {
					if (typeof(this.refs[k].save)=="function") {
						this.refs[k].save();
					//} else {
					//	console.warn("refer object save is not function");
					}
				}
				this._recurcount--;
			}
		};
		var _dat = undefined;
		column.__defineGetter__("dat", function() {
			return _dat;
		});
		column.__defineSetter__("dat", function(v) {
			if (this._recurcount == 0) {
				this._recurcount++;
				if (_dat != v) {
					_dat = v;
					this.vstamp++;
					LDA.setColumnData(this.page, this, v);
					for(var k in this.refs) {
						if (k[0]=='c') {
							this.refs[k].update();
						} else if (k[0]=='s') {
							this.refs[k].stamp=this.refs[k].stamp+1;
						} else {
							this.refs[k].vstamp=this.refs[k].vstamp+1;
						}
					}
				}
				this._recurcount--;
			} else {
				console.debug(pcl+"ignore recursive object refer.");
			}
		});
		Vue.set(page.columns, columnkey, column);
		column.update();
	}
	if (refcolumn) {
		if (refcolumn._isVue) {
			column.refs["v_"+refcolumn.vctag] = refcolumn;
		} else if (refcolumn._isSchema) {
			column.refs["s_"+refcolumn.name] = refcolumn;
		} else {
			column.refs["c_"+refcolumn.name] = refcolumn;
		}
	//	if (!column.top_referer) {
	//		if (refcolumn.top_referer) {
	//			column.top_referer=refcolumn.top_referer;
	//		} else {
	//			column.top_referer=refcolumn;
	//		}
	//	}
	}
	return column;
};
