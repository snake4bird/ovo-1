<%@page language="java" import="java.util.*" import="java.io.*"
	pageEncoding="utf-8"%><%!
	private static java.text.SimpleDateFormat filetimesdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	// 文件操作标记 - 移动
	private static int OP_MOVE = (int)'m';
	// 文件操作标记 - 复制
	private static int OP_COPY = (int)'c';
	// 文件处理根目录
	private static String sroot = "data";
	static {
		try
		{
			sroot = new File(System.getProperty("far.file", sroot)).getCanonicalPath();
		}
		catch(Exception e)
		{
		}
	}
	// 处理脚本目录
	private static String sproc = "proc";
	static {
		try
		{
			sproc = new File(System.getProperty("far.proc", sproc)).getCanonicalPath();
		}
		catch(Exception e)
		{
		}
	}
	private static File fproc = new File(sproc);
	// 文件存储目录
	private static String swork = sroot + "/cv";
	static {
		try
		{
			swork = new File(System.getProperty("far.work", swork)).getCanonicalPath();
		}
		catch(Exception e)
		{
		}
	}
	private static File fwork = new File(swork);
	// 文件历史目录
	private static File[] fhistory = initHistoryDirs();
	
	private static long longValue(String s) {
		try
		{
			return (Long.valueOf(s));
		}
		catch(Exception e)
		{
		}
		return 0;
	}

	private static File[] initHistoryDirs() {
		String hisp = System.getProperty("http.file.manger.history", sroot + "/v");
		int n = (int)longValue(System.getProperty("http.file.manger.history.count", "2"));
		File[] fhistory = new File[n];
		if (hisp.length()>0 && n>0) {
			for(int i=0; i<n; i++) {
				fhistory[i] = new File(hisp + "." + (i+1));
			}
		}
		return fhistory;
	}
	
	// 危险操作! 删除物理文件或目录
	private boolean deleteFileOnDisk(File cfile) {
		if (cfile.isDirectory()) {
			File[] flfs = cfile.listFiles();
			for(int i=0; i<flfs.length; i++) {
				deleteFileOnDisk(flfs[i]);
			}
		}
		return cfile.delete();
	}
	
	// 保留文件历史
	private String renameExistFile(File cfile, File fmain, File[] historydirs, int idx, int op) throws IOException
	{
		// 主目录
		String smain = idx==0?fmain.getCanonicalPath():historydirs[idx-1].getCanonicalPath();
		// 相对路径
		String sfile = cfile.getCanonicalPath();
		if (sfile.indexOf(smain)!=0) {
			throw new IOException("The file '"+sfile+"' is not in the scope of management");
		}
		String spath = sfile.substring(smain.length()).replace(File.separator, "/");
		if (cfile.exists()) {
			if (idx>=0 && idx<historydirs.length) {
				// 目标目录
				File hdir = historydirs[idx];
				// 目标文件
				File fnn = new File(hdir, spath);
				if (fnn.exists())
				{
					// 目标文件已存在，先移走目标文件
					String msg = renameExistFile(fnn, fmain, historydirs, idx + 1, OP_MOVE);
					if (msg.length()>0) {
						return msg;
					}
				}
				// 确保目标目录存在
				if (!fnn.getParentFile().exists()) {
					fnn.getParentFile().mkdirs();
				}
				if (OP_MOVE == op) {
					// 移动文件
					System.out.println("move " + cfile + " to " + fnn);
					cfile.renameTo(fnn);
					if (cfile.exists()) {
						return "can't move file " + spath + " from " + "v"+(idx) + " to " + "v"+(idx+1);
					}
				} else if (OP_COPY == op) {
					// 复制文件
					System.out.println("copy " + cfile + " to " + fnn);
					try {
						bito.util.E.V().copyFile(cfile, fnn);
					} catch(IOException e) {
						e.printStackTrace();
						return "can't copy file " + spath + " from " + "v"+(idx) + " to " + "v"+(idx+1);
					}
				} else {
					return "unkown operator type " + op;
				}
			} else {
				// 没有更多可用历史目录
				if (OP_MOVE == op) {
					// 执行删除操作，直接删除
					System.out.println("delete " + cfile);
					if (!deleteFileOnDisk(cfile)) {
						return "can't delete file " + spath + " in " + "v"+idx;
					}
				} else if (OP_COPY == op) {
					// 执行备份操作，无法完成备份
					return "can't backup file " + spath + ", no backup directory.";
				} else {
					return "unkown operator type " + op;
				}
			}
		} else {
			// 源文件不存在
			return "source file " + spath + " not exists.";
		}
		return "";
	}

	public String moveFile(File fpath) throws IOException
	{
		return renameExistFile(fpath, fwork, fhistory, 0, OP_MOVE);
	}

	public String backupFile(File fpath) throws IOException
	{
		return renameExistFile(fpath, fwork, fhistory, 0, OP_COPY);
	}
	
	public String restoreFile(File fpath) throws IOException
	{
		return restoreFileVersion(fpath, fwork, fhistory, 0);
	}

	private String restoreFileVersion(File cfile, File fmain, File[] historydirs, int idx) throws IOException
	{
		// 主目录
		String smain = idx==0?fmain.getCanonicalPath():historydirs[idx-1].getCanonicalPath();
		// 相对路径
		String spath = cfile.getCanonicalPath().substring(smain.length()).replace(File.separator, "/");
		if (idx>=0 && idx<historydirs.length) {
			// 目标目录
			File hdir = historydirs[idx];
			// 目标文件
			File fnn = new File(hdir, spath);
			if (!fnn.isFile())
			{
				System.out.println("can't find backup file " + spath + " in v"+(idx+1));
				// 目标文件不存在或不是普通文件，恢复更早版本
				return restoreFileVersion(cfile, fmain, historydirs, idx + 1);
			}
			try {
				bito.util.E.V().copyFile(fnn, cfile);
			} catch(IOException e) {
				e.printStackTrace();
				return "can't restore file " + spath;
			}
		} else {
			return "can't find backup file " + spath;
		}
		return "";
	}
	
	private LinkedHashMap listFiles(File fwork, File fpath, boolean nest) throws IOException {
		LinkedHashMap m = new LinkedHashMap();
		// get path info
		String swork = fwork.getCanonicalPath();
		String spath = fpath.getCanonicalPath().substring(swork.length());
		File fparent = fpath.equals(fwork)?fwork:fpath.getParentFile();
		String sparent = fparent.getCanonicalPath().substring(swork.length());
		// fill returned message
		m.put("path", "".equals(spath)?"/":spath.replace(File.separator, "/"));
		m.put("parent", "".equals(sparent)?"/":sparent.replace(File.separator, "/"));
		m.put("name", fpath.equals(fwork)?"":fpath.getName());
		m.put("time", filetimesdf.format(new java.util.Date(fpath.lastModified())));
		if (fpath.isDirectory()) {
			m.put("type", "dir");
			if (nest) {
				LinkedList nfiles = new LinkedList();
				File[] flfs = fpath.listFiles();
				for(int i=0; i<flfs.length; i++) {
					LinkedHashMap mf = listFiles(fwork, flfs[i], false);
					nfiles.add(mf);
				}
				m.put("files", nfiles);
			}
		} else {
			m.put("type", "file");
			m.put("size", fpath.length());
		}
		return m;
	}

	public byte[] readBytes(String fpath) throws Exception {
		return bito.util.E.V().readBytes(fpath);
	}
	
	public String readText(String fpath, String enc) throws Exception {
		byte[] rbs = bito.util.E.V().readBytes(fpath);
		return new String(rbs, enc);
	}
	
	public void writeText(String fpath, String content, String enc) throws Exception {
		byte[] bs = content.getBytes(enc);
		bito.util.E.V().writeBytes(new File(fpath), bs, 0L);
	}

	private String MD5(byte[] rbs) throws IOException {
		String ts = "00000000000000000000000000000000";
		try
		{
			java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
			byte[] bs = md.digest(rbs);
			java.math.BigInteger bi = new java.math.BigInteger(1, bs);
			ts = bi.toString(16).toUpperCase();
			while(ts.length() < bs.length * 2)
			{
				ts = "0" + ts;
			}
		}
		catch(java.security.NoSuchAlgorithmException e)
		{
		}
		return ts;
	}
	
	private static HashMap<String, cc.SSH> sshs = new HashMap();
	public cc.SSH SSH(String host, String user, String pass) {
		String key = host + "/" + user + "/" + pass;
		cc.SSH ssh = sshs.get(key);
		if (ssh == null)
		{
			ssh = new cc.SSH(host, user, pass);
			sshs.put(key, ssh);
		}
		return ssh;
	}
	
	private static class ProcRunner {
		assassin.script.ASScriptEngine ae = new assassin.script.ASScriptEngine();
		public ProcRunner(String aename) {
			ae.set("aename", aename);
			ae.eval("status={};");
		}
		public synchronized void set(String key, Object value) {
			ae.set(key, value);
		}
		public synchronized void run(String smodule) {
			try {
				ae.eval("status={status:'running'};");
				ae.exec(sproc+"/ass/common.js");
				ae.exec(sproc+"/ass/ssh.js");
				ae.exec(sproc+"/ass/params.js");
				if (smodule!=null && smodule.length()>0) {
					ae.exec(sproc+"/"+smodule+".js");
				}
			} catch(Throwable e) {
				ae.eval("status.error='"+e.getMessage().replace("'","\\'")+"';");
			} finally {
				ae.eval("status.status='end';");
			}
		}
		public synchronized void eval(String script) {
			ae.eval(script);
		}
		public Object get(String key) {
			return ae.get(key);
		}
	}
	
	private static LinkedHashMap<String, ProcRunner> procs = new LinkedHashMap();
	private ProcRunner aeproc(String spath) {
		ProcRunner pr = procs.get(spath);
		File fpath = new File(spath);
		if (pr == null)
		{
			pr = new ProcRunner(spath);
			procs.put(spath, pr);
		}
		if (!spath.equals(pr.get("workpath")))
		{
			pr.set("FileManager", this);
			pr.set("fm", this);
			pr.set("workhome", swork);
			pr.set("fworkhome", fwork);
			pr.set("workpath", spath);
			pr.set("fworkpath", fpath);
			pr.run(null);
		}
		return pr;
	}
