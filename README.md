# `lancer-express-sdk`

**Lancer Server SDK for Express.js**

---

## **Overview**

`lancer-express-sdk` is the official server-side SDK for integrating **Lancer** with Express.js applications. It simplifies handling **Lancer webhooks** and **authentication workflows**, ensuring secure and efficient communication between your Express.js backend and Lancer's APIs.

---

## **Features**

- **Webhook Handling**: Securely process and verify Lancer webhook events.
- **Authentication Flows**: Authenticate Lancer sessions and manage custom session logic.
- **Express Compatibility**: Designed for use with Express.js middleware.

---

## **Installation**

Install the SDK via npm:

```bash
npm install lancer-express-sdk
```

---

## **Getting Started**

### **1. Initialize the Lancer SDK**

Create a reusable instance of the `lancer` function with your `signingSecret` for signature verification. Store this in a shared module for easy access across your API routes.

```typescript
import lancer from "lancer-express-sdk";

const lancerInstance = lancer({
  signingSecret: "<your-lancer-signing-secret>",
});

export default lancerInstance;
```

| Parameter       | Type     | Required | Description                                     |
|-----------------|----------|----------|-------------------------------------------------|
| `signingSecret` | `string` | Yes      | Secret key used to verify webhook signatures.  |

---

### **2. Set Up API Routes**

#### **Authentication Middleware**

Use the `auth` method to handle session authentication in an Express.js route. Implement your custom logic within the handler.

```typescript
import express from "express";
import lancerInstance from "@/lib/lancer";

const router = express.Router();

router.post(
  "/auth",
  lancerInstance.auth(async ({ token, session }) => {
    console.log("Session Payload:", session);
    
    // Custom authentication logic
    return {
      ownerId: "<user-id>", // Replace with actual user/owner ID
      status: 200, // HTTP status code
    };
  })
);

export default router;
```

| Parameter    | Type                     | Description                                    |
|--------------|--------------------------|------------------------------------------------|
| `token`      | `string`                 | Lancer session token from the `Authorization` header. |
| `session`    | `SessionRequest`         | Payload containing session details from Lancer. |

##### Example Request
```bash
POST /auth
Authorization: Bearer <token>
{
  "sessionId": "abc123"
}
```

##### Example Response
```json
{
  "ownerId": "user123"
}
```

---

#### **Webhook Middleware**

Handle webhook events sent by Lancer with the `webhook` method. Enable verification to ensure payload integrity using your `signingSecret`.

```typescript
import express from "express";
import lancerInstance from "@/lib/lancer";

const router = express.Router();

router.post(
  "/webhook",
  lancerInstance.webhook(async ({ event, payload }) => {
    console.log("Webhook Event:", event);
    
    // Handle event data
    return true;
  }, true)
);

export default router;
```

| Parameter       | Type                                              | Description                                                   |
|-----------------|---------------------------------------------------|---------------------------------------------------------------|
| `handler`       | `(event: WebhookEvent) => Promise<boolean>`       | Callback function to process webhook events.                 |
| `verification`  | `boolean`                                         | Enables payload verification (default: `true`).              |

##### Verification Workflow
- The SDK verifies the `x-timestamp` and `x-signature` headers.
- The payload is signed using HMAC SHA-256 and compared to the provided signature.
- If the verification fails, the SDK responds with `400 Bad Request`.

##### Example Webhook Payload
```json
{
  "id": "evt_123",
  "type": "file.uploaded",
  "payload": {
    "fileId": "file_abc",
    "userId": "user123"
  }
}
```

##### Example Response
```json
{
  "status": 200,
  "message": "Webhook processed successfully"
}
```

---

### **3. Directory Structure**

Organize your Express.js project for modularity:

```plaintext
/lib/
  lancer.js     # Lancer SDK instance
/routes/
  auth.js       # Authentication route
  webhook.js    # Webhook route
```

---

## **API Reference**

### **Function: `lancer`**

#### Constructor
```typescript
lancer({ signingSecret: string });
```

#### Methods

1. **`auth(handler: Function): Middleware`**
   - Handles session authentication using custom logic.
   - **Parameters**:
     - `handler({ token, session }): Promise<{ ownerId: string; status: number }>`

2. **`webhook(handler: Function, verification?: boolean): Middleware`**
   - Processes Lancer webhook events.
   - **Parameters**:
     - `handler({ event, payload }): Promise<boolean>`
     - `verification (optional): boolean`

---

## **Types**

### `SessionAuthGrant`
```typescript
interface SessionAuthGrant {
  ownerId: string;
  status: number;
}
```

### `WebhookEvent`
```typescript
type WebhookEvent<T> = {
  type: string;
  payload: T;
};
```

### `SessionRequest`
```typescript
interface SessionRequest {
  sessionId: string;
  [key: string]: any;
}
```

---

## **Security Best Practices**

1. **Protect Your Signing Secret**: Ensure your `signingSecret` is stored securely in environment variables.
2. **Verify Signatures**: Always enable `verification` for sensitive webhook endpoints.
3. **Rate Limit Your API**: Use rate-limiting middleware to prevent abuse.

---

## **License**

MIT License © 2025 Weekend Dev Labs
