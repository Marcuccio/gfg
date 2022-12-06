# Visitor Tracking

This script enables visitor tracking by appending a `visitorId` and `sessionId` to a form as hidden inputs, and sending a beacon request when the page becomes hidden.

## Requirements

- A web page with a form element

## Installation

1. Add the script to your web page:

```html
<script src="visitor-tracking.js"></script>
```

2. Ensure that your server has an endpoint for handling the beacon request:


```javascript
let url = "/api/tracking";
```

## Usage

1. When the page loads, the script generates a session ID and appends it to the form as a hidden input.

2. When the page becomes hidden, the script measures the elapsed time since the page was loaded and sends a beacon request containing the `visitorId`, `sessionId`, `rid`, and `elapsedTime` to the server.

## License

This project is licensed under the MIT License.