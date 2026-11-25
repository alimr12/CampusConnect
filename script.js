
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function addCell(row, value) {
    let cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
}

function showEmpty(list, columns, message) {
    let row = document.createElement("tr");
    let cell = document.createElement("td");
    cell.colSpan = columns;
    cell.textContent = message;
    row.appendChild(cell);
    list.appendChild(row);
}

let page = document.body.getAttribute("data-page");

if (page === "admin" && (!currentUser || currentUser.role !== "admin")) {
    window.location.href = "index.html";
}

if (page === "student" && (!currentUser || currentUser.role !== "student")) {
    window.location.href = "index.html";
}

let studentTab = document.getElementById("studentTab");
let adminTab = document.getElementById("adminTab");
let loginForm = document.getElementById("loginForm");
let signupForm = document.getElementById("signupForm");
let message = document.getElementById("message");
let role = "student";

if (studentTab && adminTab) {
    studentTab.addEventListener("click", function() {
        role = "student";
        document.getElementById("loginTitle").innerText = "Student Login";
        studentTab.classList.add("active");
        adminTab.classList.remove("active");
        document.getElementById("signupBox").classList.remove("hidden");
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        message.innerText = "";
    });

    adminTab.addEventListener("click", function() {
        role = "admin";
        document.getElementById("loginTitle").innerText = "Admin Login";
        adminTab.classList.add("active");
        studentTab.classList.remove("active");
        document.getElementById("signupBox").classList.add("hidden");
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        message.innerText = "";
    });
}

let signupLink = document.getElementById("signupLink");
let loginLink = document.getElementById("loginLink");

if (signupLink) {
    signupLink.addEventListener("click", function(event) {
        event.preventDefault();
        loginForm.classList.add("hidden");
        document.getElementById("signupBox").classList.add("hidden");
        signupForm.classList.remove("hidden");
        message.innerText = "";
    });
}

if (loginLink) {
    loginLink.addEventListener("click", function(event) {
        event.preventDefault();
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        document.getElementById("signupBox").classList.remove("hidden");
        message.innerText = "";
    });
}

if (signupForm) {
    signupForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let name = document.getElementById("name").value.trim();
        let email = document.getElementById("signupEmail").value.trim().toLowerCase();
        let password = document.getElementById("signupPassword").value;
        let students = getData("students");

        if (password.length < 6) {
            message.innerText = "Password must be at least 6 characters.";
            return;
        }

        let exists = students.find(function(student) {
            return student.email === email;
        });

        if (exists) {
            message.innerText = "Email already registered.";
            return;
        }

        students.push({
            id: Date.now(),
            name: name,
            email: email,
            password: password
        });

        saveData("students", students);
        signupForm.reset();
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        document.getElementById("signupBox").classList.remove("hidden");
        message.innerText = "Account created. Please login.";
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let email = document.getElementById("email").value.trim().toLowerCase();
        let password = document.getElementById("password").value;

        if (role === "admin") {
            if (email === "admin@campus.com" && password === "admin123") {
                currentUser = {
                    name: "Administrator",
                    email: email,
                    role: "admin"
                };

                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                window.location.href = "dashboard.html";
            } else {
                message.innerText = "Invalid admin login.";
            }
        } else {
            let students = getData("students");

            let student = students.find(function(item) {
                return item.email === email && item.password === password;
            });

            if (student) {
                currentUser = {
                    name: student.name,
                    email: student.email,
                    role: "student"
                };

                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                window.location.href = "student-dashboard.html";
            } else {
                message.innerText = "Invalid student login.";
            }
        }
    });
}

let logoutButtons = document.querySelectorAll(".logoutBtn");

logoutButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });
});

if (page === "admin") {
    let students = getData("students");
    let courses = getData("courses");
    let attendance = getData("attendance");

    let welcomeAdmin = document.getElementById("welcomeAdmin");

    if (welcomeAdmin) {
        welcomeAdmin.innerText = "Welcome back, " + currentUser.name;
        document.getElementById("totalStudents").innerText = students.length;
        document.getElementById("totalCourses").innerText = courses.length;
        document.getElementById("totalAttendance").innerText = attendance.length;
    }
}

