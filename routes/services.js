const Service = require('../models/service')
// UPLOADING TO AWS S3
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const auth = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.EMAIL_DOMAIN
    }
}

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

const client = new Upload(process.env.S3_BUCKET, {
    aws: {
      path: 'services/avatar',
      region: process.env.S3_REGION,
      acl: 'public-read',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    cleanup: {
      versions: true,
      original: true
    },
    versions: [{
      maxWidth: 400,
      aspect: '16:10',
      suffix: '-standard'
    },{
      maxWidth: 300,
      aspect: '1:1',
      suffix: '-square'
    }]
  });
    
module.exports = (app) => {

    // new service
    app.get('/services/new', (req, res) => {
        res.render('services-new');
    });

    // create service
    app.post('/services', upload.single('avatar'), (req, res, next) => {
        var service = new Service(req.body);
        service.save(function (err) {
            if (req.file) {
                client.upload(req.file.path, {}, function (err, versions, meta) {
                    if (err) { return res.status(400).send({ err: err}) };

                    versions.forEach(function(image) {
                        var urlArray = image.url.split('-');
                        urlArray.pop();
                        var url = urlArray.join('-');
                        service.avatarUrl = url;
                        service.save();
                    });
                    res.send({service:service});
                });
            } else {
                res.send({service:service});
            }
        })
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

    // purchase route
    app.post('/services/:id/purchase', (req,res) => {
        console.log(req.body);
        var stripe = require("stripe")(process.env.PRIVATE_STRIPE_API_KEY);
        const token = req.body.stripeToken;

        let serviceId = req.body.serviceId || req.params.id;

        Service.findById(serviceId).exec((err, service) => {
            if(err) {
                console.log('Error: ' + err);
                res.redirect(`/services/${req.params.id}`);
            }
            const charge = stripe.charges.create({
                amount: service.price * 100,
                currency: 'usd',
                description: `Service Purcahsed: ${service.title}`,
                source: token,
            }).then((chg) => {
                const user = {
                    email: req.body.stripeEmail,
                    amount: chg.amount / 100,
                    serviceTitle: service.title,
                    servieDuration: service.duration
                };
                nodemailerMailgun.sendMail({
                    from: 'no-reply@tk-fl.com',
                    to: user.email,
                    subject: 'Service Purchased!',
                    template: {
                        name: 'email.handlebars',
                        engine: 'handlebars',
                        context: user
                    }
                }).then(info => {
                    console.log('Response: ' + info);
                    res.redirect(`/services/${req.params.id}`);
                }).catch(err => {
                    console.log('Error: ' + err);
                    res.redirect(`/services/${req.params.id}`);
                });
            })
            .catch(err => {
                console.log('Error: ' + err);
            });
        })
    });
}

