import * as Ably from "ably";

export let realtime = null; // Initialize realtime as null

export function initializeAblyClient(clientId) {
  // Initialize the Ably client with the new clientId
  realtime = new Ably.Realtime({
    authUrl: "http://localhost:5000/ably/auth",
    authParams: { clientId },
  });

  realtime.connection.once("connected", () => {
    const user = realtime.auth.tokenDetails.clientId || "anonymous";
    const capability = realtime.auth.tokenDetails.capability;
    console.log(`You are now connected to Ably \nUser: ${user}\nCapabilities: ${capability}`);
  });
}
