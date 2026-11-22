const mongoose = require('mongoose')
const Lesson = require('~/models/lesson')
const {
  enums: { RESOURCES_TYPES_ENUM }
} = require('~/consts/validation')
const { LESSON, USER, RESOURCES_CATEGORY } = require('~/consts/models')

const createLesson = (overrides = {}) =>
  new Lesson({
    title: 'Algebra',
    description: 'Introduction to algebra',
    content: 'This lesson introduces variables, expressions, and basic equations.',
    author: new mongoose.Types.ObjectId(),
    ...overrides
  })

describe('Lesson model', () => {
  it('should register the Lesson model and use the expected references', () => {
    expect(Lesson.modelName).toBe(LESSON)
    expect(Lesson.schema.path('author').instance).toBe('ObjectID')
    expect(Lesson.schema.path('author').options.ref).toBe(USER)
    expect(Lesson.schema.path('category').instance).toBe('ObjectID')
    expect(Lesson.schema.path('category').options.ref).toBe(RESOURCES_CATEGORY)
  })

  it('should require title, description, content, and author', () => {
    const error = new Lesson().validateSync()

    expect(error.errors.title).toBeDefined()
    expect(error.errors.description).toBeDefined()
    expect(error.errors.content).toBeDefined()
    expect(error.errors.author).toBeDefined()
  })

  it('should accept title and description at their length boundaries and content at its minimum', () => {
    const lesson = createLesson({
      title: 'T',
      description: 'D'.repeat(1000),
      content: 'C'.repeat(50)
    })

    expect(lesson.validateSync()).toBeUndefined()
    expect(createLesson({ title: 'T'.repeat(100) }).validateSync()).toBeUndefined()
  })

  it('should reject title and description outside their length boundaries', () => {
    const error = createLesson({
      title: 'T'.repeat(101),
      description: 'D'.repeat(1001)
    }).validateSync()

    expect(error.errors.title).toBeDefined()
    expect(error.errors.description).toBeDefined()
    expect(createLesson({ title: '' }).validateSync().errors.title).toBeDefined()
    expect(createLesson({ description: '' }).validateSync().errors.description).toBeDefined()
  })

  it('should reject content shorter than 50 characters', () => {
    const error = createLesson({ content: 'C'.repeat(49) }).validateSync()

    expect(error.errors.content).toBeDefined()
  })

  it('should cast author and category IDs to ObjectIds', () => {
    const author = new mongoose.Types.ObjectId()
    const category = new mongoose.Types.ObjectId()
    const lesson = createLesson({ author: author.toString(), category: category.toString() })

    expect(lesson.author).toBeInstanceOf(mongoose.Types.ObjectId)
    expect(lesson.category).toBeInstanceOf(mongoose.Types.ObjectId)
  })

  it('should validate resource types and apply category and resource type defaults', () => {
    const lesson = createLesson()

    expect(lesson.category).toBeNull()
    expect(lesson.resourceType).toBe('lessons')
    expect(lesson.validateSync()).toBeUndefined()
    expect(createLesson({ resourceType: 'Lesson' }).validateSync().errors.resourceType).toBeDefined()
    expect(createLesson({ resourceType: 'lessons' }).validateSync()).toBeUndefined()
    expect(RESOURCES_TYPES_ENUM[0]).toBe('lessons')
  })
})
