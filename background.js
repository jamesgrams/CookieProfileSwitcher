// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.cookies.onChanged.addListener(function(info) {
  console.log("onChanged" + JSON.stringify(info.cookie));
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    if( tab.url.match(/^https:\/\/tv\.youtube\.com/)) {
      changeProfile("hallaby101@gmail.com", tab);
    }
    else if( tab.url.match(/^https:\/\/(www\.)?youtube.com/) ) {
      changeProfile("james@game103.net", tab);
    }
  }
});

function changeProfile(name, tab) {
  var currentDomain = getDomain(tab.pendingUrl ? tab.pendingUrl : tab.url);
  chrome.cookies.getAll({domain: currentDomain}, function(cookies) {
		
		chrome.storage.local.get('profiles', function(items){
			var oldProfileData = cookies;
			var newProfileData = items.profiles[currentDomain]['profileData'][name];
      if( !newProfileData ) return; // no profile
			
			var profile = items.profiles;
      if( profile[currentDomain]['currentProfile'] == name ) return; // already on right profile
			var domainProfiles = profile[currentDomain]['profileData'];
      var currentProfile = profile[currentDomain]['currentProfile'];
			
			domainProfiles[currentProfile] = oldProfileData;
			profile[currentDomain]['currentProfile'] = name;
			profile[currentDomain]['profileData'] = domainProfiles;
			
			
			for(var i=0; i<cookies.length;i++) {
				chrome.cookies.remove({url: extrapolateUrlFromCookie(cookies[i]), name: cookies[i].name});
			}
			
			if(newProfileData.length > 0){for (var i=0; i<newProfileData.length;i++){
				newProfileData[i]['url'] = "http" + (newProfileData[i]['secure'] ? "s" : "") + "://" + newProfileData[i]['domain'].replace(/^\./, "");
				delete newProfileData[i]['hostOnly'];
				delete newProfileData[i]['session'];
				chrome.cookies.set(newProfileData[i]);
			}}
			
      chrome.storage.local.set({ "profiles": profile });
			
			var code = 'window.location.reload();';
			chrome.tabs.executeScript(tab.id, {code: code});
			
		});
		
	});
}

// BEGIN DOMAIN FUNCTIONS //
function getHostName(url) {
  var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
  return match[2];
  }
  else {
      return null;
  }
}
function getDomain(url) {
  var hostName = getHostName(url);
  var domain = url;
  
  if (hostName != null) {
      var parts = hostName.split('.').reverse();
      
      if (parts != null && parts.length > 1) {
          domain = parts[1] + '.' + parts[0];
              
          if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
            domain = parts[2] + '.' + domain;
          }
      }
  }
  return domain;
}
// END DOMAIN FUNCTIONS //

function extrapolateUrlFromCookie(cookie) {
  var prefix = cookie.secure ? "https://" : "http://";
  if (cookie.domain.charAt(0) == ".")
      prefix += "www";

  return prefix + cookie.domain + cookie.path;
}

/*function focusOrCreateTab(url) {
  chrome.windows.getAll({"populate":true}, function(windows) {
    var existing_tab = null;
    for (var i in windows) {
      var tabs = windows[i].tabs;
      for (var j in tabs) {
        var tab = tabs[j];
        if (tab.url == url) {
          existing_tab = tab;
          break;
        }
      }
    }
    if (existing_tab) {
      chrome.tabs.update(existing_tab.id, {"selected":true});
    } else {
      chrome.tabs.create({"url":url, "selected":true});
    }
  });
}

chrome.browserAction.onClicked.addListener(function(tab) {
  var manager_url = chrome.extension.getURL("manager.html");
  focusOrCreateTab(manager_url);
});*/