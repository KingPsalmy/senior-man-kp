/** Keep receipt credentials out of HTTP URLs and referrer headers. */
export function downloadPortalPath(email: string, reference: string) {
  return "/my-downloads#" + new URLSearchParams({ email, reference }).toString()
}
