# Movie Reviews API (CSCI 3916 HW4)

This project is a Node.js and Express REST API backed by MongoDB that manages users, movies, and movie reviews. It uses JWT authentication so users can sign up, sign in, and then access protected endpoints to create and manage movie data. Reviews are stored in a separate lowercase `reviews` collection and linked to movies by `movieId`, which keeps entities normalized while still allowing joined responses when needed.

The API supports returning movie data by itself or, when `reviews=true` is passed on movie routes, returning movies with their associated reviews via MongoDB `$lookup` aggregation. Review creation is protected and automatically records the authenticated username as the reviewer. On success, review creation responds with `201` and `{ "message": "Review created!" }`.

The project also includes analytics tracking for review activity. When a review is submitted, the server sends an event payload with category, action, label, value, and custom fields for movie name and request count. A `/test` endpoint is included to emit a sample analytics event for validation.

## Quick Start

Install dependencies and run the API:

```bash
npm install
node server.js
```

The server runs at `https://csci-3916-hw4.onrender.com`.

Create a `.env` file in the project root with your database and auth configuration:

```dotenv
DB=<mongodb connection string>
MONGODB_URI=<mongodb connection string>
SECRET_KEY=<jwt secret>
GA_KEY=<ga measurement id or ua tracking id>
GA_SECRET=<ga4 api secret>
```

To use protected routes, sign in and send the token as:

```text
Authorization: JWT <token>
```

## Endpoint Summary

Authentication is handled through `/signup` and `/signin`. Movie endpoints are available at `/movies` and `/movies/:movieparameter`, with optional review aggregation through `?reviews=true`. Review endpoints are available at `/reviews`, including filtered reads by `movieId` and JWT-protected review creation. The `/test` endpoint is provided for analytics verification.

## Testing

Run the test suite with:

```bash
npm test
```

## Review Collection Migration

The backend uses one review model file (`Review.js`) with an explicit collection binding to lowercase `reviews`.

To migrate old data from `Review` or `review` into `reviews`:

```bash
npm run migrate:review-collection
```

After validating counts, drop the old collection with:

```bash
npm run migrate:review-collection:drop
```

Equivalent `mongosh` commands:

```javascript
db.Review.aggregate([
	{ $match: {} },
	{
		$merge: {
			into: 'reviews',
			on: '_id',
			whenMatched: 'keepExisting',
			whenNotMatched: 'insert'
		}
	}
]);

db.Review.countDocuments();
db.review.countDocuments();
db.reviews.countDocuments();
db.Review.drop();
db.review.drop();
```

This project demonstrates secure API design, normalized MongoDB modeling, aggregation of related entities, and analytics instrumentation in a single backend service.
