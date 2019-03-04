const Service = require('../models/service');

module.exports = (app) => {

  /* GET home page. */
  app.get('/', (req, res) => {
    const page = req.query.page || 1

    Service.paginate({}, {page: page}).then((results) => {
        if (req.header('content-type') == 'application/json') {
            return res.json({ services: services, categories: categories });
        } else {
            return res.render('services-index', { services: results.docs, pagesCount: results.pages, currentPage: page });
        }

    });
  });
}