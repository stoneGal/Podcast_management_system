const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/users/:id/podcast', async (req, res, next) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE id=$1', [
      req.params.id,
    ]);

    const podcast = await db.query(
      'SELECT title,description,tag,file,date_upload,users_id  FROM podcast WHERE users_id=$1',
      [req.params.id]
    );

    user.rows[0].podcast = podcast.rows;
    return res.json(user.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.post('/users/:id/podcast', async (req, res, next) => {
  try {
    const user = await db.query(
      'INSERT INTO podcast(title,description,tag,file,date_upload, users_id) VALUES ($1, $2,$3,$4,$5,$6)',
      [
        req.body.title,
        req.body.description,
        req.body.tag,
        req.body.file,
        req.body.date_upload,
        req.params.id,
      ]
    );

    return res.json({ message: 'podcast created' });
  } catch (error) {
    return next(error);
  }
});

router.put('/users/:id/podcast/:podcastId', async function (req, res, next) {
  try {
    const user = await db.query('SELECT * FROM users WHERE id=$1', [
      req.params.id,
    ]);
    if (user.rows[0].admin) {
      const podcast = await db.query(
        'UPDATE podcast SET title=$1, description=$2, tag=$3, file=$4, date_upload=$5 WHERE users_id=$6 AND id=$7  RETURNING *',
        [
          req.body.title,
          req.body.description,
          req.body.tag,
          req.body.file,
          req.body.date_upload,
          req.params.id,
          req.params.podcastId,
        ]
      );

      return res
        .status(200)
        .json({ success: true, message: 'podcast updated successfully' });
    } else {
      return res.json({
        message: 'you are not an admin so you cant delete this podcast',
      });
    }
  } catch (error) {
    return next(error);
  }
});

router.delete('/users/:id/podcast/:podcastId', async function (req, res, next) {
  try {
    const user = await db.query('SELECT * FROM users WHERE id=$1', [
      req.params.id,
    ]);

    if (user.rows[0].admin) {
      const podcast = await db.query(
        'DELETE FROM  podcast WHERE id=$1  RETURNING *',
        [req.params.id]
      );

      return res.status(200).json({ message: 'podcast delected successfully' });
    } else {
      return res.json({
        message: "you are not an admin so you can't delete this podcast",
      });
    }
  } catch (error) {
    return next(error);
  }
});

router.get('/podcast', async function (req, res, next) {
  try {
    const user = await db.query('SELECT * FROM users');

    if (user.rows[0].admin) {
      const podcast = await db.query('SELECT * FROM  podcast');

      return res.status(200).json(podcast.rows);
    } else {
      return res.json({ message: 'you are not an admin' });
    }
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
