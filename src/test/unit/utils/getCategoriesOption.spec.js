const getCategoriesOptions = require('~/utils/getCategoriesOption')

describe('getCategoriesOptions', () => {
  it('should return a single category ID as an array', () => {
    expect(getCategoriesOptions('category-id')).toEqual(['category-id'])
  })

  it('should preserve multiple category IDs', () => {
    expect(getCategoriesOptions(['category-id-1', 'category-id-2'])).toEqual(['category-id-1', 'category-id-2'])
  })

  it('should convert a single null category string to null', () => {
    expect(getCategoriesOptions('null')).toEqual([null])
  })

  it('should convert null category strings in an array to null', () => {
    expect(getCategoriesOptions(['category-id', 'null'])).toEqual(['category-id', null])
  })
})
