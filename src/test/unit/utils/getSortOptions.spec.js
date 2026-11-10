const getSortOptions = require('~/utils/getSortOptions')

describe('getSortOptions', () => {
  it('should parse an object with ascending order', () => {
    expect(getSortOptions({ order: 'asc', orderBy: 'updatedAt' })).toEqual({
      updatedAt: 'asc'
    })
  })

  it('should parse an object with descending order', () => {
    expect(getSortOptions({ order: 'desc', orderBy: 'updatedAt' })).toEqual({
      updatedAt: 'desc'
    })
  })

  it('should parse a JSON string', () => {
    expect(getSortOptions(JSON.stringify({ order: 'desc', orderBy: 'updatedAt' }))).toEqual({ updatedAt: 'desc' })
  })

  it('should use the default sort when input is missing', () => {
    expect(getSortOptions()).toEqual({ updatedAt: 'asc' })
  })

  it('should use default values when sort fields are missing', () => {
    expect(getSortOptions({})).toEqual({ updatedAt: 'asc' })
  })
})
