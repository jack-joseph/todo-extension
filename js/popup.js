 // AUTHOR: Jack Joseph
// DATE: 2/24/18
// FILE: popup.js

// Javascript for the extension popup.

// REFERENCES:
//	- https://developer.chrome.com/apps/storage
//	- http://www.sitepoint.com/forums/
//	  showthread.php?608250-onclick-problem-in-a-loop
//		- paul_wilkins, post #2
//	- https://stackoverflow.com/questions/155188/
//	  trigger-a-button-click-with-javascript-on-the-enter-key-in-a-text-box
//		- Steve Paulo

// loads list results and updates storage when popup.html is opened
window.onload = function() {
	loadResults();
}

// clicking add will add an element to the to-do list and save results
var addButton = document.getElementById('add');
addButton.onclick = function() {
	// textBox object
	var textBox = document.getElementById('text');
	// re-focuses on textBox after click
	textBox.focus();
	// input text
	var toDo = textBox.value;
	// clears textBox value
	textBox.value = '';

	// logs error if no text
	if (!toDo) {
		console.log('Error: no text input.');
		return;
	}

	// the to-do list
	var list = document.getElementById('list');

	// creates list element
	var li = document.createElement('li');

	var span = document.createElement('span');
		span.textContent = toDo;

	// creates checkbox element
	var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.onclick = function() {
			saveResults();
			// re-focuses on text box
			var textBox = document.getElementById('text');
			textBox.focus();
		}

	// creates delete button element
	var deleteButton = document.createElement('img');
		deleteButton.src = '/media/redxbright.png';
		deleteButton.width = 15;
		deleteButton.height = 15;
		deleteButton.style.cssText = 'float: right; ';
		deleteButton.onclick = function() {
			var list = deleteButton.parentNode.parentNode;
			var li = deleteButton.parentNode;
			// re-focuses on text box
			var textBox = document.getElementById('text');

			textBox.focus();

			list.removeChild(li);
			saveResults();
		}

	// appends checkbox, text, and delete button to the li element
	li.appendChild(checkbox);
	li.appendChild(span);
	li.appendChild(deleteButton);
	// appends li element to the list
	list.appendChild(li);

	// saves results
	saveResults();
}

// enter clicks 'add' button
document.getElementById('text')
    .addEventListener('keyup', function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById('add').click();
    }
});

// clicking the clear button clears the list and saves the cleared list
var clearButton = document.getElementById('clear');
clearButton.onclick = function() {
	// clears list
	document.getElementById('list').textContent = '';

	// re-focuses on text box
	var textBox = document.getElementById('text');
	textBox.focus();

	// saves results in storage
	saveResults();

	console.log('Storage cleared.');
}

function updateIfNoElements(listSize) {
	var lowerButtons = document.getElementById('lowerButtons');
	var list = document.getElementById('list');

	if (listSize == 0) {
		lowerButtons.style.cssText = 'display: none;';
		list.style.cssText = 'border-radius: 0px;' +
							 'border-bottom: none';
	} else {
		lowerButtons.style.cssText = 'display: block;';
		list.style.cssText = 'border-radius: 5px;' +
							 'border-bottom: solid' +
							 'border-width: 1px';
	}
}

// clears chrome storage
function clearStorage() {
	chrome.storage.local.clear(function() {
    	var error = chrome.runtime.lastError;
    	if (error) console.error(error);
	});
}

var clearSelected = document.getElementById('clearSelected');
clearSelected.onclick = function() {
	var elements = list.getElementsByTagName('li');
	// re-focuses on text box
	var textBox = document.getElementById('text');

	textBox.focus();

	for (var i = elements.length - 1; i >= 0; i--) {
		if (elements[i].children[0].checked) {
			elements[i].parentNode.removeChild(elements[i]);
		}
	}

	saveResults();
}

// saves list results
function saveResults() {
	// resets storage
	clearStorage();

	// the to-do list
	var list = document.getElementById('list');
	// nodelist of list elements
	var elements = list.getElementsByTagName('li');
	// array of list element content
	var storedText = [];
	var storedChecks = [];
	var listSize = elements.length;

	if (elements.length != 0) {
		// copies the content from the nodelist into an array
		for (var i = 0; i < elements.length; i++) {
			storedText[i] = elements[i].textContent;
			storedChecks[i] = elements[i].children[0].checked;
		}
	}

	updateIfNoElements(listSize);

	// uses chrome.storage to save the array of text content
	chrome.storage.sync.set({'textStorage': storedText,
							 'checkStorage': storedChecks,
							 'sizeStorage': listSize }, function() {
			// logs callback function message
			console.log('Settings saved.');
		});
}

function loadResults() {
	chrome.storage.sync.get(['textStorage',
							 'checkStorage',
							 'sizeStorage'], function(data) {
		// logs callback function message
		console.log('Settings retrieved.');

		// fills to-do list with stored content
		var list = document.getElementById('list');
		for (var i = 0; i < data.textStorage.length; i++) {
			var li = document.createElement('li');

			var span = document.createElement('span');
				span.textContent = data.textStorage[i];

			var checkbox = document.createElement('input');
				checkbox.type = 'checkbox';
				checkbox.checked = data.checkStorage[i];
				checkbox.onclick = function() {
					saveResults();
					// re-focuses on text box
					var textBox = document.getElementById('text');
					textBox.focus();
				}

			var deleteButton = document.createElement('img');
				deleteButton.src = '/media/redxbright.png';
				deleteButton.width = 15;
				deleteButton.height = 15;
				deleteButton.style.cssText = 'float: right;';
				deleteButton.onclick = function(li) {
        		return function () {
        			// re-focuses on text box
					var textBox = document.getElementById('text');
					textBox.focus();

            		li.parentNode.removeChild(li);
            		saveResults();
        		};
    		}(li);

			li.appendChild(checkbox);
			li.appendChild(span);
			li.appendChild(deleteButton);
			list.appendChild(li);
		}

		updateIfNoElements(data.sizeStorage);
	});
}
