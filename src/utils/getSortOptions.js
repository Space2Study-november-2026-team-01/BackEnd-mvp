const getSortOptions = (sort) => {
  try {
    const { order, orderBy } = JSON.parse(sort)
    return { [orderBy || 'updatedAt']: order || 'asc' }
  } catch {
    return { updatedAt: 'asc' }
  }
}

module.exports = getSortOptions