%><%
	request.setCharacterEncoding("UTF-8");
	response.setContentType("text/plain; charset=UTF-8");
	response.setHeader("Pragma", "No-cache");
	response.setHeader("Cache-Control", "no-cache");
	response.setDateHeader("Expires", 0);
	//
	String msg = null;
	LinkedHashMap m = new LinkedHashMap();
	//
	try
	{
		// 在getParameter之前getInputStream取出post数据
		// Tomcat 8 以后，JSP不支持 PUT DELETE 方法
		byte[] bs = new byte[0];
		InputStream is = request.getInputStream();
		int n = request.getContentLength();
		String default_cmd = "read";
		if (n > 0 || is.available() > 0 || "PUT".equalsIgnoreCase(request.getMethod()) || "POST".equalsIgnoreCase(request.getMethod()))
		{
			bs = bito.util.E.V().readBytes(is);
			default_cmd = "save";
		}
		else if ("DELETE".equalsIgnoreCase(request.getMethod()))
		{
			default_cmd = "delete";
		}
		//
		String cmd = request.getParameter("cmd");
		if (cmd == null || cmd.length() == 0) {
			cmd = default_cmd;
		}
		String path = request.getParameter("path");
		if (path == null) {
			path = "";
		}
		path = new String(path.getBytes("iso-8859-1"), "utf-8");
		while (path.startsWith("/")) {
			path = path.substring(1);
		}
		String spath = new File(fwork,path).getCanonicalPath();
		if(spath.indexOf(swork)<0) {
			throw new Exception("Invalid file path.");
		}
		File fpath = new File(spath);
		String smodule = spath.length()>swork.length()?spath.substring(swork.length()+1):"";
		
		ProcRunner ae = aeproc(spath);
		ae.set("params", request.getParameterMap());
		//
		if ("id".equals(cmd)) {
			m.put("id", "ID"+bito.util.E.V().getStamp());
		} else if ("wget".equals(cmd)) {
			String url=request.getParameter("url");
			m.put("url", url);
			m.put("response", new String(new bito.net.URLReader().ReadURL(url), "UTF-8"));
		} else if ("info".equals(cmd)) {
			m.put("params", ae.get("params"));
		} else if ("servers".equals(cmd)) {
			byte[] rbs = bito.util.E.V().readBytes(new File(fproc, "ass/xpassword.json").getCanonicalPath());
			String s = new String(rbs, "UTF-8");
			s = s.replaceAll("(?is)([\\{\\,])\\s*\\\"?pass\\\"?\\s*:\\s*\\\"[^\\\"]*\\\"\\,?", "$1");
			OutputStream os = response.getOutputStream();
			os.write(s.getBytes("UTF-8"));
			os.flush();
			return;
		} else if ("agents".equals(cmd)) {
			if (bs.length>0) {
				ae.set("sdata", new String(bs));
				ae.run("ass/update_agents");
			}
			m.putAll((Map)ae.get("agents"));
		} else if ("setting".equals(cmd)) {
			if (bs.length>0) {
				ae.set("sdata", new String(bs));
				ae.run("ass/update_setting");
			}
			m.putAll((Map)ae.get("setting"));
		} else if ("proc".equals(cmd)) {
			ae.run(smodule);
			m.put("status", ae.get("status"));
		} else if ("proc.start".equals(cmd)) {
			String procid = "P"+bito.util.E.V().getStamp();
			ProcRunner ar = ae;
			procs.put(procid, ar);
			new Thread(){
				String pid;
				ProcRunner ar;
				String jsfname;
				public void start(String pid, ProcRunner ar, String jsfname) {
					this.pid = pid;
					this.ar = ar;
					this.jsfname = jsfname;
					super.start();
				}
				public void run() {
					try {
						ar.run(jsfname);
					} finally {
						java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("HH:mm:ss");
						long t = System.currentTimeMillis() + 600*1000;
						long n;
						while((n=t-System.currentTimeMillis())>0) {
							try {
								sleep(200);
							} catch(Throwable e) {
							}
							ar.eval("status.end"+pid+"='"+sdf.format(new Date(n-8*3600*1000))+"';");
						}
						ar.eval("delete status.end"+pid+";");
						procs.remove(pid);
					}
				}
			}.start(procid, ar, fpath.getName());
			m.put("return", "script running on background.");
			m.put("pid", procid);
			m.put("status", ar.get("status"));
		} else if ("proc.status".equals(cmd)) {
			String procid = request.getParameter("pid");
			ProcRunner ar = procs.get(procid);
			m.put("pid", procid);
			m.put("status", ar==null?null:ar.get("status"));
		} else if ("proc.end".equals(cmd)) {
			String procid = request.getParameter("pid");
			ProcRunner ar = procs.remove(procid);
			m.put("pid", procid);
			m.put("status", ar==null?null:ar.get("status"));
		} else if ("save".equals(cmd)) {
			long ftime = longValue(request.getParameter("ftime"));
			long rfrom = longValue(request.getParameter("rfrom"));
			long rto = longValue(request.getParameter("rto"));
			System.out.println("writeBytes " + fpath + " " + bs.length + " n="+n + " rto="+rto);
			bito.util.E.V().writeBytes(fpath, bs, rfrom);
			if (ftime != 0) {
				fpath.setLastModified(ftime);
			}
			m.putAll(listFiles(fwork, fpath, true));
		} else if ("mkdir".equals(cmd)) {
			fpath.mkdirs();
			m.putAll(listFiles(fwork, fpath, true));
		} else if ("get".equals(cmd)) {
			response.resetBuffer();
			response.setContentType("application/octet-stream");
			response.setHeader("Content-Disposition", "attachment; filename=\""+fpath.getName()+"\"");
			byte[] rbs = bito.util.E.V().readBytes(fpath.getCanonicalPath());
			OutputStream os = response.getOutputStream();
			os.write(rbs);
			os.flush();
			return;
		} else if ("read".equals(cmd)) {
			if (!fpath.isDirectory()) {
				byte[] rbs = bito.util.E.V().readBytes(fpath.getCanonicalPath());
				m.put("content", new String(rbs, "UTF8"));
				m.put("md5", MD5(rbs));
			}
			m.putAll(listFiles(fwork, fpath, true));
		} else if ("md5".equals(cmd)) {
			byte[] rbs = bito.util.E.V().readBytes(fpath.getCanonicalPath());
			m.put("md5", MD5(rbs));
			m.putAll(listFiles(fwork, fpath, true));
		} else if ("delete".equals(cmd) || "del".equals(cmd)) {
			msg = moveFile(fpath);
			m.put("deleted", "".equals(msg));
			m.putAll(listFiles(fwork, fpath, true));
		} else if ("backup".equals(cmd)) {
			msg = backupFile(fpath);
			m.put("backup", "".equals(msg));
			m.putAll(listFiles(fwork, fpath, true));
		} else if ("restore".equals(cmd)) {
			msg = restoreFile(fpath);
			m.put("restore", "".equals(msg));
			m.putAll(listFiles(fwork, fpath, true));
		} else if ("list".equals(cmd)) {
			m.putAll(listFiles(fwork, fpath, true));
		} else {
			m.putAll(listFiles(fwork, fpath, true));
			// m.put("error", "unkown command");
		}
		//
		if (msg != null && msg.length() > 0) {
			m.put("error", msg);
		}
		System.out.println(bito.util.E.V().toJSONString(m));
	}
	catch(Throwable e)
	{
		e.printStackTrace();
		m.put("error", e.getMessage());
	}
	String stext = bito.util.E.V().toJSONString(m);
%><%=stext%>
