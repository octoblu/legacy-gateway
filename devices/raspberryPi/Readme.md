======

# Skynet Hub on Raspberry Pi

======

This directory contains an init script for running Skynet Hub on a Raspberry Pi.  It was tested on the [Raspbian](http://www.raspbian.org/) linux distro.


* Make sure that a recent version of node is available to the pi user.
* Clone the hub into the pi user's home directory: `git clone https://github.com/skynetim/hub.git`
* change directory to hub: `cd hub` 
* Install dependencies: `npm install` (this could take a few minutes)
* Copy the [skynethub.sh](./skynethub.sh) script to the /etc/init.d/  folder
* Allow the script to be runnable `sudo chmod 755 /etc/init.d/skynethub.sh`
* Register the hub service for startup: `sudo update-rc.d skynethub.sh defaults`
* Reboot: `sudo reboot`
