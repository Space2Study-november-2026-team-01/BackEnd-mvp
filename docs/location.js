/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Location data for user onboarding
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Country:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         name:
 *           type: string
 *           example: India
 *         iso2:
 *           type: string
 *           example: IN
 *         iso3:
 *           type: string
 *           example: IND
 *         phonecode:
 *           type: string
 *           example: '91'
 */

/**
 * @swagger
 * /locations/countries:
 *   get:
 *     summary: Get countries
 *     description: Retrieve the country list used by the authenticated onboarding stepper.
 *     tags: [Locations]
 *     security:
 *       - accessToken: []
 *     responses:
 *       200:
 *         description: Countries successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Country'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: CountryStateCity API key is not configured.
 *       502:
 *         description: The location provider is unavailable or returned an invalid response.
 *       504:
 *         description: The location provider request timed out.
 */
