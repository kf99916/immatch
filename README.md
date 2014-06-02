![icon.png](https://bitbucket.org/repo/oRzpRo/images/2891484701-icon.png)

imMatch makes screen stitching very easy and creates amazing and interesting interaction. It supports different multi-touch mobile devices, resolutions, and platforms.

# News #
---
* 2014.06.02: imMatch v1.0.0
* 2012.10.26: imMatch v1.0.0 kicks off

# Version #
---
* [imMatch v1.0.0](https://bitbucket.org/kf99916/immatch/downloads/)

# Supported Platform #
---
Platforms that own a web browser supports HTML5 and WebSocket, including:
* iOS
* Android 4.0+ (need Google Chrome for Android)
* BlackBerry OS

If you don't know whether your browser support WebSocket, check the following websites:
* [WebSocket.org Echo Test](http://www.websocket.org/echo.html)
* [Can I use Web Sockets?](http://caniuse.com/websockets)

# Demo #
---
## Panorama Viewer ([Demo Video](http://www.youtube.com/watch?v=jUuohp6DaUU)) ##

![PanoramaViewer.png](https://bitbucket.org/repo/oRzpRo/images/4229571547-PanoramaViewer.png)

Panorama Viewer makes users see panoramas in a "big screen". Users don't be restricted to a small screen of mobile devices.

## imTower ([Demo Video](http://www.youtube.com/watch?v=GNyVlVAThuE)) ##

![imTower.png](https://bitbucket.org/repo/oRzpRo/images/2595730950-imTower.png)

This is a multi-player tower defense game. One device, one tower. Players can use a easy gesture to connect these devices and fight. It is a new interaction game type.

# What you need to build your own imMatch SDK #
---
* [Node.js](http://nodejs.org/)
* [Grunt](http://gruntjs.com/)
```
#!sh

npm install -g grunt-cli
```


# How to build your own imMatch SDK #
---
Clone a copy of the main imMatch git repo by running:
```
#!sh

git clone https://bitbucket.org/kf99916/immatch.git
```

Enter the imMatch directory and run the build script:

```
#!sh

cd immatch && npm run build
```
The built version of imMatch will be put in the ```dist/``` sub-directory, along with the minified copy and associated map file.

## The other commands ##
If you want to build imMatch and copy your build and example to the web document root, then run the build script:

```
#!sh

cd immatch && npm run start
```

The destination is defined at "webServerDocuments" key in package.json.

If you want to build imMatch documentation, then run the build script:
```
#!sh

cd immatch && npm run docs
```
The built documentation will be put in the ```docs/``` sub-directory

# Documentation #
---
* [imMatch WebSocket Client](https://www.googledrive.com/host/0B5EDyG5SmMfOa3kzMWNrYzI2aEk)
* [imMatch WebSocket Server](https://www.googledrive.com/host/0B5EDyG5SmMfOSm1WOXdGLXpkMlU)

# License #
---
You use imMatch project under the terms of the MIT License.

Please visit [MIT License](https://bitbucket.org/kf99916/immatch/src/d927b6694feed5b84c323bcd636fdbe14cf07d3a/MIT-LICENSE.txt?at=master) to get more details.

# About #
---
This project is my master thesis: [Development of SDK for Stitching Multiple Multi-touch Displays](http://ndltd.ncl.edu.tw/cgi-bin/gs32/gsweb.cgi?o=dnclcdr&s=id=%22100NTU05392017%22.&searchmode=basic). I hope imMatch SDK can improve the way users use their smart phones and make life better.

If you have any question and suggestion, want to join me, or have a donation, welcome to contact me by ```kf99916@gmail.com```. Thanks :)