const Sequelize = require('sequelize')
const sequelize = require('../db')
const User = sequelize.define('users', {
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey: true,
		autoIncrement: true
	},
	username: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false,
	},
    admin: {
		type: Sequelize.BOOLEAN,
		allowNull: true,
	},
}, {sequelize, modelName: 'User', tableName: 'users', timestamps: true})

const Session = sequelize.define('session', {
	id: {
		type: Sequelize.BIGINT.UNSIGNED,
		primaryKey: true,
		autoIncrement: true
	},
	content: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	iv: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	active: {
		type: Sequelize.BOOLEAN,
		deafultValue: true,
	},
}, {sequelize, modelName: 'Session', tableName: 'sessions', timestamps: true})


User.hasMany(Session)

const Models = {
    User,
	Session
}
module.exports = Models