require('~/initialization/envSetup')

const mongoose = require('mongoose')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const offerService = require('~/services/offer')
const Offer = require('~/models/offer')
const User = require('~/models/user')

describe('Offer service', () => {
  let server

  beforeAll(async () => {
    ;({ server } = await serverInit())
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe('createOffer', () => {
    it('should create new offer', async () => {
      const authorData = {
        role: ['tutor'],
        firstName: 'Test',
        lastName: 'Author',
        email: 'test.author@gmail.com',
        password: 'testpass_135'
      }

      const author = await User.create(authorData)
      const offerData = {
        price: 100,
        proficiencyLevel: 'Advanced',
        title: 'English lessons',
        description: 'English lessons for beginners',
        languages: ['English', 'Ukrainian'],
        status: 'active',
        FAQ: [
          {
            question: 'How are lessons conducted?',
            answer: 'Online'
          }
        ]
      }
      const result = await offerService.createOffer(author._id, 'tutor', offerData)

      const savedOffer = await Offer.findById(result._id).lean()

      expect(result).toMatchObject({
        author: author._id,
        authorRole: 'tutor',
        price: offerData.price,
        proficiencyLevel: offerData.proficiencyLevel,
        title: offerData.title,
        description: offerData.description,
        languages: offerData.languages,
        status: offerData.status
      })

      expect(savedOffer).toBeTruthy()

      expect(savedOffer).toMatchObject({
        author: author._id,
        authorRole: 'tutor',
        price: offerData.price,
        title: offerData.title,
        description: offerData.description
      })
    })
  })

  describe('getOffers', () => {
    it('should get all offers', async () => {
      const author = await User.create({
        role: ['tutor'],
        firstName: 'Test',
        lastName: 'Author',
        email: 'test.author@gmail.com',
        password: 'testpass_135'
      })

      const offer = await offerService.createOffer(author._id, 'tutor', {
        title: 'English lessons',
        price: 100
      })

      const result = await offerService.getOffers([{ $match: {} }])

      expect(result._id.toString()).toBe(offer._id.toString())
      expect(result.title).toBe('English lessons')
    })
  })

  describe('getOfferById', () => {
    it('should get an offer by ID', async () => {
      const author = await User.create({
        role: ['tutor'],
        firstName: 'Test',
        lastName: 'Author',
        email: 'test.author@gmail.com',
        password: 'testpass_135'
      })

      const offer = await offerService.createOffer(author._id, 'tutor', {
        title: 'English lessons',
        price: 100
      })

      const result = await offerService.getOfferById(offer._id)

      expect(result).toBeDefined()
      expect(result._id.toString()).toBe(offer._id.toString())
      expect(result.title).toBe('English lessons')
      expect(result.author.firstName).toBe('Test')
      expect(result.author.lastName).toBe('Author')
    })

    it('should throw Document not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId()

      await expect(offerService.getOfferById(nonExistentId)).rejects.toMatchObject({
        code: 'DOCUMENT_NOT_FOUND'
      })
    })
  })

  describe('deleteOffer', () => {
    it('should delete offer by ID', async () => {
      const author = await User.create({
        role: ['tutor'],
        firstName: 'Test',
        lastName: 'Author',
        email: 'test.author@gmail.com',
        password: 'testpass_135'
      })

      const offer = await offerService.createOffer(author._id, 'tutor', {
        title: 'English lessons',
        price: 100
      })

      await offerService.deleteOffer(offer._id)

      const deletedOffer = await Offer.findById(offer._id)

      expect(deletedOffer).toBeNull()
    })
  })
})
