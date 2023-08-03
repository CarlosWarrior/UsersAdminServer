const validPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
const isValidPassword = pass => pass && validPassword.test(pass)
const {hash} = require("../crypto")
const {User} = require("../models")
const UserController = {
    list:async(req, res) => {
		const users = await User.findAll({
			where:{ admin:null },
			attributes: { exclude: ['password'] }
		})
		res.send(users)
	},
    create:async(req, res) => {
		if(!req.body.username )
		    return res.status(400).send({message:"username needed"})
        if(!isValidPassword(req.body.password))
			return res.status(400).send({message:"password needed of Minimum eight characters, at least one letter and one number"})
        
		const userTemplate = {
			username: req.body.username,
			password: hash(req.body.password),
		}
		const user = await User.create(userTemplate)
		res.send(user)
	},
    delete:async(req, res) => {
		const user = await User.findOne({
			where:{ id:req.params.id, admin: null },
			attributes: { exclude: ['password'] }
		})
		if(!user)
			return raise()
	},
    permissions:async(req, res) => {

	},

}
const controllers = {
    users: UserController
}
module.exports = controllers