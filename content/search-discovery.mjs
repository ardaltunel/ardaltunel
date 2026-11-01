// Public IndexNow ownership proof. This value is intentionally published on the
// website; it is not an account password, provider API token, or other secret.
const host = "ardaltunel.vercel.app";
const key = "87460c19a6e98d63ba75ef71624f22bb";

export const indexNowConfig = Object.freeze({
  host,
  key,
  keyLocation: `https://${host}/${key}.txt`,
});
