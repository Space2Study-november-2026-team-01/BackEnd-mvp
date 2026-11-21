/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryAppearance:
 *       type: object
 *       description: Visual appearance of a category.
 *       required:
 *         - icon
 *         - color
 *       properties:
 *         icon:
 *           type: string
 *           description: Path to the category icon.
 *           default: mocked-path-to-icon
 *           example: path/to/icon.svg
 *         color:
 *           type: string
 *           description: Color of the category icon.
 *           default: '#66C42C'
 *           example: '#66C42C'
 *
 *     Category:
 *       type: object
 *       description: Category model. The name is required and must be unique.
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f123456789012345678901
 *         name:
 *           type: string
 *           description: Unique category name.
 *           example: Mathematics
 *         appearance:
 *           $ref: '#/components/schemas/CategoryAppearance'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
