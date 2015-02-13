$(function (){

	var taskNumber = 1;
	var rootNode;
	var startTime;
	var intervalId;
	var forbidden;
	var forbiddenFlag = true;

	String.prototype.replaceAll = function (exp, str) {
		return this.split(exp).join(str);
	}

	function formatHtml(str) {
		var result = str;
		var spanRed = "%1"; // <span class='red'>
		var spanGreen = "%2"; // <span class='green'>
		var spanYellow = "%3"; // <span class='yellow'>
		var closeSpan = "%4"; // </span>
		var tags = str.split(/&lt;/g);
		var attrs = str.split("=");
		var values = str.split("\"");
		
		//tagNames
		if (tags.length > 0) {
			(function (){
				for (var i = 1; i < tags.length; i++) {
					var insertStr = "";
					if (tags[i][0] === "/") {
						insertStr += "/" + spanRed + tags[i].substring(1).split("&gt;")[0] + closeSpan;
						result = result.replaceAll("&lt;" + tags[i].split("&gt;")[0], "&lt;" + insertStr);
					} else {
						if (tags[i].split(" ").length > 1) {
							insertStr += spanRed + tags[i].split(" ")[0] + closeSpan;
							result = result.replaceAll("&lt;" + tags[i].split(" ")[0], "&lt;" + insertStr);
						} else {
							insertStr += spanRed + tags[i].split("&gt;")[0] + closeSpan;
							result = result.replaceAll("&lt;" + tags[i].split("&gt;")[0], "&lt;" + insertStr);
						}
					}
				}
			}());
		}

		//attrs
		if (attrs.length > 0) {
			(function (){
				for (var i = 0; i < attrs.length - 1; i++) {
					var attr = attrs[i].split(" ")[attrs[i].split(" ").length - 1];
					var insertStr = spanGreen + attr + closeSpan + "=";
					result = result.replaceAll(attr + "=", insertStr);
				}
			}());
		}

		//attr values
		if (values.length > 0) {
			(function (){
				for (var i = 1; i < values.length - 1; i++) {
					if (i % 2 != 0) {
						var insertStr = spanYellow + values[i] + closeSpan;
						result = result.replaceAll(values[i], insertStr);
					}
				}
			}());
		}

		result = result.replace(/\"/g, "<span class='yellow'>\"</span>").replaceAll(spanRed, "<span class='red'>").replaceAll(spanGreen, "<span class='green'>")
			.replaceAll(spanYellow, "<span class='yellow'>").replaceAll(closeSpan, "</span>");
		return result;
	}

	var hideHtmlBlock = function (){
		$('.html-wrapper').css('left', '-2000px').css('top', '-300px').css('transform', 'rotate(-90deg) scale(2)');
	};

	var showHtmlBlock = function (){
		$('.html-wrapper').css('left', '0').css('top', '0').css('transform', 'rotate(0) scale(1)');
	};

	function simpleTimer(block) {
	    var time = (+$(block).html().split(':')[0]) * 60 + (+$(block).html().split(':')[1]);

	    var minutes = parseInt(++time / 60);
	    if ( minutes < 1 ) minutes = 0;
	    time = parseInt(time - minutes * 60);
	    if ( minutes < 10 ) minutes = '0' + minutes;

	    var seconds = time;
	    if ( seconds < 10 ) seconds = '0' + seconds;

	    $(block).html(minutes + ':' + seconds);
	}

	var showTask = function (num){
		$.get("../tasks/task-" + num + ".task", function (data) {
			forbiddenFlag = true;
			$('.html-code').html("");
			var lines = data.split("\n");
			var firstLine = lines.splice(0, 1)[0].split('\\');
			var needed = firstLine[0].split(",").map(Number);
			forbidden = firstLine[1].split(' ');

			$('.forbidden .data').html(firstLine[1]);
			rootNode = $("<div/>");
			rootNode.append($(lines.join("\n")));
			$(rootNode).find('*').each(function (index){
				$(this).attr('data-csstest-row', index);
			});

			for (var i = 0; i < lines.length; i++) {
				var source = $("<div/>").text(lines[i]).html();
				var html = "<tr><td class='line-num'>" + (i+1) + "</td><td><div class='flag'></div></td><td class='code'>" + formatHtml(source.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")) + "</td></tr>";
				if (needed.indexOf(i) >= 0) {
					html = $("<div/>").append($(html).addClass('needed')).html();
				}
				$('.html-code').append(html);
			}
		}).fail(function (){
			$('.html-wrapper').html("<span style='color: #fff;'>That's all! You are <span style='color: red;'>C</span><span style='color: green;'>S</span><span style='color: blue;'>S</span>-master :)</span>");
			console.log("Task is not found");
		});
		showHtmlBlock();
		setTimeout(function (){
			startTime = new Date();
			$('.time .data').html('00:00');
			intervalId = setInterval(function (){
				simpleTimer($('.time .data'));
			}, 1000);
		}, 500);
	};

	var checkForWelldone = function (){
		var needed = $('.needed');
		if (needed.length > 0) {
			for (var i = 0; i < needed.length; i++) {
				if (!$(needed[i]).hasClass('selected')) {
					return false;
				}
			}
			if (needed.length == $('.selected').length && forbiddenFlag) {
				console.log((new Date() - startTime)/1000);
				clearInterval(intervalId);
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	var runSelector = function (selector) {
		$('.html-code tr').removeClass('selected');
		try {
			for (var i = 0; i < forbidden.length; i++) {
				if (selector.indexOf(forbidden[i]) != -1) {
					$('.forbidden').addClass('error');
					forbiddenFlag = false;
					break;
				} else {
					$('.forbidden').removeClass('error');
					forbiddenFlag = true;
				}
			}
			var result = rootNode[0].querySelectorAll(selector);
			for (var i = 0; i < result.length; i++) {
				$('tr:nth-child(' + (+$(result[i]).attr('data-csstest-row') + 1) + ')').addClass('selected');
			}
		} catch(e) {
			console.log(e);
		}
		if (checkForWelldone()) {
			hideHtmlBlock();
			setTimeout(function (){
				showTask(++taskNumber)
			}, 400);
			$('.selector').val("");
		}
	};

	$('.selector').first().focus().keyup(function (){
		runSelector($(this).val());
	});

	showTask(taskNumber);
});