lumus
=====

[![Build Status](https://travis-ci.org/ziacik/lumus.svg?branch=master)](https://travis-ci.org/ziacik/lumus)

Lightweight web application for convenient automatic torrent searching and managing of movies, shows and music.
Alternative to SickBeard, CouchPotato and Headphones. Integration with transmission and XBMC.

How to install
-----

### Linux

#### Transmission

Only a daemon is needed (service running at background) instead of full-featured client.

1. Install transmission  
	`$ sudo apt-get install transmission-daemon`
	
2. Set it to run at startup  
	`$ sudo update-rc.d transmission-daemon defaults`
	
3. Stop the deamon  
	`$ sudo /etc/init.d/transmission-daemon stop`
	
4. Configure  
	`$ sudo nano /etc/transmission-daemon/settings.json`
	
	You may also use `vi` if you prefer, or any other editor.  
	`$ sudo vi /etc/transmission-daemon/settings.json`
	
	You should at least change these settings:
	* `download-dir` to some generic download directory such as ~/Downloads (lumus will move the files to destination directories from here),
	* `incomplete-dir` to some generic incomplete downloads directory such as ~/Downloading,
	* `incomplete-dir-enabled` to `true`,
	* `rpc-enabled` to `true`.
	
#### Node.js
Node.js is a platform which this application runs on. Npm is a package manager for node.js.

`sudo apt-get install nodejs npm`  
Answer `Y` if asked.

#### Lumus

1. Install lumus  
`sudo npm install -g lumus`

2. Run the application
`lumus`

3. Browse the application url in your webbrowser.  
Use correct ip address or hostname instead of *localhost* if you installed the application on a dedicated server.  
[http://localhost:3001](http://localhost:3001)

#### XBMC (optional)

Optionally, you may want to install [XBMC](http://xbmc.org/) to get automatic library updates and notifications from lumus.

### Windows

#### Transmission

1. Install transmission  
	Windows support is not yet official, but there is an unofficial port [here](http://sourceforge.net/projects/trqtw/).	
	
2. Configure to allow rpc  
	
#### Node.js
Node.js is a platform which this application runs on. Npm is a package manager for node.js.

Download and install with [node.js installer](http://nodejs.org/download/).  

#### Lumus

There is no windows installer yet, so you need to use command line.

1. Open command line 
`cmd`

2. Install lumus 
`npm install -g lumus`

2. Run the application  
`lumus`

3. Browse the application url in your webbrowser.  
Use correct ip address or hostname instead of *localhost* if you installed the application on a dedicated server.  
[http://localhost:3001](http://localhost:3001)

#### XBMC (optional)

Optionally, you may want to install [XBMC](http://xbmc.org/) to get automatic library updates and notifications from lumus.


Notes
-----

* This how-to is incomplete.
* This project is a work in progress.
* This tool does not download any content. It only provides a convenient search interface. You should only download content that is legal in your country.