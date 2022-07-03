const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const SuperUser = require('../models/SuperUser');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'haxorai', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'haxorai', async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};


const requireAdminAuth = (req, res, next) => {
  let token = req.cookies.jwtAdmin;
  const token1 = req.cookies.jwtSuperuser; 
  token = token? token: token1;
  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'haxorai', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/admin-login');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/admin-login');
  }
};

// check current admin
const checkAdmin = (req, res, next) => {
  const token = req.cookies.jwtAdmin;
  if (token) {
    jwt.verify(token, 'haxorai', async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        next();
      } else {
        let admin = await Admin.findById(decodedToken.id);
        res.locals.admin = admin;
        next();
      }
    });
  } else {
    res.locals.admin = null;
    next();
  }
};


const requireSuperuserAuth = (req, res, next) => {
  const token = req.cookies.jwtSuperuser;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'haxorai', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/haxorai');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/haxorai');
  }
};

// check current admin
const checkSuperuser = (req, res, next) => {
  const token = req.cookies.jwtSuperuser;
  if (token) {
    jwt.verify(token, 'haxorai', async (err, decodedToken) => {
      if (err) {
        res.locals.superuser = null;
        next();
      } else {
        let superuser = await SuperUser.findById(decodedToken.id);
        res.locals.superuser = superuser;
        next();
      }
    });
  } else {
    res.locals.superuser = null;
    next();
  }
};

module.exports = { 
  requireAuth, 
  checkUser, 
  requireAdminAuth, 
  checkAdmin,
  requireSuperuserAuth,
  checkSuperuser 
};