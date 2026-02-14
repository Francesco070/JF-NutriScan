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

- DELETE /api/products/"barcode"
    - Delete a product by barcode.
