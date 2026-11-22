/**
 * @swagger
 * components:
 *   schemas:
 *     Lesson:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - content
 *         - author
 *       properties:
 *         _id:
 *           type: string
 *           description: Lesson MongoDB ObjectId.
 *           example: 65f123456789012345678901
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: Introduction to algebra
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 1000
 *           example: Learn the fundamentals of algebra and solve simple equations.
 *         content:
 *           type: string
 *           minLength: 50
 *           example: This lesson introduces variables, expressions, and basic algebraic equations.
 *         author:
 *           type: string
 *           description: MongoDB ObjectId of the User who authored the lesson.
 *           example: 65f123456789012345678902
 *         category:
 *           type: string
 *           nullable: true
 *           default: null
 *           description: MongoDB ObjectId of the ResourcesCategory, or null when uncategorized.
 *           example: 65f123456789012345678903
 *         resourceType:
 *           type: string
 *           enum:
 *             - lessons
 *             - attachments
 *             - questions
 *             - quizzes
 *           default: lessons
 *           example: lessons
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: '2026-01-15T10:30:00.000Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: '2026-01-15T10:30:00.000Z'
 */
