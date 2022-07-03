const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const examRoutes = require('./routes/examRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { checkUser, checkAdmin, checkSuperuser } = require('./middleware/authMiddleware');
require('dotenv').config();

const app = express();

// view engine setup 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/stylesheets",express.static(path.join(__dirname, "node_modules/animate.css")));
app.use("/javascripts",express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
app.use("/javascripts",express.static(path.join(__dirname, "node_modules/wowjs/dist")));
app.use(cookieParser());

const port = process.env.PORT || 3000;

// database connection
const db_URI = 'mongodb+srv://haxorai:Muneer2626@talenthub.kwsnay6.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(db_URI)
  .then((result) => {
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });

// routes
app.get('*', checkUser);
app.get('*', checkAdmin);
app.get('*', checkSuperuser);
app.use(examRoutes);
app.use(authRoutes);
app.use(paymentRoutes);
app.use(adminRoutes);
