const { sign, decode } = require("jsonwebtoken")
const { Op } = require("sequelize")
const {compareHash, encrypt, decrypt} = require("./crypto")
const {raise} = require('./middleware')
const { User, Session } = require("./models")
const isExpired = (timeString) => {
	const now = new Date()
	const then = new Date(timeString)
	const elapsed = Math.abs(now - then) / 36e5
	return isNaN(elapsed) || elapsed >= 10
}
//const { auth_validator } = require("../../validators")
module.exports = {
	authenticated: async(req, res, next)=> {
    	let token = req.get('token')
    	if(!token) token = req.query.token
    	if(!token) return next(raise({status:401,message:'token header missing'}))
		const existingSession = await Session.findOne({
			where: {content: token, active: true},
			order: [ [ 'id', 'DESC' ]],
		})
		if(!existingSession) return next(raise({status: 401, message: 'invalid session'}))
		const decryptedToken = decrypt({content: existingSession.content, iv: existingSession.iv})
    	let decodedToken = false
    	try{
      	    decodedToken = decode(decryptedToken,{complete:true}).payload
	    }
	    catch(error){
            return next(raise({status:500,message:'invalid token', errors:error}))
	    }
		if(!decodedToken || !decodedToken.user || !decodedToken.time){
			await Session.update({active: false}, {where:{content: token}})
			return next(raise({status:500,message:'invalid token'}))
		}
		const expired = isExpired(decodedToken.time)
		if(expired) {
			await Session.update({active: false}, {where:{content: token}})
			return next(raise({status:401, message:'expired token'}))
		}

		const user = decodedToken.user
		req.locals = {username: user.username, token}
		return next()
	},
	login: async(req, res, next) => {
	  const user = await User.findOne({
			where:{username:req.body.username}
		})
		
	  if(!user) return next(raise({status:422, message:'Invalid credentials'}))
		const password = user.password.substring(0,1) == '"'?user.password.substring(1, user.password.length-1):user.password
	  const attempt = await compareHash(req.body.password, password)

		if(attempt){
			const existingSession = await Session.findOne({
				where: {userId: user.id, active: true},
				order: [ [ 'id', 'DESC' ]],
			})
			if(existingSession && !isExpired(existingSession.updatedAt)){
				existingSession.set('updatedAt', new Date())
				return res.send(existingSession.content)
			}
			else {
				const token = sign({user:user.toJSON(), time: new Date().toISOString()}, process.env.app_key)
				const {content, iv} = encrypt(token)
				await Session.update({active: false}, {where:{userId: user.id, id: { [Op.gt]:0 }} })
				await Session.create({content, iv, active: true, userId: user.id})
				console.log({content})
				return res.send( content )
			}
		}
		else return next(raise({status:422, message:'Invalid credentials'}))
	}
}