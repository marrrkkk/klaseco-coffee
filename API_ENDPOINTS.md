# KlaséCo Ordering System API Endpoints

This document describes the API endpoints implemented for the KlaséCo ordering system.

## Menu API Endpoints

### Get All Categories with Menu Items

-   **GET** `/api/menu/categories`
-   **Description**: Returns all categories with their available menu items
-   **Response**: JSON with categories and nested menu items

### Get Menu Items by Category

-   **GET** `/api/menu/categories/{category}/items`
-   **Description**: Returns available menu items for a specific category
-   **Parameters**: `category` - Category ID
-   **Response**: JSON with menu items array

### Get Available Addons

-   **GET** `/api/menu/addons`
-   **Description**: Returns all available addons
-   **Response**: JSON with addons array

### Get Complete Menu

-   **GET** `/api/menu/complete`
-   **Description**: Returns complete menu data (categories, items, and addons)
-   **Response**: JSON with categories and addons

## Order API Endpoints

### Create New Order (Customer)

-   **POST** `/api/orders`
-   **Description**: Creates a new order
-   **Request Body**:

```json
{
    "customer_name": "John Doe",
    "customer_phone": "09123456789",
    "items": [
        {
            "menu_item_id": 1,
            "quantity": 1,
            "size": "daily",
            "variant": "hot",
            "addons": [
                {
                    "addon_id": 1,
                    "quantity": 1
                }
            ]
        }
    ]
}
```

### Get Order Status (Customer Tracking)

-   **GET** `/api/orders/{order}/status`
-   **Description**: Returns order status for customer tracking
-   **Parameters**: `order` - Order ID
-   **Response**: JSON with order status information

### Mark Order as Served (Customer Confirmation)

-   **PATCH** `/api/orders/{order}/served`
-   **Description**: Marks order as served when customer confirms receipt
-   **Parameters**: `order` - Order ID

### Get Pending Orders (Cashier Queue)

-   **GET** `/api/orders/pending`
-   **Description**: Returns all pending orders for cashier review
-   **Response**: JSON with pending orders array

### Get Accepted Orders (Barista Queue)

-   **GET** `/api/orders/accepted`
-   **Description**: Returns accepted orders for barista preparation
-   **Response**: JSON with accepted orders array

### Get Orders by Status

-   **GET** `/api/orders/status/{status}`
-   **Description**: Returns orders filtered by status
-   **Parameters**: `status` - Order status (pending, accepted, preparing, ready, served, cancelled)

### Get Order Details

-   **GET** `/api/orders/{order}`
-   **Description**: Returns complete order details with items and addons
-   **Parameters**: `order` - Order ID

### Accept Order (Cashier Action)

-   **PATCH** `/api/orders/{order}/accept`
-   **Description**: Accepts a pending order
-   **Parameters**: `order` - Order ID
-   **Request Body**:

```json
{
    "cashier_id": 1
}
```

### Reject Order (Cashier Action)

-   **PATCH** `/api/orders/{order}/reject`
-   **Description**: Rejects a pending order
-   **Parameters**: `order` - Order ID
-   **Request Body**:

```json
{
    "cashier_id": 1
}
```

### Mark Order Ready (Barista Action)

-   **PATCH** `/api/orders/{order}/ready`
-   **Description**: Marks order as ready for pickup
-   **Parameters**: `order` - Order ID
-   **Request Body**:

```json
{
    "barista_id": 1
}
```

### Update Order Status (General)

-   **PATCH** `/api/orders/{order}/status`
-   **Description**: Updates order status with validation
-   **Parameters**: `order` - Order ID
-   **Request Body**:

```json
{
    "status": "accepted",
    "user_id": 1
}
```

## Order Status Flow

1. **PENDING** - Order placed by customer, waiting for cashier review
2. **ACCEPTED** - Order accepted by cashier, sent to barista
3. **PREPARING** - Order being prepared by barista (optional status)
4. **READY** - Order ready for customer pickup
5. **SERVED** - Order confirmed as received by customer
6. **CANCELLED** - Order rejected by cashier

## Size and Variant Options

### Sizes

-   `daily` - ₱70 base price
-   `extra` - ₱90 (1.3x multiplier)

### Variants

-   `hot` - Hot beverage
-   `cold` - Cold beverage

## Error Responses

All endpoints return consistent error responses:

```json
{
    "success": false,
    "message": "Error description",
    "error": "Detailed error information"
}
```

Common HTTP status codes:

-   `200` - Success
-   `201` - Created (for new orders)
-   `404` - Not Found
-   `422` - Validation Error
-   `500` - Server Error
