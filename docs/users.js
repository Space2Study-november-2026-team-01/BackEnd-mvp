/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserAddress:
 *       type: object
 *       properties:
 *         country:
 *           type: string
 *           example: Ukraine
 *         city:
 *           type: string
 *           example: Kyiv
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *         role:
 *           type: array
 *           items:
 *             type: string
 *             enum: [student, tutor, admin, superadmin]
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Smith
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         address:
 *           $ref: '#/components/schemas/UserAddress'
 *         photo:
 *           type: string
 *           example: https://example.com/photo.jpg
 *         professionalSummary:
 *           type: string
 *         mainSubjects:
 *           type: object
 *           properties:
 *             student:
 *               type: array
 *               items:
 *                 type: string
 *             tutor:
 *               type: array
 *               items:
 *                 type: string
 *         nativeLanguage:
 *           type: string
 *           enum: [English, Ukrainian, Polish, German, French, Spanish, Arabic]
 *         appLanguage:
 *           type: string
 *           enum: [en, ua]
 *         isEmailConfirmed:
 *           type: boolean
 *         isFirstLogin:
 *           type: boolean
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         lastLoginAs:
 *           type: string
 *           enum: [student, tutor, admin]
 *         status:
 *           type: object
 *           properties:
 *             student:
 *               type: string
 *               enum: [active, blocked]
 *             tutor:
 *               type: string
 *               enum: [active, blocked]
 *             admin:
 *               type: string
 *               enum: [active, blocked]
 *         totalReviews:
 *           type: object
 *           properties:
 *             student:
 *               type: integer
 *             tutor:
 *               type: integer
 *         averageRating:
 *           type: object
 *           properties:
 *             student:
 *               type: number
 *             tutor:
 *               type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     UsersResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         count:
 *           type: integer
 *           example: 25
 *
 *     UpdateUserRequest:
 *       type: object
 *       description: Only the fields listed below can be updated.
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Smith
 *         photo:
 *           type: string
 *           example: https://example.com/photo.jpg
 *         address:
 *           $ref: '#/components/schemas/UserAddress'
 *         professionalSummary:
 *           type: string
 *           example: Experienced mathematics tutor
 *         mainSubjects:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of subject IDs for the current user role.
 *         nativeLanguage:
 *           type: string
 *           enum: [English, Ukrainian, Polish, German, French, Spanish, Arabic]
 *         appLanguage:
 *           type: string
 *           enum: [en, ua]
 *         FAQ:
 *           type: object
 *           properties:
 *             student:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FAQItem'
 *             tutor:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FAQItem'
 *
 *     FAQItem:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           example: What subjects do you teach?
 *         answer:
 *           type: string
 *           example: Mathematics and physics.
 *
 *     UpdateUserStatusRequest:
 *       type: object
 *       description: Status values can be provided for one or more roles.
 *       minProperties: 1
 *       properties:
 *         student:
 *           type: string
 *           enum: [active, blocked]
 *         tutor:
 *           type: string
 *           enum: [active, blocked]
 *         admin:
 *           type: string
 *           enum: [active, blocked]
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users
 *     description: Retrieve a filtered and paginated list of users. Requires authentication.
 *     tags: [Users]
 *     security:
 *       - accessToken: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by first name and last name.
 *         example: John Smith
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter users by email.
 *         example: john@example.com
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, tutor, admin, superadmin]
 *         description: Filter by user role.
 *       - in: query
 *         name: isEmailConfirmed
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter by email confirmation status.
 *       - in: query
 *         name: isFirstLogin
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter by first login status.
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [active, blocked]
 *         style: form
 *         explode: true
 *         description: Filter by one or more user statuses. Requires role.
 *       - in: query
 *         name: lastLogin
 *         schema:
 *           type: string
 *         description: JSON string containing optional from and to dates.
 *         example: '{"from":"2026-01-01","to":"2026-12-31"}'
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: JSON string containing orderBy and order (asc or desc).
 *         example: '{"orderBy":"name","order":"asc"}'
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of users to skip.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of users to return.
 *     responses:
 *       200:
 *         description: Users successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersResponse'
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - accessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId.
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, tutor, admin, superadmin]
 *         description: Optional role filter.
 *     responses:
 *       200:
 *         description: User successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *
 *   patch:
 *     summary: Update user profile
 *     description: Users can update only their own profile.
 *     tags: [Users]
 *     security:
 *       - accessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       204:
 *         description: User profile successfully updated.
 *       400:
 *         description: Invalid user ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: User can only update their own profile.
 *       404:
 *         description: User not found.
 *
 *   delete:
 *     summary: Delete user
 *     description: Only administrators can delete users.
 *     tags: [Users]
 *     security:
 *       - accessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId.
 *     responses:
 *       204:
 *         description: User successfully deleted.
 *       400:
 *         description: Invalid user ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Administrator access required.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /users/{id}/change-status:
 *   patch:
 *     summary: Change user status
 *     description: Only administrators can change user status.
 *     tags: [Users]
 *     security:
 *       - accessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserStatusRequest'
 *     responses:
 *       204:
 *         description: User status successfully updated.
 *       400:
 *         description: Invalid user ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Administrator access required.
 *       404:
 *         description: User not found.
 */
