const connection = require('../db-config');
const Joi = require('joi');
const argon2 = require('argon2');

const hashingOptions = {
  type: argon2.argon2id,
  hashLength: 64,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1
};

const hashPassword = (plainPassword) => {
  return argon2.hash(plainPassword, hashingOptions);
};

const verifyPassword = (plainPassword, hashedPassword) => {
  return argon2.verify(hashedPassword, plainPassword, hashingOptions);
};

const db = connection.promise();

const validate = (data, forCreation = true) => {
  const presence = forCreation ? 'required' : 'optional';
  return Joi.object({
    email: Joi.string().email().max(255).presence(presence),
    firstname: Joi.string().max(255).presence(presence),
    lastname: Joi.string().max(255).presence(presence),
    city: Joi.string().allow(null, '').max(255),
    language: Joi.string().allow(null, '').max(255),
    password: Joi.string().min(9).max(255).presence(presence)
  }).validate(data, { abortEarly: false }).error;
};

const validateConnexionBody = (data) => {
  return Joi.object({
    email: Joi.string().email().max(255).presence("required"),
    password: Joi.string().min(9).max(255).presence("required")
  }).validate(data, { abortEarly: false }).error;
};

const findMany = ({ filters: { language } }) => {
  let sql = 'SELECT * FROM users';
  const sqlValues = [];
  if (language) {
    sql += ' WHERE language = ?';
    sqlValues.push(language);
  }

  return db.query(sql, sqlValues).then(([results]) => results);
};

const findOne = (id) => {
  return db
    .query('SELECT * FROM users WHERE id = ?', [id])
    .then(([results]) => results[0]);
};

const findByEmail = async (email) => {
  return db
    .query('SELECT * FROM users WHERE email = ?', [email])
    .then(([results]) => results[0]);
};

const findByEmailWithDifferentId = async (email, id) => {
  return db
    .query('SELECT * FROM users WHERE email = ? AND id <> ?', [email, id])
    .then(([results]) => results[0]);
};

const create = async (data) => {
  return hashPassword(data.password)
    .then(hashedPassword => {
      delete data.password;
      data.hashedPassword = hashedPassword;
      return db.query('INSERT INTO users SET ?', data)
        .then(([result]) => {
          const id = result.insertId;
          let returnedData = { id: id, ...data };
          return returnedData;
          });
    })
};

const update = (id, newAttributes) => {
  return db.query('UPDATE users SET ? WHERE id = ?', [newAttributes, id]);
};

const destroy = (id) => {
  return db
    .query('DELETE FROM users WHERE id = ?', [id])
    .then(([result]) => result.affectedRows !== 0);
};

module.exports = {
  hashPassword,
  verifyPassword,
  findMany,
  findOne,
  validate,
  validateConnexionBody,
  create,
  update,
  destroy,
  findByEmail,
  findByEmailWithDifferentId,
};
