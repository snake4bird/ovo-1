<%@page language="java" import="java.util.*" import="java.io.*"
	pageEncoding="utf-8"%><%!
	private static java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
%><%
	request.setCharacterEncoding("UTF-8");
	response.setContentType("text/plain; charset=UTF-8");
	response.setHeader("Pragma", "No-cache");
	response.setHeader("Cache-Control", "no-cache");
	response.setDateHeader("Expires", 0);
	//
	String stext = "";
	for (int i=0; i<100; i++) {
		%><%=sdf.format(new Date()) + " ... " + i %><br/><%="\r\n"%><%
		out.flush();
	}
%><%=stext%>
