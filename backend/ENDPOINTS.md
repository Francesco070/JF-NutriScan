## Auth (public)

- POST /api/auth/register
    - Register a new account.
- POST /api/auth/login
    - Authenticate and return a JWT.

## Auth (protected)

- GET /api/auth/me
    - Return the current user profile.
- GET /api/auth/stats
    - Return user scan/favorite stats.

## Products (public)

- GET /api/products/"barcode"
    - Fetch product details by barcode.

## Products (protected)

- POST /api/products
    - Create a product record in the database.

Dummy data:

```bash
{
"barcode": "123456789",
"name": "Test Product 1",
"brand": "Test Brand",
"imageUrl": null,
"imageIngredientsUrl": null,
"imageNutritionUrl": null,
"categories": null,
"ingredients": "Water, sugar",
"allergens": "None",
"nutriscore": { "grade": "B", "score": 3 },
"serving": { "size": "100g", "quantity": 100, "unitBasis": "g" },
"nutriments": {
    "energyKj100g": 200,
    "energyKcal100g": 48,
    "energyKcalServing": 60,
    "proteins100g": 1.2,
    "carbs100g": 10.5,
    "fat100g": 0.3,
    "saturatedFat100g": 0.1,
    "sugars100g": 9.8,
    "fiber100g": 0.5,
    "salt100g": 0.02,
    "sodium100g": 0.008
    }
}
```

---
### Public Endpoints (no authentication required)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new account |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `GET` | `/api/products/:barcode` | Fetch product details from Open Food Facts by barcode (8-14 digits) |
| `GET` | `/health` | Server health check |

### Protected Endpoints (Bearer token required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/auth/me` | Get the current user's profile |
| `GET` | `/api/auth/stats` | Get scan and favorite statistics |
| `PUT` | `/api/auth/update` | Update profile information |
| `POST` | `/api/products` | Create a product record in the database |
| `DELETE` | `/api/products/:barcode` | Delete a product by barcode |
| `GET` | `/api/products/favorites` | List all favorited products |
| `POST` | `/api/products/favorites/:barcode` | Add a product to favorites |
| `DELETE` | `/api/products/favorites/:barcode` | Remove a product from favorites |
| `GET` | `/api/products/favorites/:barcode/check` | Check if a product is favorited |
| `GET` | `/api/products/history` | List scan history (last 50, deduplicated) |
| `POST` | `/api/products/history/:barcode` | Add a scan to history |

Authentication uses JWT Bearer tokens. Include the token in the `Authorization` header: `Authorization: Bearer <token>`.

