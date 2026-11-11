/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: API for managing questions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     QuestionAnswer:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           minLength: 1
 *           maxLength: 150
 *           example: Answer text
 *         isCorrect:
 *           type: boolean
 *           default: false
 *           example: true
 *
 *     QuestionCategory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f123456789012345678901
 *         name:
 *           type: string
 *           example: Mathematics
 *
 *     QuestionBase:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f123456789012345678901
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Basic algebra
 *         text:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: What is 2 + 2?
 *         answers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestionAnswer'
 *         type:
 *           type: string
 *           enum:
 *             - multipleChoice
 *             - openAnswer
 *             - oneAnswer
 *           example: multipleChoice
 *         author:
 *           type: string
 *           example: 65f123456789012345678902
 *         resourceType:
 *           type: string
 *           description: Resource type. Defaults to the third value in RESOURCES_TYPES_ENUM.
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Question:
 *       allOf:
 *         - $ref: '#/components/schemas/QuestionBase'
 *         - type: object
 *           properties:
 *             category:
 *               type: string
 *               nullable: true
 *               description: ID of the resource category.
 *               example: 65f123456789012345678903
 *
 *     QuestionWithCategory:
 *       allOf:
 *         - $ref: '#/components/schemas/QuestionBase'
 *         - type: object
 *           properties:
 *             category:
 *               type: object
 *               nullable: true
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 65f123456789012345678903
 *                 name:
 *                   type: string
 *                   example: Mathematics
 *
 *     CreateQuestionRequest:
 *       type: object
 *       required:
 *         - title
 *         - text
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Basic algebra
 *         text:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: What is 2 + 2?
 *         answers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestionAnswer'
 *         type:
 *           type: string
 *           enum:
 *             - multipleChoice
 *             - openAnswer
 *             - oneAnswer
 *           example: multipleChoice
 *         category:
 *           type: string
 *           nullable: true
 *           description: Resource category ID. Can be null.
 *           example: 65f123456789012345678903
 *
 *     UpdateQuestionRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Updated question title
 *         text:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Updated question text
 *         answers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestionAnswer'
 *         type:
 *           type: string
 *           enum:
 *             - multipleChoice
 *             - openAnswer
 *             - oneAnswer
 *         category:
 *           type: string
 *           nullable: true
 *           description: Resource category ID. Can be null.
 *
 *     QuestionsListResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestionWithCategory'
 *         count:
 *           type: integer
 *           example: 10
 */

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get questions
 *     description: Retrieve questions created by the authenticated user.
 *     tags: [Questions]
 *     security:
 *       - accessToken: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Search questions by title (case-insensitive).
 *
 *       - in: query
 *         name: categories
 *         style: form
 *         explode: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by category IDs. Use the string "null" to find questions without a category.
 *         example:
 *           - 65f123456789012345678903
 *           - null
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         example: '{"orderBy":"createdAt","order":"desc"}'
 *         description: JSON string with orderBy and order. Defaults to updatedAt ascending.
 *
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of records to skip.
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of records to return.
 *
 *     responses:
 *       200:
 *         description: Questions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionsListResponse'
 *       401:
 *         description: Unauthorized. Authentication is required.
 *
 *   post:
 *     summary: Create a question
 *     description: Create a question as the authenticated tutor. The author is assigned automatically.
 *     tags: [Questions]
 *     security:
 *       - accessToken: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionRequest'
 *     responses:
 *       201:
 *         description: Question created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionWithCategory'
 *       401:
 *         description: Unauthorized. Authentication is required.
 *       403:
 *         description: Forbidden. Only tutors can create questions.
 *
 * /questions/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Question ID.
 *
 *   get:
 *     summary: Get a question by ID
 *     description: Retrieve a question by its ID.
 *     tags: [Questions]
 *     security:
 *       - accessToken: []
 *     responses:
 *       200:
 *         description: Question retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized. Authentication is required.
 *
 *   patch:
 *     summary: Update a question
 *     description: Update a question. Only the tutor who created it can make changes.
 *     tags: [Questions]
 *     security:
 *       - accessToken: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuestionRequest'
 *     responses:
 *       200:
 *         description: Question updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionWithCategory'
 *       401:
 *         description: Unauthorized. Authentication is required.
 *       403:
 *         description: Forbidden. Only the question author can update it, and the user must have the tutor role.
 *
 *   delete:
 *     summary: Delete a question
 *     description: Delete a question. Only the tutor who created it can delete it.
 *     tags: [Questions]
 *     security:
 *       - accessToken: []
 *     responses:
 *       204:
 *         description: Question deleted successfully. No response body.
 *       401:
 *         description: Unauthorized. Authentication is required.
 *       403:
 *         description: Forbidden. Only the question author can delete it, and the user must have the tutor role.
 */
