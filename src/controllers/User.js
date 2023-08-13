const validPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
const isValidPassword = pass => pass && validPassword.test(pass)
const {hash} = require("../crypto")
const { raise } = require("../middleware")
const {User} = require("../models")
const UserController = {
  list:async(req, res) => {
		const users = await User.findAll({
			where:{ admin:null },
			attributes: { exclude: ['password'] }
		})
		res.send(users)
	},
  create:async(req, res, next) => {
		if(!req.body.username )
		    return next(raise({status:400, message:"username needed"}))
    if(!isValidPassword(req.body.password))
			return next(raise({status:400, message:"password needed of Minimum eight characters, at least one letter and one number"}))
        
    if(req.body.password !== req.body.repassword)
			return next(raise({status:400, message:"password did not match"}))
        
		const userTemplate = {
			username: req.body.username,
			password: hash(req.body.password),
		}
		const user = (await User.create(userTemplate)).toJSON()
		delete user["password"]
		res.send(user)
	},
	delete:async(req, res) => {
		const user = await User.findOne({
			where:{ id:req.params.id, admin: null },
			attributes: { exclude: ['password'] }
		})
		if(!user)
			return next(raise({status:404, message:"user does not exists"}))
	},

}

module.exports = UserController