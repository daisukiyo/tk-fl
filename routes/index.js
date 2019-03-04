const Service = require('../models/service');

module.exports = (app) => {
    app.get('/', (req, res) => {
        Service.find().exec((err, services) => {
            res.render('services-index', { services: services});
        });
    });
}