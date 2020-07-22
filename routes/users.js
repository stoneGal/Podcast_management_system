const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../db');
require('dotenv').config();

const secret = process.env.secret;

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query('SELECT * FROM users');
    return res.json(results.rows);
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    console.log('hhdhshdsh', req.body.admin);
    const hashpassword = await bcrypt.hash(req.body.password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password, admin )  VALUES($1, $2,$3)   RETURNING *',
      [req.body.username, hashpassword, req.body.admin]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const foundUser = await db.query(
      'SELECT * FROM users WHERE username=$1 LIMIT 1',
      [req.body.username]
    );
    if (foundUser.rows.length === 0) {
      return res.json({ message: 'Invalid Username' });
    }
    const hashedpassword = await bcrypt.compare(
      req.body.password,
      foundUser.rows[0].password
    );

    if (hashedpassword === false) {
      return res.json({ message: 'Invalid Password!' });
    }

    const token = jwt.sign(
      {
        username: foundUser.rows[0].username,
      },
      secret,
      {
        expiresIn: 60 * 60,
      }
    );

    return res.json({ token });
  } catch (err) {
    return res.json(err);
  }
});

function ensureLoggedIn(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const authHeaderString = authHeader.split(' ')[1];
    const token = jwt.verify(authHeaderString, secret);
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'unauthorized' });
  }
}

router.get('/secret', ensureLoggedIn, async (req, res, next) => {
  try {
    return res.json({ message: 'you made it' });
  } catch (err) {
    return res.json({ err });
  }
});

function ensureCorrectUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const authHeaderString = authHeader.split(' ')[1];
    const token = jwt.verify(authHeaderString, secret);
    if (token.username === req.params.username) {
      return next();
    } else {
      return res.status(401).json({ message: 'unauthorized' });
    }
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'unauthorized' });
  }
}

router.get('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    return res.json({ message: 'you made it' });
  } catch (err) {
    return res.json({ err });
  }
});

module.exports = router;
