const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();
const Service = require('../models/service');

const roflcopter =     {
    "title": "Install/Rice Arch Linux",
    "duration": "One Day",
    "description": "I will personally install the latest version of Arch Linux with full driver support and rice your desktop environment to your liking.",
    "picUrl": "https://i.redd.it/f5vu2auetgxz.png",
    "picUrlSq": "https://i.redd.it/f5vu2auetgxz.png"
}

chai.use(chaiHttp);

describe('Services', ()  => {

  after(() => { 
    Service.deleteMany({$or: [{name: 'Install/Rice Arch Linux'}, {name: 'Install/Rice Debian'}] }).exec((err, services) => {
      console.log(services)
      services.remove();
    }) 
  });

  // TEST INDEX
  it('should index ALL services on / GET', (done) => {
    chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.html;
          done();
        });
  });

  // TEST NEW
  it('should display new form on /services/new GET', (done) => {
    chai.request(server)
      .get(`/services/new`)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.html
          done();
        });
  });
  
  // TEST CREATE 
  it('should create a SINGLE service on /services POST', (done) => {
    chai.request(server)
        .post('/services')
        .send(roflcopter)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.html
          done();
        });
  });

  // TEST SHOW
  it('should show a SINGLE service on /services/<id> GET', (done) => {
    var service = new Service(roflcopter);
     service.save((err, data) => {
       chai.request(server)
         .get(`/services/${data._id}`)
         .end((err, res) => {
           res.should.have.status(200);
           res.should.be.html
           done();
         });
     });

  });

  // TEST EDIT
  it('should edit a SINGLE service on /services/<id>/edit GET', (done) => {
    var service = new Service(roflcopter);
     service.save((err, data) => {
       chai.request(server)
         .get(`/services/${data._id}/edit`)
         .end((err, res) => {
           res.should.have.status(200);
           res.should.be.html
           done();
         });
     });
  });


  // TEST UPDATE
  it('should update a SINGLE service on /services/<id> PUT', (done) => {
    var service = new Service(roflcopter);
    service.save((err, data)  => {
     chai.request(server)
      .put(`/services/${data._id}?_method=PUT`)
      .send({'name': 'Install/Rice Debian'})
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.html
        done();
      });
    });
  });

  // TEST DELETE
  it('should delete a SINGLE service on /services/<id> DELETE', (done) => {
    var service = new Service(roflcopter);
    service.save((err, data)  => {
     chai.request(server)
      .delete(`/services/${data._id}?_method=DELETE`)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.html
        done();
      });
    });
  });
});