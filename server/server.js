const express = require("express");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { createConnection } = require("./api/mongodb");

// ייבוא נתיבי routes
const authRoutes = require("./routes/authRoutes");
const contractRoutes = require("./routes/contractRoutes");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const supportRoutes = require("./routes/supportRoutes");

const app = express();
const PORT = 5000;

// יצירת חיבור ל-MongoDB
createConnection()
    .then(() => console.log("MongoDB Connected OK"))
    .catch((e) => console.error(`MongoDB Connection ERROR - ${e}`));

// הגדרת מידלוור (middleware)
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// הגדרת הנתיבים
app.use("/", authRoutes);
app.use("/contracts", contractRoutes);
app.use("/users", userRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/support-requests", supportRoutes);

// יצירת השרת
http.createServer(app).listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});