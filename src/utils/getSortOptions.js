const getSortOptions = (sort) => {
  try {
    const sortOptions = typeof sort === 'string' ? JSON.parse(sort) : sort
    const { order, orderBy } = sortOptions || {}
    return { [orderBy || 'updatedAt']: order || 'asc' }
  } catch {
    return { updatedAt: 'asc' }
  }
}

module.exports = getSortOptions
