function init(){
	
	//set option values
	switch(sourceMode) {
		case 2:
			document.getElementById("sourceMode_html").checked = true ;
			break ;
		case 3:
			document.getElementById("sourceMode_wiki").checked = true ;
			break ;
		default:
			document.getElementById("sourceMode_auto").checked = true ;	 
	}
	
	switch(repeatMode) {
		case 0:
			document.getElementById("repeatMode_all").checked = true ;
			break ;
		case 1:
			document.getElementById("repeatMode_first").checked = true ;
			break ;
		default:
			document.getElementById("repeatMode_fis").checked = true ;	 
	}	
	
	var rawHtmlContainer = document.getElementById("tab_rawHtml");
	if (rawHtmlContainer != null) {
		var html = rawHtmlContainer.innerHTML;
	
		//remove result tags
		var start = html.indexOf(">") ;
		if (start > 0)
			html = html.substring(start+1) ; 
			
		var end = html.lastIndexOf("<") ;
		if (end > 0) 
			html = html.substring(0, end) ;
			
			
	
		//escape html tags
		html = html.replace(/</g, "&lt;");
		html = html.replace(/>/g, "&gt;");
		
		rawHtmlContainer.innerHTML = html;
	}
	
	var wikiContainer = document.getElementById("tab_wiki");
	if (wikiContainer != null) {
		var markup = wikiContainer.innerHTML;
	
		//remove result tags
		var start = markup.indexOf(">") ;
		if (start > 0)
			markup = markup.substring(start+1) ; 
			
		var end = markup.lastIndexOf("<") ;
		if (end > 0) 
			markup = markup.substring(0, end) ;
			
		var temp = "" ;
		var lastIndex = 0 ;
		
		var pattern=/\[\[(.*?)(|.*?)\]\]/g ;
		var result;
		while ((result = pattern.exec(markup)) != null) {			
			temp = temp + markup.substring(lastIndex, result.index) ;
			temp = temp + "<a href=\"http://www.en.wikipedia.org/wiki/" + getDestination(result[0]) + "\">" + result[0] + "</a>" ;
			
			lastIndex = pattern.lastIndex ;
		}
		
		temp = temp + markup.substring(lastIndex) ;
		wikiContainer.innerHTML = temp ;
	}
	
	if (sourceMode != 0 || repeatMode != 2 || minProbability != 0.5 || bannedTopics != "")
		showOptions() ;
		
	addTooltipsToAllLinks($("#tab_renderedHtml")) ;
	addTooltipsToAllLinks($(wikiContainer)) ;
	addTooltipsToAllLinks($("#tab_topics")) ;
}

function getDestination(wikiLink) {
	
	var pos = wikiLink.indexOf("|") ;
	
	if (pos > 0)
		return wikiLink.substring(2, pos) ;
	else
		return wikiLink.substring(2, wikiLink.length - 2) ;
	
}

function selectTab(id) {
				
	var tabs = document.getElementsByName("tab")
	
	for (var i = 0 ; i<tabs.length ; i++)
		tabs[i].className = "tabDeselected" ;
				
	var boxes = document.getElementsByName("outputBox") ;
				
	for (var i = 0 ; i<tabs.length ; i++)
		boxes[i].style.display = "none" ; 	
				
	var tab = document.getElementById("tab_" + id) ;
	tab.className = "tabSelected" ;
				
	var box = document.getElementById("box_" + id) ;
	box.style.display = "block" ; 	
	
}

function showOptions() {
	
	$('#inputBox_container').css("margin-right", "430px") ;
	
	$('#options').show() ;
	$('#hideOptions').show() ;
	$('#showOptions').hide() ;
}

function hideOptions() {
	
	$('#inputBox_container').css("margin-right", "12px") ;
	
	$('#options').hide() ;
	$('#hideOptions').hide() ;
	$('#showOptions').show() ;
	
}

function getPageDimensions() {
	
	var width = 0, height = 0;

	if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		width = window.innerWidth;
		height = window.innerHeight;
	} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		//IE 6+ in 'standards compliant mode'
		width = document.documentElement.clientWidth;
		height = document.documentElement.clientHeight;
	} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible
		width = document.body.clientWidth;
		height = document.body.clientHeight;
    }

	return new Dimension(width, height);
}


 //a helper object for storing locations
 function Dimension(width, height){
 	this.width = width;
 	this.height = height;
 }
 
function addTooltipsToAllLinks(container) {
	
	if (container == null) return ;
			
	var links = container.find("a") ;
	
	for (var i = 0; i < links.length; i++) {
		
		var link = $(links[i]);
		var dest = link.attr("href");
		var linkProb = link.attr("linkProb") ;
		
		
		
		if (dest != null && dest.substr(0, 33) == "http://www.en.wikipedia.org/wiki/") {
			link.unbind("mouseover");
			link.bind("mouseover", {
				id: idsByTitle[dest.substr(33).toLowerCase()],
				object: link,
				linkProb: linkProb
			}, function(event){
				showTooltip(event.data.id, event.data.object, event.data.linkProb);
			});
			
			link.unbind("mouseout");
			link.bind("mouseout", function(event){
				$("#tooltip").hide();
			});
		}	
	}	
}

 


function showTooltip(topicId, object, linkProb) {
		
	var tooltip = $("#tooltip") ;

	var top = object.offset().top + object.height() ;
	var left = object.offset().left ;
	
	// if this is too far right to fit on page, move it to be against right side of page
	if (left + tooltip.width() > $(window).width())
		left = $(window).width() - tooltip.width() - 30 ;
			
	tooltip.css("top", top + "px") ;
	tooltip.css("left", left + "px") ;
	
	tooltip.html("<div class='loading'></div>") ;
	tooltip.show() ;
	
	//var amp = "%26";
	var escapedUrl = "/proxy.php?proxy_url=http://wdm.cs.waikato.ac.nz:8080/service?task=define%26id="+topicId+"%26length=0%26formant=2%26linkFormat=0%26getImages=true%26escapeDefinition=true%26maxImageWidth=100%26maxImageHeight=100%26linkDestination=0";
	
	$.get(escapedUrl,  function(response){
		processTooltipResponse(topicId, response, linkProb);
	});	
}

function processTooltipResponse(topicId, response, linkProb) {
	
	var tooltip = $("#tooltip") ;
	
	tooltip.empty() ;
	
	var image = $(response).find("Image") ;
	if (image.length > 0) {
		tooltip.append("<img src='" + image.attr("url") + "'></img>") ;
	}
	
	var definition = $(response).find("Definition") ;
	if (definition.length > 0) {
		tooltip.append(definition.text()) ;
	} else {
		tooltip.append("no definition avaliable") ;
	}
	
	if (linkProb != null)
		tooltip.append("<p><em>" + linkProb + "</em> probability of being a link") ;
	
	$(tooltip).append("<br/>") ;
	
}


