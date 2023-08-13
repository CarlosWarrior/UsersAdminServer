const {Router} = require('express')
const users = require('./controllers/User')
const {log, _catch} = require('./middleware')
const {authenticated, login} = require('./auth')
const CleanRouter = () => Router().use(async(req,res,next) => next(res.locals=null)).use(log)
const Public = CleanRouter()
	.post('/login', _catch(login))

const App = CleanRouter()
	.get('/', (req, res) => res.send("Admin"))
	.use(_catch(authenticated))
	.use('/users', Router()
		.get('/', _catch(users.list))
		.post('/', _catch(users.create))
		.delete('/', _catch(users.delete))
	)

module.exports = {App, Public}