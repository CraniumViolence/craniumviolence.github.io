var files = [
    "../go/Astrolabe.json",
    "../go/Currency.json",
    "../go/Fragment.json",
    "../go/Incubator.json",
    "../go/DjinnCoin.json",
    "../go/Essence.json",
    "../go/Omen.json",
    "../go/Scarab.json",
    "../go/Invitation.json",
    "../go/Map.json",
    "../go/UniqueMap.json",
];

// Initialize an object to store the data
var jsonDataMap = {};

// Create an array of AJAX promises
var promises = files.map(function(filename) {
    return $.getJSON('../go/' + filename).done(function(data) {
        // Store data in the map with filename as key
        jsonDataMap[filename] = data;
    });
});

// When all files are loaded
$.when.apply($, promises).done(function() {
    console.log("Parsed json files");
});

function priceFormat(i){
	if (i > divines) {
		return `${(i / divines).toFixed(2)} divine`;
	} else {
		return `${Math.ceil(i)} chaos`;
	}
}

function unixToLocalTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleString();
}

var divines = 99999;
function priceEntries() {
	// get div price
	divines = jsonDataMap["../go/Currency.json"]["lines"].find(line => line.id === "divine").primaryValue;
	lastUpdate = jsonDataMap["../go/Currency.json"]["modified"];
	$(".time").html(unixToLocalTime(lastUpdate));
    $('.price').each(function() {
        var nameString = $(this).text();
		var useBrackets = $(this).hasClass("brackets");
        for (var key in jsonDataMap) {
            if (jsonDataMap.hasOwnProperty(key)) {
                var data = jsonDataMap[key];
                if (data) {
                    if (Array.isArray(data["items"])) {
                        const itemsArray = data["items"];
                        const matchedItem = itemsArray.find(item => item.name === nameString);
                        if (matchedItem && matchedItem.id && Array.isArray(data["lines"])) {
                            const id = matchedItem.id;
                            const matchedLine = data["lines"].find(line => line.id === id);
                            if (matchedLine && matchedLine.primaryValue) {
                                finalValue = matchedLine.primaryValue;
								if(!useBrackets){
									$(this).append(": <span>" + priceFormat(finalValue) + "</span>");
								} else {
									$(this).append(" <span>(" + priceFormat(finalValue) + ")</span>");
								}
                            }
                        }
                    } else if (Array.isArray(data["lines"])) {
                        const matchedLine = data["lines"].find(line => line.name === nameString);
                        if (matchedLine && matchedLine.chaosValue) {
                            finalValue = matchedLine.chaosValue;
							if(!useBrackets){
								$(this).append(": <span>" + priceFormat(finalValue) + "</span>");
							} else {
								$(this).append(" <span>(" + priceFormat(finalValue) + ")</span>");
							}
                        }
                    }
                }
            };
        };
    });
}