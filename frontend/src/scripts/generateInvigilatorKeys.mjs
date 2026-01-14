import sodium from "libsodium-wrappers";

async function generateKeys() {
  await sodium.ready;

  // Generate a keypair for crypto_box (X25519)
  const keyPair = sodium.crypto_box_keypair();

  const publicKeyArray = Array.from(keyPair.publicKey);
  const privateKeyArray = Array.from(keyPair.privateKey);

  // Convert to hex for easier storage in .env
  const publicKeyHex = Array.from(keyPair.publicKey)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const privateKeyHex = Array.from(keyPair.privateKey)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  console.log("\n=== Invigilator Keypair ===");
  console.log("\nPublic Key (Array):", publicKeyArray);
  console.log("Public Key (Hex):", publicKeyHex);
  console.log("\nPrivate Key (Array):", privateKeyArray);
  console.log("Private Key (Hex):", privateKeyHex);
  console.log("\n=== Environment Variables ===");
  console.log("\nAdd to frontend/.env:");
  console.log(`VITE_INVIGILATOR_PRIVATE_KEY=${privateKeyHex}`);
  console.log("\nAdd to frontend/src/crypto/constants.ts:");
  console.log(`export const INVIGILATOR_PUBLIC_KEY = new Uint8Array([${publicKeyArray.join(', ')}]);`);
  console.log("\n⚠️  Keep the private key SECRET! Never commit it to version control.\n");
}

generateKeys();
