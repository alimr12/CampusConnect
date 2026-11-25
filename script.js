
let studentTab = document.getElementById("studentTab");
let adminTab = document.getElementById("adminTab");
let loginTitle = document.getElementById("loginTitle");
let loginForm = document.getElementById("loginForm");
let signupForm = document.getElementById("signupForm");
let signupBox = document.getElementById("signupBox");
let signupLink = document.getElementById("signupLink");
let loginLink = document.getElementById("loginLink");
let message = document.getElementById("message");

let role = "student";

studentTab.classList.add("active");

studentTab.addEventListener("click", function() {
    role = "student";
    loginTitle.innerText = "Student Login";
    studentTab.classList.add("active");
    adminTab.classList.remove("active");
    signupBox.classList.remove("hidden");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    message.innerText = "";
});

adminTab.addEventListener("click", function() {
    role = "admin";
    loginTitle.innerText = "Admin Login";
    adminTab.classList.add("active");
    studentTab.classList.remove("active");
    signupBox.classList.add("hidden");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    message.innerText = "";
});

signupLink.addEventListener("click", function(event) {
    event.preventDefault();
    loginForm.classList.add("hidden");
    signupBox.classList.add("hidden");
    signupForm.classList.remove("hidden");
    message.innerText = "";
});

loginLink.addEventListener("click", function(event) {
    event.preventDefault();
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    signupBox.classList.remove("hidden");
    message.innerText = "";
});

signupForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("signupEmail").value.trim().toLowerCase();
    let password = document.getElementById("signupPassword").value;

    if (password.length < 6) {
        message.innerText = "Password must be at least 6 characters.";
        return;
    }

    let students = JSON.parse(localStorage.getItem("students")) || [];

    let existingStudent = students.find(function(student) {
        return student.email === email;
    });

    if (existingStudent) {
        message.innerText = "This email is already registered.";
        return;
    }

    let newStudent = {
        id: Date.now(),
        name: name,
        email: email,
        password: password
    };

    students.push(newStudent);

    localStorage.setItem("students", JSON.stringify(students));

    signupForm.reset();
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    signupBox.classList.remove("hidden");

    message.innerText = "Account created. Please login.";
});

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    let email = document.getElementById("email").value.trim().toLowerCase();
    let password = document.getElementById("password").value;

    if (role === "admin") {
        if (email === "admin@campus.com" && password === "admin123") {
            localStorage.setItem("currentUser", JSON.stringify({
                name: "Administrator",
                email: email,
                role: "admin"
            }));

            window.location.href = "dashboard.html";
        } else {
            message.innerText = "Invalid admin email or password.";
        }
    } else {
        let students = JSON.parse(localStorage.getItem("students")) || [];

        let student = students.find(function(student) {
            return student.email === email && student.password === password;
        });

        if (student) {
            localStorage.setItem("currentUser", JSON.stringify({
                name: student.name,
                email: student.email,
                role: "student"
            }));

            window.location.href = "student-dashboard.html";
        } else {
            message.innerText = "Invalid student email or password.";
        }
    }
});
