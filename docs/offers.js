/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: API for managing and searching offers
 */

/**
 * @swagger
 * /offers:
 *   get:
 *     summary: Get offers
 *     description: Retrieve a list of offers with filtering, sorting and pagination.
 *     tags: [Offers]
 *     security:
 *       - accessToken: []
 *     parameters:
 *       - in: query
 *         name: authorRole
 *         schema:
 *           type: string
 *           enum: [student, tutor]
 *         description: Filter offers by the author's role.
 *
 *       - in: query
 *         name: price
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *           minItems: 2
 *           maxItems: 2
 *         style: form
 *         explode: false
 *         example: 100,500
 *         description: Filter offers by a price range (minimum and maximum).
 *
 *       - in: query
 *         name: proficiencyLevel
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [Beginner, Intermediate, Advanced, Test Preparation, Professional, Specialized]
 *         style: form
 *         explode: false
 *         description: Filter offers by proficiency level.
 *
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Minimum author rating. Used together with authorRole.
 *
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter offers by language.
 *
 *       - in: query
 *         name: languages
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Filter offers by a list of languages.
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search offers by title or author's first and last name.
 *
 *       - in: query
 *         name: nativeLanguage
 *         schema:
 *           type: string
 *         description: Filter offers by author's native language.
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, draft, closed]
 *         description: Filter offers by status.
 *
 *       - in: query
 *         name: excludedOfferId
 *         schema:
 *           type: string
 *         description: Exclude an offer with the specified ID.
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         example: '{"orderBy":"price","order":"asc"}'
 *         description: Sort offers. Supports priceAsc, priceDesc, rating or a JSON object with orderBy and order.
 *
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of offers to skip.
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of offers to return.
 *
 *     responses:
 *       200:
 *         description: Offers retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 12
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 672a1b2c3d4e5f6789012345
 *                       title:
 *                         type: string
 *                         example: English lessons for beginners
 *                       description:
 *                         type: string
 *                         example: Individual English lessons.
 *                       price:
 *                         type: number
 *                         example: 25
 *                       proficiencyLevel:
 *                         type: string
 *                         example: Beginner
 *                       languages:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: [English, Ukrainian]
 *                       authorRole:
 *                         type: string
 *                         enum: [student, tutor]
 *                       status:
 *                         type: string
 *                         enum: [active, draft, closed]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       author:
 *                         type: object
 *                         description: Offer author's public information.
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           photo:
 *                             type: string
 *                           averageRating:
 *                             type: object
 *                           totalReviews:
 *                             type: integer
 *       401:
 *         description: Unauthorized. Authentication is required.
 */
