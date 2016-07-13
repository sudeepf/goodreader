// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentSelection(callback) {

  chrome.tabs.executeScript( {
    code: "window.getSelection().toString();"
  }, function(selection) {
    if(!selection){
      callback('');
      return;
    }
    console.log( selection[0]);
    callback(selection[0]);
  });

}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {

  if(!searchTerm || searchTerm == ''){
    errorCallback("No Text Selected");
    return;
  }
  var searchUrl = 'https://www.goodreads.com/search/index.xml?' + 
    'key=5Jvii4ApD6doocrnEWm9A&q=' + searchTerm ;
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl,true);
  // The Google image search API responds with JSON, so let Chrome parse it.
  //var myArr = JSON.parse(x.responseText);
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    /*
    var response = x.response;
    if (!response || !response.responseData || !response.responseData.results ||
        response.responseData.results.length === 0) {
      errorCallback('No response from Google Image search!');
      return;
    }
    var firstResult = response.responseData.results[0];
    // Take the thumbnail instead of the full image to get an approximately
    // consistent image size.
    var imageUrl = firstResult.tbUrl;
    var width = parseInt(firstResult.tbWidth);
    var height = parseInt(firstResult.tbHeight);
    console.assert(
        typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
        'Unexpected respose from the Google Image Search API!');
    callback(imageUrl, width, height);
    */
    if(!x.responseXML)
    {
      console.log("fuckoff");
      return;
    }
    var book = x.responseXML.getElementsByTagName("work")[0].getElementsByTagName("best_book");
    console.log(book[0].getElementsByTagName("title")[0].textContent);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentSelection(function(selection) {
    // Put the image URL in Google search.
    renderStatus('Performing GoodReads search for ' + selection);
     

    getImageUrl(selection, function(imageUrl, width, height) {

      renderStatus('Search term: ' + url + '\n' +
          'Google image search result: ' + imageUrl);
      var imageResult = document.getElementById('image-result');
      // Explicitly set the width/height to minimize the number of reflows. For
      // a single image, this does not matter, but if you're going to embed
      // multiple external images in your page, then the absence of width/height
      // attributes causes the popup to resize multiple times.
      imageResult.width = width;
      imageResult.height = height;
      imageResult.src = imageUrl;
      imageResult.hidden = false;

    }, function(errorMessage) {
      renderStatus('Cannot display image. ' + errorMessage);
    });
  });
});
