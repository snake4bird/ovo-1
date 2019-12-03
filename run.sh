#!/bin/bash

cd "${0%/*}"

export CD=`pwd`
echo WorkDir: $CD

hash docker
if [[ $? == 0 ]]; then
	docker version
	if [[ $? == 0 ]]; then
		if [[ `docker images | grep -E '^tomcat\s+'` == "" ]]; then
			docker pull tomcat
		fi
		if [[ `docker ps -f name=tomcat | grep tomcat` != "" ]]; then
			docker kill tomcat
		fi
		docker run -dit --rm --name=tomcat -p 80:8080 -v "${CD}/conf":/usr/local/tomcat/conf -v "${CD}/apps":/usr/local/tomcat/webapps -v "${CD}/data":/usr/local/tomcat/data -v "${CD}/proc":/usr/local/tomcat/proc -e JAVA_OPTS="-Dclass.checksum=ignore" tomcat
		docker exec -it tomcat tail -F -n100 logs/catalina.`date +%Y-%m-%d`.log
		exit
	fi
fi

export JAVA_HOME=
export CATALINA_HOME="/opt/Tomcat6.0.37"


export JAVA_OPTS="-Xms64m -Xmx512m -Dclass.checksum=ignore"
export CATALINA_OPTS="-Dport=80 -Dappbase=\"`pwd`/apps\""

export CATALINA_BASE="$CATALINA_HOME"
export CLASSPATH="${CATALINA_HOME}/bin/bootstrap.jar:${CLASSPATH}"
echo "${CLASSPATH}"
export CLASSPATH="${CATALINA_HOME}/bin/tomcat-juli.jar:${CLASSPATH}"
echo "${CLASSPATH}"
export CLASSPATH="${CATALINA_HOME}/bin/commons-daemon.jar:${CLASSPATH}"
echo "${CLASSPATH}"

export PATH=$JAVA_HOME/bin:$PATH


cmd="java $JAVA_OPTS $CATALINA_OPTS -Dcatalina.base=$CATALINA_BASE -Dcatalina.home=$CATALINA_HOME -cp \"${CLASSPATH}\" org.apache.catalina.startup.Bootstrap start"

echo $cmd

while [[ ! -e "!" ]]; do
	eval "$cmd"
done
