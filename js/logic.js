function GetLeague(league){
	// clear url anchors
	history.replaceState(null, '', window.location.pathname + window.location.search);
	window.scrollTo(0, 0);
	var converter = new showdown.Converter();
	// Declare extension
	var customClassExt = {
		type: 'output',
		filter: function (text) {
			return text
				.replace(/<(.+)>\[\.([a-z0-9A-Z\s]+)\]/g, `<$1 class="$2">`)
				.replace(/class="(.+)"/g, function (str) {
					if (str.indexOf("<em>") !== -1) {
						return str.replace(/<[/]?em>/g, '_');
					}
					return str;
				});
		}
	};
	// Add extension to converter
	converter.addExtension(customClassExt);
	converter.setOption('tables', true);
	$.ajax({
		url: league + '-toc.txt',
		success: function(data){ document.getElementById("navigation").innerHTML = converter.makeHtml(data);}
	});
	$.ajax({
		url:league + '.txt',
		success: function(data){
			$("#contents").html(converter.makeHtml(data));
			if (location.hash) {
				let target = location.hash;
				if ($(target).offset() != null && $(target).offset() != 'undefined'){
					$('html, body').animate({scrollTop: $(target).offset().top - 38}, 'fast');
				}
			}
		}
	});
}
function switchSidebar(e) {
	let sidebar = localStorage.getItem("data-sidebar");
	if (sidebar === "visible" || sidebar === null) {
		localStorage.setItem("data-sidebar", "hidden");
		document.documentElement.setAttribute('data-sidebar', 'hidden');
	} else {
		localStorage.setItem("data-sidebar", "visible");
		document.documentElement.setAttribute('data-sidebar', 'visible');
	}
}
function getSidebar(){
	let sidebar = localStorage.getItem("data-sidebar");
	if (sidebar === "visible" || sidebar === null) {
		localStorage.setItem("data-sidebar", "visible");
		document.documentElement.setAttribute('data-sidebar', 'visible');
	} else {
		localStorage.setItem("data-sidebar", "hidden");
		document.documentElement.setAttribute('data-sidebar', 'hidden');
	}
}
function checkHidden(){
	let hideState = localStorage.getItem("data-complete-visibility");
	if (hideState === "visible" || hideState === null) {
		$("#togglecomplete").text("Fully Hide Complete");
	} else {
		$("#togglecomplete").text("Show Completed Names");
	}
}
function hideCompleted(){
	let hideState = localStorage.getItem("data-complete-visibility");
	if (hideState === "hidden" || hideState === null) {
		// show all
		$("h1").show();
		$(".li-c").show();
		localStorage.setItem("data-complete-visibility", "visible");
		$("#togglecomplete").text("Fully Hide Complete");
	} else if (hideState == "visible"){
		// hide all
		for(let x = 1; x <= 40; x++){
			let challenge = localStorage.getItem("data-ch-" + x);
			if (challenge === "yes"){
				// closest h1 because I'm dumb and lazy
				$('div[data-challenge="' + x + '"]').closest("h1").hide();
			}
		}
		$(".li-c").hide();
		localStorage.setItem("data-complete-visibility", "hidden");
		$("#togglecomplete").text("Show Completed Names");
	}
}
function addCheckboxes(){
	let hideState = localStorage.getItem("data-complete-visibility");
	let i = 0;
	$("h1").each(function(){
		// count from first challenge only
		if($(this).text().startsWith("1 ")){
			i = 1;
		}
		if(i != 0 && i <= 40){
			let challenge = localStorage.getItem("data-ch-" + i);
			if (challenge === "no" || challenge === null) {
				$("#navigation li:nth-child("+(i+1)+")").addClass("li-i");
				localStorage.setItem("data-ch-" + i, "no");
				$(this).append('<div class="complete" data-challenge="' + i + '" data-complete="no">&#x2717;</div>');
			} else if (challenge === "yes") {
				$("#navigation li:nth-child("+(i+1)+")").addClass("li-c");
				$(this).append('<div class="complete" data-challenge="' + i + '" data-complete="yes">&#x2713;</div>');
				$("#ch-" + i).hide();
				if (hideState === "hidden"){
					$(this).closest("h1").hide();
					$(".li-c").hide();
				}
			}
			i++;
		}
	})
}
function clearLocalStorage(){
	localStorage.clear();
	location.reload();
}
$(document).on('click', '.complete', function() {
	let i = $(this).attr("data-challenge");
	let challenge = localStorage.getItem("data-ch-" + i);
	let hideState = localStorage.getItem("data-complete-visibility");
	if (challenge === "yes" || challenge === null) {
		localStorage.setItem("data-ch-" + i, "no");
		$(this).html('&#x2717;').attr("data-complete", "no");
		$("#navigation li:nth-child("+(+i+1)+")").addClass("li-i").removeClass("li-c");
		$("#ch-" + i).show();
		$(".li-c").show();
	} else if (challenge === "no") {
		localStorage.setItem("data-ch-" + i, "yes");
		$("#navigation li:nth-child("+(+i+1)+")").addClass("li-c").removeClass("li-i");
		$(this).html('&#x2713;').attr("data-complete", "yes");
		$("#ch-" + i).hide();
		if (hideState === "hidden"){
			$(this).closest("h1").hide();
			$(".li-c").hide();
		}
	}
});
GetLeague("keepers");
getSidebar();		
function waitForElements() {
	return new Promise((resolve) => {
		const id = setInterval(() => {
			const li = document.querySelector('li.final');
			const h1 = document.getElementById('unlocks');
			if (li && li.textContent.trim() !== '' && h1 && h1.textContent.trim() !== '') {						
				clearInterval(id);
				resolve();
			}
		}, 100);
	});
}
waitForElements().then(() => {
	checkHidden();
	addCheckboxes();
});