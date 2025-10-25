import PocketBase from "pocketbase";

// Initialize PocketBase client with typed collections
const pb = new PocketBase("https://api.worldofconnecta.com");

// Optional: Enable auto cancellation for duplicate requests
pb.autoCancellation(false);

export default pb;
