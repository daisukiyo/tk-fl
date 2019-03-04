const Service = require('../models/service')
// UPLOADING TO AWS S3
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');

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

}