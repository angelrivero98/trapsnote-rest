const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Tarea} = require('./../models/tarea');

const tareas = [{
  _id: new ObjectID(),
  descripcion: "texto"
}, {
  _id: new ObjectID(),
  descripcion: "texto2"
}];

beforeEach((done) => {
  Tarea.remove({}).then(() => {
    return Tarea.insertMany(tareas);
  }).then(() => done());
});

describe('POST /tareas', () => {
  it('debe crear nueva tarea', (done) => {
    var descripcion = "Prueba para descripcion";

    request(app)
      .post('/tareas')
      .send({descripcion})
      .expect(200)
      .expect((res) => {
        expect(res.body.descripcion).toBe(descripcion);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Tarea.find({descripcion}).then((tareas) => {
          expect(tareas.length).toBe(1);
          expect(tareas[0].descripcion).toBe(descripcion);
          done();
        }).catch((err) => done(err));
      });
  });

  it('no debe crear nueva tarea con datos inválidos', (done) => {
    request(app)
      .post('/tareas')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Tarea.find().then((tareas) => {
          expect(tareas.length).toBe(2);
          done();
        }).catch((err) => done(err));
      });
  });
});

describe('GET /tareas', () => {
  it('debe mostrar todas las tareas', (done) => {
    request(app)
      .get('/tareas')
      .expect(200)
      .expect((res) => {
        expect(res.body.tareas.length).toBe(2);
      })
      .end(done);
  });
});


describe("GET /tareas/:id", () => {
  it('debe mostrar la tarea', (done) => {
    request(app)
      .get(`/tareas/${tareas[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.tarea.descripcion).toBe(tareas[0].descripcion);
      })
      .end(done);
  })

  it('debe mostrar 404 cuando no existe la tarea', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  })

  it('debe mostrar 404 cuando no se coloca ID válido', (done) => {
    request(app)
      .get('/tareas/123abc')
      .expect(404)
      .end(done);
  })
});
