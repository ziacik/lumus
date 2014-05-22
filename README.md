lumus
=====

[![Build Status](https://travis-ci.org/ziacik/lumus.svg?branch=master)](https://travis-ci.org/ziacik/lumus)

SickBeard, CouchPotato and Headphones lightweight alternative for automated downloading movies, shows and music with torrents written in node.js.

How to install on Raspbmc / Linux
-----

First we need to install a torrent downloader called [transmission](http://www.transmissionbt.com/). Skip this step if you already have transmission configured.

### Transmission

We only need to install a daemon (service running at background) instead of full-featured client. Thanks to that, less memory will be used.

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
	
### Node.js
This is a required step so that the application can run.

`sudo apt-get install nodejs npm`  
Answer `Y` if asked.

### Lumus

1. Clone lumus sources  
`git clone https://github.com/ziacik/lumus.git`

2. Go to the lumus directory
`cd lumus`

3. Install dependencies  
`npm install`

4. Run  
`node app.js`

5. Browse to configure  
[http://localhost:3001](http://localhost:3001)

Notes
-----

* This howto is incomplete.
* This project is a work in progress.
* This tool does not download any content. It only provides a convenient search interface to transmission client.