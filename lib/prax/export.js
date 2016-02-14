// load internships model
var InternshipModel = require('./../../models/internship');
var FormModel = require('./../../models/form');


/**
 * This class will map and reduce the submited forms form an internship
 */
function InternshipFormMR() {
    this.summary = {};
    this.keys = {};
}

/**
 * This method will map and reduce the question submited by students
 * options.internshipId
 * options.accountId
 * options.formTemplateId
 */
InternshipFormMR.map = function (options, callback) {
    var internshipQuery = { _id: options.internshipId };
    var formsQuery = {
        AccountId: options.accountId,
        FormTemplateId: options.formTemplateId,
        InternshipId: options.internshipId
    };

    InternshipModel.findOne(internshipQuery, function (error, internship) {
        if (error || !internship) {
            return callback(null);
        }

        FormModel.find(formsQuery, function (error, forms) {
            if (error) {
                return callback(null);
            }
            return InternshipFormMR.reduce(forms, internship, callback);
        });
    });
};

/**
 * This method will convert a int answer to string
 */
InternshipFormMR.stringifyAnswer = function (question_type, value) {
    if (question_type == 'TrueOrFalse') {
        return parseInt(value) ? 'True' : 'False';
    }

    if (question_type == 'YesOrNo') {
        return parseInt(value) ? 'Yes' : 'No';
    }

    return value;
};

/**
 * This method will init a key path
 */
InternshipFormMR.initPath = function (object, path) {
    var current = object;
    path.forEach(function (item) {
        if (!current[item]) {
            current[item] = {};
        }
        current = current[item];
    });
};

// Types of questions that can be countable
InternshipFormMR.COUNTABLE = ['TrueOrFalse', 'YesOrNo', 'MultipleChoiceSingleAnswer', 'MultipleChoiceMultipleAnswer'];

/**
 * This method is called when data is loaded from mongo db
 */
InternshipFormMR.reduce = function (forms, internship, callback) {
    var allowedUsers = []; // skip all teachers from reporting
    internship.AssignedUsers.forEach(function (user) {
        allowedUsers.push(user._id.toString());
    });
    
    var meta = new InternshipFormMR();
    forms.forEach(function (form) {
        // skip all teachers from reporting
        if(allowedUsers.indexOf(form.UserId.toString()) === -1){
            return;
        }
        
        var formData = form.FormData;
        var questions = formData.Questions;

        questions.forEach(function (subject) {
            subject.Questions.forEach(function (question) {
                if (InternshipFormMR.COUNTABLE.indexOf(question.Type) === -1) {
                    return undefined;
                }

                var path = [internship.Name, formData.Name, subject.Name];
                InternshipFormMR.initPath(meta.summary, path);
                var counter = meta.summary[internship.Name][formData.Name][subject.Name][question.Question];

                if (!counter) {
                    counter = {};
                    meta.summary[internship.Name][formData.Name][subject.Name][question.Question] = counter;
                }

                return InternshipFormMR.incrementCounters(counter, question, meta);
            })
        });
    });

    meta.keys = Object.keys(meta.keys);
    return callback(meta);
};

/**
 * This method is used to increment the counters for each answer
 */
InternshipFormMR.incrementCounters = function (counter, question, meta) {
    if (question.Type == 'MultipleChoiceMultipleAnswer') {
        Object.keys(question.Value).forEach(function (key) {
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
        var key = InternshipFormMR.stringifyAnswer(question.Type, question.Value);
        if (!counter[key]) {
            counter[key] = 1;
            meta.keys[key] = true;
        } else {
            counter[key]++;
        }
    }
}



/**
 * This class will generate a summary report form mapreduce data
 */
function FormSummary(data) {
    this.data = data;
    this.header = ['#. Internship', '#. Form', '#. Subject', '#. Question / Task'].concat(data.keys);
}

/**
 * This function will generate an summary report is array format
 */
FormSummary.prototype.toArray = function () {
    var summary = this.data.summary;
    var keys = this.data.keys;
    var rows = [];
    var emptyRow = FormSummary.emptyRow(keys);

    Object.keys(summary).forEach(function (internship_name) {
        var internship = summary[internship_name];
        var first_internship = true;
        Object.keys(internship).forEach(function (form_name) {
            var form = internship[form_name];
            var first_form = true;

            Object.keys(form).forEach(function (subject_name) {
                var subject = form[subject_name];
                var first_subject = true;
                Object.keys(subject).forEach(function (question) {
                    var answers = subject[question];

                    var cvs_internship = '';
                    if (first_internship) {
                        cvs_internship = internship_name;
                        first_internship = false;
                    }

                    var csv_form = '';
                    if (first_form) {
                        csv_form = form_name;
                        first_form = false;
                    }

                    var csv_subject = '';
                    if (first_subject) {
                        csv_subject = subject_name;
                        first_subject = false;
                    }
                    
                    var question_name = question;
                    var row = [cvs_internship, csv_form, csv_subject, question_name].concat(emptyRow);
                    keys.forEach(function (key, index) {
                        if(answers[key]){
                            row[index + 4] = answers[key];
                        }
                    });
                    
                    rows.push(row);
                });
            });
        });
    });
    
    
    var sum = ['-', '-', '-', 'Total'].concat(emptyRow);
    keys.forEach(function (key, index) {
        var count = 0;
        rows.forEach(function (row) {
            count += row[index + 4];
        });
        
        sum[index + 4] = count;
    });
    
    rows.push(sum);
    
    rows.unshift(this.header);
    
    return rows;
};

/**
 * This function will return a empty row
 */
FormSummary.emptyRow = function (keys) {
    var row = [];
    keys.forEach(function () {
        row.push(0);
    });

    return row;
};

// export 
module.exports = {
    'FormSummary': FormSummary,
    'InternshipFormMR': InternshipFormMR
};