let studentForm = document.getElementById("studentForm");

if (studentForm) {
    let studentList = document.getElementById("studentList");
    let searchStudent = document.getElementById("searchStudent");
    let studentMessage = document.getElementById("studentMessage");

    function showStudents(search = "") {
        let students = getData("students");

        let filtered = students.filter(function(student) {
            return student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.email.toLowerCase().includes(search.toLowerCase());
        });

        studentList.innerHTML = "";

        filtered.forEach(function(student) {
            let row = document.createElement("tr");
            addCell(row, student.name);
            addCell(row, student.email);

            let cell = document.createElement("td");
            let button = document.createElement("button");
            button.className = "delete-btn";
            button.innerText = "Delete";
            button.setAttribute("data-id", student.id);
            cell.appendChild(button);
            row.appendChild(cell);
            studentList.appendChild(row);
        });

        if (filtered.length === 0) {
            showEmpty(studentList, 3, "No students found.");
        }
    }

    studentForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let name = document.getElementById("studentName").value.trim();
        let email = document.getElementById("studentEmail").value.trim().toLowerCase();
        let password = document.getElementById("studentPassword").value;
        let students = getData("students");

        let exists = students.find(function(student) {
            return student.email === email;
        });

        if (exists) {
            studentMessage.innerText = "This email already exists.";
            return;
        }

        students.push({
            id: Date.now(),
            name: name,
            email: email,
            password: password
        });

        saveData("students", students);
        studentForm.reset();
        studentMessage.innerText = "Student added successfully.";
        showStudents(searchStudent.value);
    });

    searchStudent.addEventListener("input", function() {
        showStudents(this.value);
    });

    studentList.addEventListener("click", function(event) {
        if (event.target.classList.contains("delete-btn")) {
            let id = Number(event.target.getAttribute("data-id"));
            let students = getData("students");

            students = students.filter(function(student) {
                return student.id !== id;
            });

            saveData("students", students);
            showStudents(searchStudent.value);
            studentMessage.innerText = "Student deleted.";
        }
    });

    showStudents();
}

let courseForm = document.getElementById("courseForm");

if (courseForm) {
    let courseList = document.getElementById("courseList");
    let courseMessage = document.getElementById("courseMessage");

    function showCourses() {
        let courses = getData("courses");
        courseList.innerHTML = "";

        courses.forEach(function(course) {
            let row = document.createElement("tr");
            addCell(row, course.name);
            addCell(row, course.teacher);
            addCell(row, course.duration + " weeks");

            let cell = document.createElement("td");
            let button = document.createElement("button");
            button.className = "delete-btn";
            button.innerText = "Delete";
            button.setAttribute("data-id", course.id);
            cell.appendChild(button);
            row.appendChild(cell);
            courseList.appendChild(row);
        });

        if (courses.length === 0) {
            showEmpty(courseList, 4, "No courses added yet.");
        }
    }

    courseForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let courses = getData("courses");

        courses.push({
            id: Date.now(),
            name: document.getElementById("courseName").value.trim(),
            teacher: document.getElementById("courseTeacher").value.trim(),
            duration: Number(document.getElementById("courseDuration").value)
        });

        saveData("courses", courses);
        courseForm.reset();
        courseMessage.innerText = "Course added successfully.";
        showCourses();
    });

    courseList.addEventListener("click", function(event) {
        if (event.target.classList.contains("delete-btn")) {
            let id = Number(event.target.getAttribute("data-id"));
            let courses = getData("courses");

            courses = courses.filter(function(course) {
                return course.id !== id;
            });

            saveData("courses", courses);
            showCourses();
            courseMessage.innerText = "Course deleted.";
        }
    });

    showCourses();
}

let attendanceForm = document.getElementById("attendanceForm");

