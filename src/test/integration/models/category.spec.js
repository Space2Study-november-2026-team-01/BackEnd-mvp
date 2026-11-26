const mongoose = require('mongoose')
const databaseInitialization = require('~/initialization/database')
const { serverCleanup } = require('~/test/setup')
const Category = require('~/models/category')

describe('Category model', () => {
  beforeAll(async () => {
    await databaseInitialization()
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('should apply the default appearance values', async () => {
    const category = await Category.create({ name: 'Mathematics' })
    const saved = await Category.findById(category._id).lean().exec()

    expect(saved).toMatchObject({
      name: 'Mathematics',
      appearance: { icon: 'mocked-path-to-icon', color: '#66C42C' }
    })
  })

  it('should persist a custom appearance', async () => {
    const category = await Category.create({
      name: 'Music',
      appearance: { icon: 'path/to/music-icon', color: '#FF0000' }
    })
    const saved = await Category.findById(category._id).lean().exec()

    expect(saved.appearance).toEqual({ icon: 'path/to/music-icon', color: '#FF0000' })
  })

  it('should reject a category without a name', async () => {
    const error = await Category.create({}).catch((err) => err)

    expect(error.name).toBe('ValidationError')
    expect(error.errors.name).toBeDefined()
  })

  it('should reject a duplicate name', async () => {
    await Category.createIndexes()
    await Category.create({ name: 'Physics' })

    await expect(Category.create({ name: 'Physics' })).rejects.toMatchObject({ code: 11000 })
  })
})
