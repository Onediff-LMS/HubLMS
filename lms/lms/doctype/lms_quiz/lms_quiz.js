// Copyright (c) 2021, FOSS United and contributors
// For license information, please see license.txt

frappe.ui.form.on("LMS Quiz", {
	onload: function (frm) {
		frm.get_field('questions').grid.cannot_add_rows = true;
	},
	validate: function (frm) {
		let limit = frm.doc.limit_questions_to;
		let questionCount = frm.doc.questions.length;

		if (questionCount < limit) {
			frappe.msgprint({
				title: __('Validation Error'),
				message: __('The limit of questions cannot be grater than the number of questions added.'),
				indicator: 'red'
			});
			frappe.validated = false;
		}
	},
	add_multiple: function (frm) {
        const dialog = new frappe.ui.form.MultiSelectDialog({
            doctype: "LMS Question",
	    	target: this.cur_frm,
			columns: { 'question': null },
			setters: { 'title': null },
			add_filters_group: 1,
            action(selections) {
                $.each(selections, function (index, item) {
                    var child = frm.add_child('questions');
                    child.question = item;
                });
                frm.refresh_field('questions');
                dialog.dialog.hide();
            },
        });
    }
});

frappe.ui.form.on("LMS Quiz Question", {
	marks: function (frm) {
		total_marks = 0;
		frm.doc.questions.forEach((question) => {
			total_marks += question.marks;
		});
		frm.doc.total_marks = total_marks;
	},
});
