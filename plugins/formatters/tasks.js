"use strict";
/**
 * Format questions as a list of tasks
 */
let jade = require('jade');
let countable = ['TrueOrFalse', 'YesOrNo', 'MultipleChoiceSingleAnswer', 'MultipleChoiceMultipleAnswer'];

let _ = _ => _; // @todo integrate translation

/**
 * Convert answer to string
 */
let stringifyAnswer = (questionType, value) => {
    if (questionType == 'TrueOrFalse') {
        return parseInt(value) ? _('True') : _('False');
    }

    if (questionType == 'YesOrNo') {
        return parseInt(value) ? _('Yes') : _('No');
    }

    return value;
};

/**
 * Increment answer counter
 */
let incrementCounter = (counter, question, meta) => {
    if (question.Type == 'MultipleChoiceMultipleAnswer') {
        Object.keys(question.Value).forEach(key => {
            if (!question.Value[key]) {
                return;
            }

            var val = question.Options[key];
            if (!counter[val]) {
                counter[val] = 1;
                meta.keys[val] = true;
            } else {
                counter[key]++;
            }
        })
    } else {
        var key = stringifyAnswer(question.Type, question.Value);
        if (!counter[key]) {
            counter[key] = 1;
            meta.keys[key] = true;
        } else {
            counter[key]++;
        }
    }
};

let format = (internship, student, forms, callback) => {
    let view = jade.compileFile(__dirname + '/views/tasks.jade');
    let header = ['Subject','Task', 'Comment'];
    let tabel = [];
    let meta = { keys: {} };
    let formsSummary = {};

    forms.forEach(form => {
        let formData = form.FormData;
        let questions = formData.Questions;

        questions.forEach(subject => {
            subject.Questions.forEach(question => {
                if (countable.indexOf(question.Type) === -1) return;

                if (!formsSummary[subject.Name]) {
                    formsSummary[subject.Name] = {};
                }

                if (!formsSummary[subject.Name][question.Question]) {
                    formsSummary[subject.Name][question.Question] = {};
                }

                let counter = formsSummary[subject.Name][question.Question];
                return incrementCounter(counter, question, meta);
            });
        });
    });

    let valueColumns = Object.keys(meta.keys);
    header = header.concat(valueColumns);
    
    Object.keys(formsSummary).forEach(subject => {
        Object.keys(formsSummary[subject]).forEach(question => {
            let counter = formsSummary[subject][question];
            tabel.push([subject, question, ''].concat(valueColumns.map(answer => {
                if(counter[answer]){
                    return counter[answer];
                }
                return 0;
            })))
        });
    });

    tabel.unshift(header);
    
    return callback(view({
        'internship': internship,
        'student': student,
        'tabel': tabel,
        '_' : _
    }));
}

module.exports = {
    format: (internship, student, forms, callback) => {
        try {
            return format(internship, student, forms, callback);
        } catch (error) {
            console.log(error);
        }
    },
    name: 'Task List Format',
    id: 'tasks'
};