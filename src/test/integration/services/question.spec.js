const mongoose = require('mongoose')
const databaseInitialization = require('~/initialization/database')
const { serverCleanup } = require('~/test/setup')
const Question = require('~/models/question')
const ResourcesCategory = require('~/models/resourcesCategory')
const questionService = require('~/services/question')

const createQuestionData = (author, overrides = {}) => ({
  title: 'Question title',
  text: 'Question text',
  answers: [{ text: 'Answer', isCorrect: true }],
  type: 'multipleChoice',
  author,
  ...overrides
})

describe('Question service', () => {
  beforeAll(async () => {
    await databaseInitialization()
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe('getQuestions', () => {
    it('should filter, sort and paginate questions while returning the total count and populated categories', async () => {
      const author = new mongoose.Types.ObjectId()
      const category = await ResourcesCategory.create({ name: 'Category', author })
      await Question.create([
        createQuestionData(author, { title: 'apple', category: category._id }),
        createQuestionData(author, { title: 'Banana', category: category._id }),
        createQuestionData(author, { title: 'cherry', category: category._id }),
        createQuestionData(author, { title: 'Other type', type: 'openAnswer', category: category._id })
      ])

      const result = await questionService.getQuestions({ type: 'multipleChoice' }, { title: 1 }, 1, 1)

      expect(result.count).toBe(3)
      expect(result.items).toHaveLength(1)
      expect(result.items[0].title).toBe('Banana')
      expect(result.items[0].category).toMatchObject({
        _id: category._id,
        name: category.name
      })
      expect(result.items[0].category.author).toBeUndefined()
    })
  })

  describe('getQuestionById', () => {
    it('should return the matching question as a lean document', async () => {
      const author = new mongoose.Types.ObjectId()
      const question = await Question.create(createQuestionData(author))

      const result = await questionService.getQuestionById(question._id)

      expect(result).toMatchObject({
        _id: question._id,
        title: question.title,
        author
      })
      expect(result.save).toBeUndefined()
    })

    it('should return null when the question does not exist', async () => {
      const missingId = new mongoose.Types.ObjectId()

      await expect(questionService.getQuestionById(missingId)).resolves.toBeNull()
    })
  })

  describe('createQuestion', () => {
    it('should persist the question and return its populated category', async () => {
      const author = new mongoose.Types.ObjectId()
      const category = await ResourcesCategory.create({ name: 'Category', author })

      const result = await questionService.createQuestion(
        author,
        createQuestionData(author, { category: category._id })
      )
      const savedQuestion = await Question.findById(result._id).lean().exec()

      expect(savedQuestion).toMatchObject({
        title: 'Question title',
        text: 'Question text',
        type: 'multipleChoice',
        author,
        category: category._id
      })
      expect(result.category).toMatchObject({
        _id: category._id,
        name: category.name
      })
    })
  })

  describe('updateQuestion', () => {
    it('should persist changes and return the populated updated category for the author', async () => {
      const author = new mongoose.Types.ObjectId()
      const originalCategory = await ResourcesCategory.create({ name: 'Original', author })
      const updatedCategory = await ResourcesCategory.create({ name: 'Updated', author })
      const question = await Question.create(createQuestionData(author, { category: originalCategory._id }))

      const result = await questionService.updateQuestion(question._id, author.toString(), {
        title: 'Updated question',
        category: updatedCategory._id
      })
      const savedQuestion = await Question.findById(question._id).lean().exec()

      expect(savedQuestion.title).toBe('Updated question')
      expect(savedQuestion.category).toEqual(updatedCategory._id)
      expect(result.category).toMatchObject({
        _id: updatedCategory._id,
        name: updatedCategory.name
      })
    })

    it('should reject updates from a different user without changing the question', async () => {
      const author = new mongoose.Types.ObjectId()
      const question = await Question.create(createQuestionData(author))

      await expect(
        questionService.updateQuestion(question._id, new mongoose.Types.ObjectId().toString(), {
          title: 'Unauthorized update'
        })
      ).rejects.toMatchObject({ status: 403 })

      const savedQuestion = await Question.findById(question._id).lean().exec()
      expect(savedQuestion.title).toBe('Question title')
    })
  })

  describe('deleteQuestion', () => {
    it('should delete the question when called by its author', async () => {
      const author = new mongoose.Types.ObjectId()
      const question = await Question.create(createQuestionData(author))

      await questionService.deleteQuestion(question._id, author.toString())

      await expect(Question.findById(question._id).exec()).resolves.toBeNull()
    })

    it('should reject deletion by a different user and leave the question intact', async () => {
      const author = new mongoose.Types.ObjectId()
      const question = await Question.create(createQuestionData(author))

      await expect(
        questionService.deleteQuestion(question._id, new mongoose.Types.ObjectId().toString())
      ).rejects.toMatchObject({ status: 403 })

      await expect(Question.findById(question._id).exec()).resolves.not.toBeNull()
    })
  })
})