if (attendanceForm) {
    let attendanceStudent = document.getElementById("attendanceStudent");
    let attendanceCourse = document.getElementById("attendanceCourse");
    let attendanceList = document.getElementById("attendanceList");
    let attendanceMessage = document.getElementById("attendanceMessage");

    function fillAttendanceOptions() {
        let students = getData("students");
        let courses = getData("courses");

        students.forEach(function(student) {
            let option = document.createElement("option");
            option.value = student.email;
            option.textContent = student.name;
            attendanceStudent.appendChild(option);
        });

        courses.forEach(function(course) {
            let option = document.createElement("option");
            option.value = course.name;
            option.textContent = course.name;
            attendanceCourse.appendChild(option);
        });
    }

    function showAttendance() {
        let records = getData("attendance");
        let students = getData("students");
        attendanceList.innerHTML = "";

        records.forEach(function(record) {
            let student = students.find(function(item) {
                return item.email === record.email;
            });

            let row = document.createElement("tr");
            addCell(row, student ? student.name : record.email);
            addCell(row, record.course);
            addCell(row, record.date);
            addCell(row, record.status);
            attendanceList.appendChild(row);
        });

        if (records.length === 0) {
            showEmpty(attendanceList, 4, "No attendance records yet.");
        }
    }

    attendanceForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let records = getData("attendance");
        let email = attendanceStudent.value;
        let course = attendanceCourse.value;
        let date = new Date().toLocaleDateString();

        let exists = records.find(function(record) {
            return record.email === email && record.course === course && record.date === date;
        });

        if (exists) {
            attendanceMessage.innerText = "Attendance already recorded today.";
            return;
        }

        records.push({
            id: Date.now(),
            email: email,
            course: course,
            date: date,
            status: document.getElementById("attendanceStatus").value
        });

        saveData("attendance", records);
        attendanceForm.reset();
        attendanceMessage.innerText = "Attendance saved.";
        showAttendance();
    });

    fillAttendanceOptions();
    showAttendance();
}

let reportList = document.getElementById("reportList");

if (reportList) {
    let students = getData("students");
    let courses = getData("courses");
    let attendance = getData("attendance");

    document.getElementById("reportStudents").innerText = students.length;
    document.getElementById("reportCourses").innerText = courses.length;

    let present = attendance.filter(function(record) {
        return record.status === "Present";
    });

    document.getElementById("reportPresent").innerText = present.length;
    reportList.innerHTML = "";

    attendance.forEach(function(record) {
        let student = students.find(function(item) {
            return item.email === record.email;
        });

        let row = document.createElement("tr");
        addCell(row, student ? student.name : record.email);
        addCell(row, record.course);
        addCell(row, record.date);
        addCell(row, record.status);
        reportList.appendChild(row);
    });

    if (attendance.length === 0) {
        showEmpty(reportList, 4, "No attendance reports available.");
    }
}

if (page === "student") {
    let student = getData("students").find(function(item) {
        return item.email === currentUser.email;
    });

    if (student) {
        document.getElementById("welcomeStudent").innerText = "Welcome back, " + student.name;
        document.getElementById("studentName").innerText = student.name;
        document.getElementById("studentEmail").innerText = student.email;
    }

    let courses = getData("courses");
    let studentCourses = document.getElementById("studentCourses");

    courses.forEach(function(course) {
        let card = document.createElement("div");
        card.className = "course-card";

        let heading = document.createElement("h3");
        heading.textContent = course.name;

        let teacher = document.createElement("p");
        teacher.textContent = "Teacher: " + course.teacher;

        let duration = document.createElement("p");
        duration.textContent = "Duration: " + course.duration + " weeks";

        card.appendChild(heading);
        card.appendChild(teacher);
        card.appendChild(duration);
        studentCourses.appendChild(card);
    });

    if (courses.length === 0) {
        studentCourses.innerText = "No courses available yet.";
    }

    let records = getData("attendance").filter(function(record) {
        return record.email === currentUser.email;
    });

    let myAttendanceList = document.getElementById("myAttendanceList");

    records.forEach(function(record) {
        let row = document.createElement("tr");
        addCell(row, record.date);
        addCell(row, record.course);
        addCell(row, record.status);
        myAttendanceList.appendChild(row);
    });

    if (records.length === 0) {
        showEmpty(myAttendanceList, 3, "No attendance records yet.");
    }
}
