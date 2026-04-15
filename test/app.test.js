const request = require('supertest')
const { expect } = require('chai')
const app = require('../app')

// ---------------------------------------------------------------
// TIP: Use AI to help you generate test cases!
// Paste your app.js into your AI tool of choice and ask it to
// write Mocha + Chai + Supertest tests for each route.
// Review what it generates, make sure you understand each test,
// and adjust as needed before running them.
// ---------------------------------------------------------------

// Minimum requirement: at least 6 tests total across all routes.

// ---------------------------------------------------------------
// GET /
// ---------------------------------------------------------------
// Ideas:
//   - Should return status 200
//   - Response body should have a "message" property
//   - Message should include the hotel name

describe('GET /', () => {
  it('should return status 200', async () => {
    const res = await request(app).get('/')

    expect(res.status).to.equal(200)
  })

  it('should return a welcome message for the Grand Azure Hotel API', async () => {
    const res = await request(app).get('/')

    expect(res.body).to.have.property('message')
    expect(res.body.message).to.include('Grand Azure Hotel')
  })
})

// ---------------------------------------------------------------
// GET /rooms
// ---------------------------------------------------------------
// Ideas:
//   - Should return status 200
//   - Should return an array
//   - Should return the correct number of rooms
//   - Each room should have: id, name, type, pricePerNight, available
//   - ?type=suite should return only suite rooms
//   - ?type=deluxe should return only deluxe rooms
//   - ?type=standard should return only standard rooms
//   - Filtering by a type that doesn't exist should return an empty array

describe('GET /rooms', () => {
  it('should return all rooms with status 200', async () => {
    const res = await request(app).get('/rooms')

    expect(res.status).to.equal(200)
    expect(res.body).to.be.an('array')
    expect(res.body).to.have.lengthOf(7)
  })

  it('should return room objects with the expected properties', async () => {
    const res = await request(app).get('/rooms')

    expect(res.body[0]).to.include.keys('id', 'name', 'type', 'pricePerNight', 'available')
  })

  it('should return only suite rooms when filtered with ?type=suite', async () => {
    const res = await request(app).get('/rooms?type=suite')

    expect(res.status).to.equal(200)
    expect(res.body).to.be.an('array').with.lengthOf(3)
    res.body.forEach(room => expect(room.type).to.equal('suite'))
  })

  it('should return an empty array for an unknown room type', async () => {
    const res = await request(app).get('/rooms?type=presidential')

    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal([])
  })
})

// ---------------------------------------------------------------
// GET /rooms/:id
// ---------------------------------------------------------------
// Ideas:
//   - Should return status 200 for a valid id
//   - Should return the correct room name for a given id
//   - Should return status 404 for an id that doesn't exist
//   - 404 response should include an "error" property

describe('GET /rooms/:id', () => {
  it('should return the correct room for a valid id', async () => {
    const res = await request(app).get('/rooms/3')

    expect(res.status).to.equal(200)
    expect(res.body).to.include({
      id: 3,
      name: 'Deluxe King',
      type: 'deluxe',
      pricePerNight: 200,
      available: true
    })
  })

  it('should return status 404 and an error message for an invalid id', async () => {
    const res = await request(app).get('/rooms/999')

    expect(res.status).to.equal(404)
    expect(res.body).to.deep.equal({ error: 'Room not found' })
  })
})

// ---------------------------------------------------------------
// GET /available
// ---------------------------------------------------------------
// Ideas:
//   - Should return status 200
//   - Should return an array
//   - Every room in the response should have available === true
//   - Should not include any unavailable rooms

describe('GET /available', () => {
  it('should return only available rooms', async () => {
    const res = await request(app).get('/available')

    expect(res.status).to.equal(200)
    expect(res.body).to.be.an('array').with.lengthOf(5)
    res.body.forEach(room => expect(room.available).to.equal(true))
  })

  it('should not include unavailable rooms', async () => {
    const res = await request(app).get('/available')
    const roomIds = res.body.map(room => room.id)

    expect(roomIds).to.not.include(2)
    expect(roomIds).to.not.include(5)
  })
})

describe('POST /rooms', () => {
  it('should create a new room and return status 201', async () => {
    const newRoom = {
      name: 'Garden Suite',
      type: 'suite',
      pricePerNight: 450,
      available: true
    }

    const res = await request(app)
      .post('/rooms')
      .send(newRoom)

    expect(res.status).to.equal(201)
    expect(res.body).to.include(newRoom)
    expect(res.body).to.have.property('id')
  })

  it('should add the new room to the rooms list', async () => {
    const newRoom = {
      name: 'City View Deluxe',
      type: 'deluxe',
      pricePerNight: 275,
      available: false
    }

    const postRes = await request(app)
      .post('/rooms')
      .send(newRoom)

    const getRes = await request(app).get('/rooms')

    const addedRoom = getRes.body.find(room => room.id === postRes.body.id)

    expect(addedRoom).to.include({
      name: 'City View Deluxe',
      type: 'deluxe',
      pricePerNight: 275,
      available: false
    })
  })
})

