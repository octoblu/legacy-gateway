#!/bin/bash
### BEGIN INIT INFO
# Provides:          skynet-hub
# Required-Start:    $local_fs $remote_fs $network
# Required-Stop:     $local_fs $remote_fs $network
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start or stop the skynet hub
### END INIT INFO

USER=pi
SCRIPT_DIR='/home/pi/hub/'


# DONT'T CHANGE unless you know what you're doing
NAME=skynet-hub
DAEMON=/usr/local/bin/node
OPTIONS="server.js"
LOG='/home/pi/hub/hub.log'

PIDFILE=/home/pi/hub/hub.pid

. /lib/lsb/init-functions

start_daemon () {
        start-stop-daemon --start --chdir $SCRIPT_DIR --background \
        --chuid $USER --name $NAME \
                $START_STOP_OPTIONS --make-pidfile --pidfile $PIDFILE \
        --startas /bin/bash -- -c "exec $DAEMON $OPTIONS >> $LOG 2>&1"
                log_end_msg 0
}

case "$1" in
        start)
                        log_daemon_msg "Starting daemon" "$NAME"
                        start_daemon

        ;;
        stop)
             log_daemon_msg "Stopping daemon" "$NAME"
                         start-stop-daemon --stop --quiet \
            --chuid $USER \
            --chdir $SCRIPT_DIR \
            --exec $DAEMON --pidfile $PIDFILE --retry 30 \
            --oknodo || log_end_msg $?
                        log_end_msg 0
        ;;
        restart)
      $0 stop
      sleep 5
      $0 start
    ;;
    status)
        status_of_proc "$DAEMON" "$NAME"
        exit $?
        ;;

        *)
                echo "Usage: $0 {start|stop|restart}"
                exit 1
esac
exit 0
