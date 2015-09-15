Lumus
=====

[![Build Status](https://travis-ci.org/ziacik/lumus.svg?branch=master)](https://travis-ci.org/ziacik/lumus)
[![NPM version](https://badge.fury.io/js/lumus.svg)](http://badge.fury.io/js/lumus)

Search for movies, shows and music and add them automatically to Transmission when they appear on torrents. Lightweight all-in-one alternative to SickBeard, CouchPotato and Headphones. Integration with Kodi.

# Screenshots

<table>
  <tr>
    <td>Main Screen</td>
    <td>Search Results</td>
  </tr>
  <tr>
    <td><img src="/../gh-pages/screenshots/Main.png?raw=true" /></td>
    <td><img src="/../gh-pages/screenshots/Results.png?raw=true" /></td>
  </tr>
  <tr>
    <td>Season Selection</td>
    <td>Album Selection</td>
  </tr>
  <tr>
    <td><img src="/../gh-pages/screenshots/Seasons.png?raw=true" /></td>
    <td><img src="/../gh-pages/screenshots/Albums.png?raw=true" /></td>
  </tr>
  <tr>
    <td>Torrent Chooser</td>
    <td>Settings</td>
  </tr>
  <tr>
    <td><img src="/../gh-pages/screenshots/Chooser.png?raw=true" /></td>
    <td><img src="/../gh-pages/screenshots/Settings.png?raw=true" /></td>
  </tr>
</table>

# Install on OSMC or Linux

## Quick start

To install Transmission, use AppStore. Make sure you have `rpc-enabled` setting set to `true` and `rpc-authentication-required` set to `false` or `rpc-whitelist` configured correctly. Also, consider setting `umask` setting to `2`.

To install and run Lumus, run this in console.  
`sudo apt-get -y --purge remove node`  
`sudo apt-get -y install nodejs npm git`  
`sudo update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10`  

`sudo npm install -g lumus`  
`cd && mkdir Lumus && cd Lumus && lumus`  

Navigate to [http://[Your Device IP or HostName]:3001](http://[Your Device IP or HostName]:3001)

### To make it run as service

Install and configure `forever-service`.  
`sudo npm install -g forever`  
`sudo npm install -g forever-service`  
`sudo update-rc.d lumus defaults`  

To start for the first time, you can use  
`sudo service lumus start`  

Check the logfile `/var/log/lumus.log` if something doesn't work as expected.

# Install on Windows

## Install Transmission
Windows support for Transmission is not yet official, but there is an unofficial port [here](http://sourceforge.net/projects/trqtw/).	

## Install Node.js
Download and install with [node.js installer](http://nodejs.org/download/).  

## Install Lumus
There is no windows installer yet, so you need to use command line.

1. Open command line 
`cmd`

2. Install Lumus 
`npm install -g lumus`

2. Run the application  
`lumus`

3. Browse the application url in your webbrowser.  
Use correct ip address or hostname instead of *localhost* if you installed the application on a dedicated server.  
[http://localhost:3001](http://localhost:3001)

## Install Kodi
Optionally, you may want to install [Kodi](http://kodi.tv/) to get automatic library updates and notifications from Lumus.
