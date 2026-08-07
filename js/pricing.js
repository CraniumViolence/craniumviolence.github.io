var files = [
    "../go/Astrolabe.json",
    "../go/Currency.json",
    "../go/Fragment.json",
    "../go/Incubator.json",
    "../go/DjinnCoin.json",
    "../go/Essence.json",
    "../go/Omen.json",
    "../go/Oil.json",
    "../go/Scarab.json",
    "../go/Invitation.json",
    "../go/Map.json",
    "../go/UniqueMap.json",
    "../go/DivinationCard.json",
    "../go/Ducats.json",
    "../go/EnshroudingCrystal.json",
    "../go/Beast.json",
	"../go/Tattoo.json",
	"../go/Runegraft.json",
];
var jsonDataMap = {};
var promises = files.map(function(filename) {
    return $.getJSON('../go/' + filename).done(function(data) {
        jsonDataMap[filename] = data;
    });
});

$.when.apply($, promises).done(function() {
    console.log("Parsed json files");
});

function priceFormat(i) {
    if (i > divines) {
        return `${(i / divines).toFixed(2)} divine`;
    } else {
        return `${i.toFixed(1)} chaos`;
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
        var multiplyValue = $(this).hasClass("multiply");
        var replaceText = $(this).hasClass("replace");
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
                                if (useBrackets) {
                                    $(this).append(" <span>(" + priceFormat(finalValue) + ")</span>");
                                } else if (multiplyValue) {
                                    const multi = +$(this).attr("data-factor");
                                    $(this).append(" <span class=\"factor\">x" + multi + "</span> <span>(" + priceFormat(finalValue * multi) + ")</span>");
                                } else if (replaceText) {
                                    $(this).html(priceFormat(finalValue));
                                } else {
                                    $(this).append(": <span>" + priceFormat(finalValue) + "</span>");
                                }
                            }
                        }
                    } else if (Array.isArray(data["lines"])) {
                        const matchedLine = data["lines"].find(line => line.name === nameString);
                        if (matchedLine && matchedLine.chaosValue) {
                            finalValue = matchedLine.chaosValue;
                            if (useBrackets) {
                                $(this).append(" <span>(" + priceFormat(finalValue) + ")</span>");
                            } else if (multiplyValue) {
                                const multi = +$(this).attr("data-factor");
                                $(this).append(" <span class=\"factor\">x" + multi + "</span> <span>(" + priceFormat(finalValue * multi) + ")</span>");
                            } else if (replaceText) {
                                $(this).html(priceFormat(finalValue));
                            } else {
								if (key == "../go/DivinationCard.json"){
									finalValue = finalValue * (matchedLine.stackSize ?? 1);									
									$(this).append(": <span>" + priceFormat(finalValue) + " total ("+ (matchedLine.stackSize ?? 1) +" stack)</span>");
								} else {
									$(this).append(": <span>" + priceFormat(finalValue) + "</span>");
								}
                            }
                        }
                    }
                }
            };
        };
    });
	// price all cheap sections
    $('.ggghlcheap').each(function() {
        var minValue = Infinity;
        var bestLi = null;
        var $container = $(this);
        $container.find('li').each(function() {
            var $li = $(this);
            var $span = $li.find('span').first();
            if ($span.length === 0) return;
            var text = $span.text().trim();
            var parts = text.split(' ');
            if (parts.length !== 2) return;
            var value = parseFloat(parts[0]);
            var suffix = parts[1].toLowerCase();
            if (isNaN(value)) return;
            if (suffix === 'divine') {
                value *= 500;
            }
            if (value < minValue) {
                minValue = value;
                bestLi = $li;
            }
        });
        if (bestLi) {
            bestLi.addClass('bestvalue');
        }
    });
}