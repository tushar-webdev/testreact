require('core-js'); // <- at the top of your entry point
const _ = require('lodash');
const winston = require('winston');

const groupData = async (group1, group2, upsertKey) => {
    await group2.forEach(currentItem => {
        const data = group1[currentItem["id"]];
        data.sort((a, b) => b.marks - a.marks);
        const totalMarks = _.sumBy(data, "marks");
        currentItem[upsertKey] = data;
        currentItem.marks = totalMarks;
        return currentItem
    });

    return group2
}

const processData = async (data = {}) => {
    // Extracting schools and members from args[data]
    const { schools, members } = data;
    // Grouping members into teachers and students {teachers: [], students: []}
    const groups = _.groupBy(members, "role");
    // Extracting array of teacher and student from groups
    const {teacher, student} = groups;
    // Grouping students by teacher {teacher_id : [...students]}
    const studentsByTeacher = _.groupBy(student, "teacher_id");
    // Joining studentsByTeacher and teachers forming {teacher: {students: [...], marks: xxx}, ...}
    const studentTeacherRelation = await groupData(studentsByTeacher, teacher, "students");
    // Grouping studentTeacherRelation by school_id {school_id: [{teacher: {students: [...], marks: xxx}, ...}], ...}
    const teachersBySchool = _.groupBy(studentTeacherRelation, "school_id");
    // Joining teachersBySchool and schools forming {school:{ members: [{teacher: {students: [...], marks: xxx}, ...}], marks: xx, ... }
    const teacherSchoolRelation = await groupData(teachersBySchool, schools, "members");
    // sorting the teacherSchoolRelation by marks.
    const finalData = await teacherSchoolRelation.sort((a, b) => b.marks - a.marks);
    // returning the final data
    return finalData
}

module.exports = {
    processData
}
