// Copyright (c) 2021, FOSS United and contributors
// For license information, please see license.txt

frappe.ui.form.on("LMS Quiz", {
	onload: function (frm) {
		frm.get_field('questions').grid.cannot_add_rows = true;
	},
	before_save: function (frm) {
		if (frm.doc.randomize_questions && frm.doc.question_limit > 0) {
			const questions = frm.doc.questions;
			let shuffledQuestions = questions.sort(() => Math.random() - 0.5);
			let uniqueQuestions = [];
			let questionSet = new Set();

			shuffledQuestions.forEach((q) => {
				if (!questionSet.has(q.question)) {
					questionSet.add(q.question);
					uniqueQuestions.push(q);
				}
			});
			uniqueQuestions = uniqueQuestions.slice(0, frm.doc.question_limit);
			frm.clear_table('questions');
			uniqueQuestions.forEach((q) => {
				let child = frm.add_child('questions');
				child.question = q.question;
				child.marks = q.marks;
			});

			frm.refresh_field('questions');
		}
	},
	add_multiple: function (frm) {
        const dialog = new frappe.ui.form.MultiSelectDialog({
            doctype: "LMS Question",
	    	target: this.cur_frm,
            columns: { 'question': null},
            setters: { 'title': null,'category':null },
            size: 'large',
            action(selections) {
                $.each(selections, function (index, item) {
                    var child = frm.add_child('questions');
                    child.question = item;
                });
                frm.refresh_field('questions');
                dialog.dialog.hide();
            },
            onload_post_render: function () {
                dialog.dialog.$wrapper.find(".btn-secondary").addClass("hidden");
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
