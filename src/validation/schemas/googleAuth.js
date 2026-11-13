const googleAuthValidationSchema = {
  token: {
    required: true,
    type: 'string'
  },
  role: {
    required: false,
    type: 'string',
    enum: ['student', 'tutor']
  }
}

module.exports = googleAuthValidationSchema
