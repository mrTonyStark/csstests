$(function (){

	var taskNumber = 1;

	var node;

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
		
		// СДЕЛАТЬ ЗАМЫКАНИЯ!!!
		//tagNames
		if (tags.length > 0) {
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
		}

		//attrs
		if (attrs.length > 0) {
			for (var i = 0; i < attrs.length - 1; i++) {
				var attr = attrs[i].split(" ")[attrs[i].split(" ").length - 1];
				var insertStr = spanGreen + attr + closeSpan + "=";
				result = result.replaceAll(attr + "=", insertStr);
			}
		}

		//attr values
		if (values.length > 0) {
			for (var i = 1; i < values.length - 1; i++) {
				if (i % 2 != 0) {
					var insertStr = spanYellow + values[i] + closeSpan;
					result = result.replaceAll(values[i], insertStr);
				}
			}
		}

		result = result.replace(/\"/g, "<span class='yellow'>\"</span>").replaceAll(spanRed, "<span class='red'>").replaceAll(spanGreen, "<span class='green'>")
			.replaceAll(spanYellow, "<span class='yellow'>").replaceAll(closeSpan, "</span>");
		return result;
	}

	var hideHtml = function (){
		$('.html-wrapper').css('margin-left', '-100%');
	};

	var showHtml = function (){
		$('.html-wrapper').css('margin-left', '0');
	};

	var showTask = function (num){
		$.get("../tasks/task-" + num + ".task", function (data) {
			$('.html-code').html("");
			var lines = data.split("\n");
			var needed = lines[0].split(",").map(Number);
			lines.splice(0, 1);
			node = $(lines.join("\n"));

			for (var i = 0; i < lines.length; i++) {
				var source = $("<div/>").text(lines[i]).html();
				var html = "<tr title='" + lines[i] + "'><td class='line-num'>" + (i+1) + "</td><td><div class='flag'></div></td><td class='code'>" + formatHtml(source.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")) + "</td></tr>";
				if (needed.indexOf(i) >= 0) {
					html = $("<div/>").append($(html).addClass('needed')).html();
				}
				$('.html-code').append(html);
			}
		}).fail(function (){
			$('.html-wrapper').html("<span style='color: #fff;'>That's all! You are <span style='color: red;'>C</span><span style='color: green;'>S</span><span style='color: blue;'>S</span>-master :)</span>");
			console.log("Task is not found");
		});
		showHtml();
	};

	var checkForWelldone = function (){
		var needed = $('.needed');
		if (needed.length > 0) {
			for (var i = 0; i < needed.length; i++) {
				if (!$(needed[i]).hasClass('selected')) {
					return false;
				}
			}
			if (needed.length == $('.selected').length) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	var runSelector = function (selector){
		$('.html-code tr').removeClass('selected');
		var rootNode = $("<div/>");
		rootNode.append(node);
		try {
			var result = $(rootNode).find(selector);
			for (var i = 0; i < result.length; i++) {
				var title = $(result[i]).prop('outerHTML').split('>')[0] + ">";
				title = title.replaceAll("\"", "\\\"");
				$('tr[title*="' + title + '"]').addClass('selected');
			}
		} catch(e) {
			console.log(e);
		}
		if (checkForWelldone()) {
			hideHtml();
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