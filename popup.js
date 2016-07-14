

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


function addRow(text, img) {
  var div = document.createElement('kata');

  div.className = 'clearfix';

  div.innerHTML = '<img src="' + img + '" > </img> \
    <div> <p>' + text + ' </p> </div>';



  document.getElementById('content').appendChild(div);
}

function displayData(books)
{
  var i = 0;
  for(i = 0; i < books.length ; i = i + 1)
  {
    addRow(books[i].title,books[i].img_url);
  }

}

function extractData(response)
{
  var books = [];
  var numBooks = parseInt(response.getElementsByTagName(
	"results-end")[0].textContent);
  var numListing = (Math.min(numBooks,7));
  if(numListing == 0){
    return;
  }
  var i = 0;
  for(i = 0; i < numListing ; i = i + 1){
    var book = { 
      title:"",
      author:"",
      rating:0.0,
      img_url:""
    };
    book.title = (response.getElementsByTagName(
	  "work")[i].getElementsByTagName("best_book")[0].getElementsByTagName(
	    "title")[0].textContent );
    book.img_url = (response.getElementsByTagName(
	  "work")[i].getElementsByTagName("best_book")[0].getElementsByTagName(
	    "small_image_url")[0].textContent );
    book.rating = parseFloat(response.getElementsByTagName(
	  "work")[i].getElementsByTagName("average_rating")[0].textContent);
    book.author = (response.getElementsByTagName(
	  "work")[i].getElementsByTagName("best_book")[0].getElementsByTagName(
	    "author")[0].getElementsByTagName("name")[0].textContent );

    books.push(book);
  }
//  console.log(books);
  displayData(books);
}

function getSearchResults(searchTerm, errorCallback) {

  if(!searchTerm || searchTerm == ''){
    errorCallback("No Text Selected");
    return;
  }
  var searchUrl = 'https://www.goodreads.com/search/index.xml?' + 
    'key=5Jvii4ApD6doocrnEWm9A&q=' + searchTerm ;
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl,true)
  x.onload = function() {
    if(!x.responseXML)
    {
      console.log("fuckoff");
      return;
    }
    /*
    var book = x.responseXML.getElementsByTagName("work")[0].getElementsByTagName("best_book");
    console.log(book[0].getElementsByTagName("title")[0].textContent);
    console.log(x.responseXML.getElementsByTagName("results-end")[0].textContent);
    */
    extractData(x.responseXML);
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
     

    getSearchResults(selection,  function(errorMessage) {
      renderStatus('Cannot display image. ' + errorMessage);
    });
  });
});
