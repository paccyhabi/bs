const userController = require('../controller/userController')
const router = require('express').Router()
router.post('/ussd', userController.addUssd)
module.exports = router