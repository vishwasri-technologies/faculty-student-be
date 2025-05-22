const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");

const router = express.Router();

//Faculty Signup
router.post("/faculty/signup", async (req, res) => {
  const { fullName, idNumber, password } = req.body;

  try {
    const existingFaculty = await Faculty.findOne({ idNumber });
    if (existingFaculty) {
      return res.status(400).json({ message: " already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newFaculty = new Faculty({
      fullName,
      idNumber,
      password: hashedPassword,
    });

    await newFaculty.save();
    res.status(201).json({ message: " signup successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

//Student Signup
router.post("/student/signup", async (req, res) => {
  const { fullName, rollNumber, password } = req.body;

  try {
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      fullName,
      rollNumber,
      password: hashedPassword,
    });

    await newStudent.save();
    res.status(201).json({ message: "Student signup successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
return res.status(400).json({ message: "Please enter ID and password" });
}

try {
const isNumeric = /^\d+$/.test(id);

if (isNumeric) {
  // FACULTY LOGIN
  const faculty = await Faculty.findOne({ idNumber: id });
  if (!faculty) {
    return res.status(400).json({ message: "Invalid faculty ID or password" });
  }

  const isMatch = await bcrypt.compare(password, faculty.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid faculty ID or password" });
  }

  const token = jwt.sign(
    { id: faculty._id, role: "faculty" },
    process.env.JWT_SECRET,
  );

  return res.status(200).json({
    message: "Faculty login successful",
    token,
    role: "faculty",
    // redirectTo: "faculty-app",
    user: {
      fullName: faculty.fullName,
      idNumber: faculty.idNumber,
    },
  });
} else {
  // STUDENT LOGIN
  const student = await Student.findOne({ rollNumber: id });
  if (!student) {
    return res.status(400).json({ message: "Invalid roll number or password" });
  }

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid roll number or password" });
  }

  const token = jwt.sign(
    { id: student._id, role: "student" },
    process.env.JWT_SECRET,
  );

  return res.status(200).json({
    message: "Student login successful",
    token,
    role: "student",
    // redirectTo: "student-app",
    user: {
      fullName: student.fullName,
      rollNumber: student.rollNumber,
    },
  });
}
} catch (error) {
console.error("Login error:", error);
res.status(500).json({ message: "Server error", error });
}
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
  const { username, newPassword, confirmPassword } = req.body;

  // Basic validations
  if (!username || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let user = await Student.findOne({ idNumber: username });
    if (!user) {
      user = await Faculty.findOne({ idNumber: username });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
