const Service = require('../models/service')

module.exports = (app) => {

    // new service
    app.get('/services/new', (req, res) => {
        res.render('services-new');
    });

    // create service
    app.post('/services', (req, res) => {
        var service = new Service(req.body);

        service.save()
            .then((service) => {
                res.send({ service:service });
            })
            .catch((err) => {
                console.log(err);
                res.status(400).send(err.errors);
            });
    });

    // show service
    app.get('/services/:id', (req, res) => {
        Service.findById(req.params.id).exec((err, service) => {
            res.render('services-show', { service });
        });
    });

    // edit service
    app.get('/services/:id/edit', (req, res) => {
        Service.findById(req.params.id).exec((err, service) => {
            res.render('services-edit', { service });
        });
    });

    // update service
    app.put('/services/:id', (req, res) => {
        Service.findByIdAndUpdate(req.params.id, req.body)
            .then((service) => {
                res.redirect(`/services/${service._id}`)
            })
            .catch((err) => {
                // insert error handling
            });
    });

    // delete service
    app.delete('/services/:id', (req, res) => {
        Service.findByIdAndRemove(req.params.id).exec((err, service) => {
            return res.redirect('/')
        });
    });

    // search service
    app.get('/search', (req, res) => {
        const term = new RegExp(req.query.term, 'i')
        const page = req.query.page || 1
        Service.paginate(
          {
            $or: [
              { 'title': term },
              { 'duration': term }
            ]
          },
          { page: page }).then((results) => {
            res.render('services-index', { services: results.docs, pagesCount: results.pages, currentPage: page, term: req.query.term });
          });
      });

}