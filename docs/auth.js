/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and password management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SignupRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - role
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 1
 *           maxLength: 30
 *           example: John
 *         lastName:
 *           type: string
 *           minLength: 1
 *           maxLength: 30
 *           example: Smith
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [student, tutor, admin, superadmin]
 *           example: student
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 25
 *           description: Must contain at least one digit and one letter.
 *           example: password123
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: john@example.com
 *         password:
 *           type: string
 *           example: password123
 *
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 25
 *           description: Must contain at least one digit and one letter.
 *           example: newPassword123
 *
 *     SignupResponse:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           example: 65f1a2b3c4d5e6f789012345
 *         userEmail:
 *           type: string
 *           example: john@example.com
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT access token. The refresh token is stored in an HTTP-only cookie.
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 400
 *         code:
 *           type: string
 *           example: BAD_REFRESH_TOKEN
 *         message:
 *           type: string
 *           example: Invalid refresh token
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User successfully registered. Email confirmation is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupResponse'
 *       409:
 *         description: User with this email already exists.
 *       422:
 *         description: Request validation failed.
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successfully authenticated. Access and refresh tokens are set in HTTP-only cookies. The access token is also returned in the response body.
 *         headers:
 *           Set-Cookie:
 *             description: Sets accessToken and refreshToken cookies.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Incorrect credentials or email is not confirmed.
 *       422:
 *         description: Request validation failed.
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out
 *     tags: [Auth]
 *     security:
 *       - refreshToken: []
 *     responses:
 *       204:
 *         description: Successfully logged out. Authentication cookies are cleared.
 *       400:
 *         description: Invalid refresh token.
 */

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Refresh authentication tokens
 *     tags: [Auth]
 *     security:
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Tokens successfully refreshed. New access and refresh cookies are set. Access token is also returned in the response body.
 *         headers:
 *           Set-Cookie:
 *             description: Sets new accessToken and refreshToken cookies.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid or expired refresh token.
 *       401:
 *         description: Refresh token cookie is missing.
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       204:
 *         description: Password reset email successfully sent.
 *       404:
 *         description: User not found.
 *       422:
 *         description: Request validation failed.
 */

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   patch:
 *     summary: Reset password
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset JWT received by email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       204:
 *         description: Password successfully updated.
 *       400:
 *         description: Invalid or expired reset token.
 *       422:
 *         description: Request validation failed.
 */
