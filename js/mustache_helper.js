$.mustache = function(template, view) {
	var partials = {},
		partial_list = view.partials;
	//delete view.partials; //we shouldn't modify the view because it's passed by reference
	if (partial_list instanceof Array) {
		partial_list.forEach(function(item) {
			partials[item] = $('#' + item + '-tpl').html();
		});
	}
	return Mustache.to_html($('#' + template + '-tpl').html(), view, partials);
};
$.conveyor = function(template, data, logic, partial_list){
	template = $('#'+template+'-tpl').html();

	var partials = {};
	if (partial_list instanceof Array) {
		partial_list.forEach(function(item) {
			partials[item] = $('#' + item + '-tpl').html();
		});
	}

	return Conveyor.render(template, data, logic, partials);
};