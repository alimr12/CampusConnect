
let getData = key => JSON.parse(localStorage.getItem(key)) || [];
let saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

let addCell = (row, value) => {
    let cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
};

let showEmpty = (list, columns, message) => {
    let row = document.createElement("tr");
    let cell = document.createElement("td");
    cell.colSpan = columns;
    cell.textContent = message;
    row.appendChild(cell);
    list.appendChild(row);
};

let addButton = (row, className, text, id) => {
    let cell = document.createElement("td");
    let button = document.createElement("button");
    button.className = className;
    button.innerText = text;
    button.setAttribute("data-id", id);
    cell.appendChild(button);
    row.appendChild(cell);
};

let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let page = document.body.getAttribute("data-page");
let pageAllowed = true;

if (page === "admin" && (!currentUser || currentUser.role !== "admin")) {
    pageAllowed = false;
    window.location.href = "index.html";
}

if (page === "student" && (!currentUser || currentUser.role !== "student")) {
    pageAllowed = false;
    window.location.href = "index.html";
}

let studentTab = document.getElementById("studentTab");
let adminTab = document.getElementById("adminTab");
let loginForm = document.getElementById("loginForm");
let signupForm = document.getElementById("signupForm");
let message = document.getElementById("message");
let role = "student";

if (studentTab && adminTab) {
    studentTab.addEventListener("click", () => {
        role = "student";
        document.getElementById("loginTitle").innerText = "Student Login";
        studentTab.classList.add("active");
        adminTab.classList.remove("active");
        document.getElementById("signupBox").classList.remove("hidden");
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        message.innerText = "";
    });

    adminTab.addEventListener("click", () => {
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
    signupLink.addEventListener("click", event => {
        event.preventDefault();
        loginForm.classList.add("hidden");
        document.getElementById("signupBox").classList.add("hidden");
        signupForm.classList.remove("hidden");
        message.innerText = "";
    });
}

if (loginLink) {
    loginLink.addEventListener("click", event => {
        event.preventDefault();
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        document.getElementById("signupBox").classList.remove("hidden");
        message.innerText = "";
    });
}

if (signupForm) {
    signupForm.addEventListener("submit", event => {
        event.preventDefault();
        let name = document.getElementById("name").value.trim();
        let email = document.getElementById("signupEmail").value.trim().toLowerCase();
        let password = document.getElementById("signupPassword").value;
        let students = getData("students");

        if (!name || !email || !password) {
            message.innerText = "Please fill all fields.";
            return;
        }

        if (password.length < 6) {
            message.innerText = "Password must be at least 6 characters.";
            return;
        }

        let exists = students.find(student => student.email === email);

        if (exists) {
            message.innerText = "Email already registered.";
            return;
        }

        students.push({
            id: Date.now(), name: name, email: email,
            password: password, registeredCourses: []
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
    loginForm.addEventListener("submit", event => {
        event.preventDefault();
        let email = document.getElementById("email").value.trim().toLowerCase();
        let password = document.getElementById("password").value;

        if (role === "admin") {
            if (email === "admin@campus.com" && password === "admin123") {
                currentUser = {name: "Administrator", email: email, role: "admin"};
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                window.location.href = "dashboard.html";
            } else {
                message.innerText = "Invalid admin login.";
            }
        } else {
            let students = getData("students");
            let student = students.find(item => item.email === email && item.password === password);

            if (student) {
                currentUser = {name: student.name, email: email, role: "student"};
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                window.location.href = "student-dashboard.html";
            } else {
                message.innerText = "Invalid student login.";
            }
        }
    });
}

let logoutButtons = document.querySelectorAll(".logoutBtn");

logoutButtons.forEach(button => {
    button.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });
});

if (page === "admin" && pageAllowed) {
    let welcomeAdmin = document.getElementById("welcomeAdmin");

    if (welcomeAdmin) {
        welcomeAdmin.innerText = "Welcome back, " + currentUser.name;
        document.getElementById("totalStudents").innerText = getData("students").length;
        document.getElementById("totalCourses").innerText = getData("courses").length;
        document.getElementById("totalAttendance").innerText = getData("attendance").length;
    }
}

let studentForm = document.getElementById("studentForm");

if (studentForm && pageAllowed) {
    let studentList = document.getElementById("studentList");
    let searchStudent = document.getElementById("searchStudent");
    let studentMessage = document.getElementById("studentMessage");

    let showStudents = (search = "") => {
        let students = getData("students");
        let courses = getData("courses");
        let filtered = students.filter(student =>
            student.name.toLowerCase().includes(search.toLowerCase()) ||
            student.email.toLowerCase().includes(search.toLowerCase())
        );

        studentList.innerHTML = "";

        filtered.forEach(student => {
            let registered = student.registeredCourses || [];
            let names = courses.filter(course => registered.includes(course.id)).map(course => course.name);
            let row = document.createElement("tr");

            addCell(row, student.name);
            addCell(row, student.email);
            addCell(row, names.length ? names.join(", ") : "Not registered");
            addButton(row, "delete-btn", "Delete", student.id);
            studentList.appendChild(row);
        });

        if (filtered.length === 0) showEmpty(studentList, 4, "No students found.");
    };

    studentForm.addEventListener("submit", event => {
        event.preventDefault();
        let name = document.getElementById("studentName").value.trim();
        let email = document.getElementById("studentEmail").value.trim().toLowerCase();
        let password = document.getElementById("studentPassword").value;
        let students = getData("students");

        if (!name || !email || password.length < 6) {
            studentMessage.innerText = "Enter all details and a password of at least 6 characters.";
            return;
        }

        let exists = students.find(student => student.email === email);

        if (exists) {
            studentMessage.innerText = "This email already exists.";
            return;
        }

        students.push({
            id: Date.now(), name: name, email: email,
            password: password, registeredCourses: []
        });

        saveData("students", students);
        studentForm.reset();
        studentMessage.innerText = "Student added successfully.";
        showStudents(searchStudent.value);
    });

    searchStudent.addEventListener("input", () => showStudents(searchStudent.value));

    studentList.addEventListener("click", event => {
        let button = event.target.closest(".delete-btn");

        if (button) {
            let id = button.getAttribute("data-id");
            let students = getData("students");
            let deleted = students.find(student => String(student.id) === id);

            students = students.filter(student => String(student.id) !== id);
            saveData("students", students);

            if (deleted) {
                let attendance = getData("attendance").filter(record => record.email !== deleted.email);
                saveData("attendance", attendance);
            }

            showStudents(searchStudent.value);
            studentMessage.innerText = "Student deleted successfully.";
        }
    });

    showStudents();
}

let courseForm = document.getElementById("courseForm");

if (courseForm && pageAllowed) {
    let courseList = document.getElementById("courseList");
    let courseMessage = document.getElementById("courseMessage");

    let showCourses = () => {
        let courses = getData("courses");
        courseList.innerHTML = "";

        courses.forEach(course => {
            let row = document.createElement("tr");
            addCell(row, course.name);
            addCell(row, course.teacher);
            addCell(row, course.duration + " weeks");
            addButton(row, "delete-btn", "Delete", course.id);
            courseList.appendChild(row);
        });

        if (courses.length === 0) showEmpty(courseList, 4, "No courses added yet.");
    };

    courseForm.addEventListener("submit", event => {
        event.preventDefault();
        let courses = getData("courses");
        let name = document.getElementById("courseName").value.trim();
        let teacher = document.getElementById("courseTeacher").value.trim();
        let duration = Number(document.getElementById("courseDuration").value);

        if (!name || !teacher || duration < 1) {
            courseMessage.innerText = "Please enter valid course details.";
            return;
        }

        courses.push({id: Date.now(), name: name, teacher: teacher, duration: duration});
        saveData("courses", courses);
        courseForm.reset();
        courseMessage.innerText = "Course added successfully.";
        showCourses();
    });

    courseList.addEventListener("click", event => {
        let button = event.target.closest(".delete-btn");

        if (button) {
            let id = button.getAttribute("data-id");
            let courses = getData("courses").filter(course => String(course.id) !== id);
            saveData("courses", courses);
            showCourses();
            courseMessage.innerText = "Course deleted.";
        }
    });

    showCourses();
}

let attendanceForm = document.getElementById("attendanceForm");

if (attendanceForm && pageAllowed) {
    let attendanceStudent = document.getElementById("attendanceStudent");
    let attendanceCourse = document.getElementById("attendanceCourse");
    let attendanceList = document.getElementById("attendanceList");
    let attendanceMessage = document.getElementById("attendanceMessage");

    let fillAttendanceOptions = () => {
        let students = getData("students");
        attendanceStudent.innerHTML = '<option value="">Select Student</option>';

        students.forEach(student => {
            let option = document.createElement("option");
            option.value = student.email;
            option.textContent = student.name;
            attendanceStudent.appendChild(option);
        });
    };

    attendanceStudent.addEventListener("change", () => {
        let students = getData("students");
        let courses = getData("courses");
        let student = students.find(item => item.email === attendanceStudent.value);

        attendanceCourse.innerHTML = '<option value="">Select Course</option>';

        if (student && student.registeredCourses) {
            let registered = courses.filter(course => student.registeredCourses.includes(course.id));

            registered.forEach(course => {
                let option = document.createElement("option");
                option.value = course.name;
                option.textContent = course.name;
                attendanceCourse.appendChild(option);
            });
        }
    });

    let showAttendance = () => {
        let records = getData("attendance");
        let students = getData("students");
        attendanceList.innerHTML = "";

        records.forEach(record => {
            let student = students.find(item => item.email === record.email);
            let row = document.createElement("tr");

            addCell(row, student ? student.name : record.email);
            addCell(row, record.course);
            addCell(row, record.date);
            addCell(row, record.status);
            attendanceList.appendChild(row);
        });

        if (records.length === 0) showEmpty(attendanceList, 4, "No attendance records yet.");
    };

    attendanceForm.addEventListener("submit", event => {
        event.preventDefault();
        let records = getData("attendance");
        let email = attendanceStudent.value;
        let course = attendanceCourse.value;
        let date = new Date().toLocaleDateString();

        if (!email || !course) {
            attendanceMessage.innerText = "Please select a student and course.";
            return;
        }

        let exists = records.find(record =>
            record.email === email && record.course === course && record.date === date
        );

        if (exists) {
            attendanceMessage.innerText = "Attendance already recorded today.";
            return;
        }

        records.push({
            id: Date.now(), email: email, course: course,
            date: date, status: document.getElementById("attendanceStatus").value
        });

        saveData("attendance", records);
        attendanceForm.reset();
        attendanceCourse.innerHTML = '<option value="">Select Course</option>';
        attendanceMessage.innerText = "Attendance saved.";
        showAttendance();
    });

    fillAttendanceOptions();
    showAttendance();
}

let reportList = document.getElementById("reportList");

if (reportList && pageAllowed) {
    let students = getData("students");
    let courses = getData("courses");
    let attendance = getData("attendance");

    document.getElementById("reportStudents").innerText = students.length;
    document.getElementById("reportCourses").innerText = courses.length;

    let present = attendance.filter(record => record.status === "Present");
    document.getElementById("reportPresent").innerText = present.length;
    reportList.innerHTML = "";

    attendance.forEach(record => {
        let student = students.find(item => item.email === record.email);
        let row = document.createElement("tr");

        addCell(row, student ? student.name : record.email);
        addCell(row, record.course);
        addCell(row, record.date);
        addCell(row, record.status);
        reportList.appendChild(row);
    });

    if (attendance.length === 0) showEmpty(reportList, 4, "No attendance reports available.");
}

if (page === "student" && pageAllowed) {
    let students = getData("students");
    let student = students.find(item => item.email === currentUser.email);
    let studentCourses = document.getElementById("studentCourses");

    if (student) {
        if (!student.registeredCourses) student.registeredCourses = [];

        document.getElementById("welcomeStudent").innerText = "Welcome back, " + student.name;
        document.getElementById("studentName").innerText = student.name;
        document.getElementById("studentEmail").innerText = student.email;

        let showStudentCourses = () => {
            let courses = getData("courses");
            studentCourses.innerHTML = "";

            courses.forEach(course => {
                let card = document.createElement("div");
                card.className = "course-card";

                let heading = document.createElement("h3");
                heading.textContent = course.name;
                let teacher = document.createElement("p");
                teacher.textContent = "Teacher: " + course.teacher;
                let duration = document.createElement("p");
                duration.textContent = "Duration: " + course.duration + " weeks";

                let button = document.createElement("button");
                button.className = "btn register-course-btn";
                button.setAttribute("data-id", course.id);

                if (student.registeredCourses.includes(course.id)) {
                    button.innerText = "Registered";
                    button.disabled = true;
                } else {
                    button.innerText = "Register";
                }

                card.appendChild(heading);
                card.appendChild(teacher);
                card.appendChild(duration);
                card.appendChild(button);
                studentCourses.appendChild(card);
            });

            if (courses.length === 0) studentCourses.innerText = "No courses available yet.";
        };

        studentCourses.addEventListener("click", event => {
            let button = event.target.closest(".register-course-btn");

            if (button) {
                let courseId = Number(button.getAttribute("data-id"));

                if (!student.registeredCourses.includes(courseId)) {
                    student.registeredCourses.push(courseId);
                    let allStudents = getData("students");
                    let index = allStudents.findIndex(item => item.email === currentUser.email);

                    if (index !== -1) {
                        allStudents[index] = student;
                        saveData("students", allStudents);
                        showStudentCourses();
                    }
                }
            }
        });

        showStudentCourses();

        let courses = getData("courses");
        let registeredNames = courses.filter(course =>
            student.registeredCourses.includes(course.id)
        ).map(course => course.name);

        let records = getData("attendance").filter(record =>
            record.email === currentUser.email && registeredNames.includes(record.course)
        );

        let myAttendanceList = document.getElementById("myAttendanceList");
        myAttendanceList.innerHTML = "";

        records.forEach(record => {
            let row = document.createElement("tr");
            addCell(row, record.date);
            addCell(row, record.course);
            addCell(row, record.status);
            myAttendanceList.appendChild(row);
        });

        if (records.length === 0) showEmpty(myAttendanceList, 3, "No attendance records yet.");
    }
}
