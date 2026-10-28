// Match strings first so comment markers inside URLs and code remain untouched.
export function parseJsonc(source) {
  return JSON.parse(source.replace(/"(?:\\.|[^"\\])*"|\/\/[^\r\n]*|\/\*[\s\S]*?\*\//g,
    token => token.startsWith('/') ? token.replace(/[^\r\n]/g, ' ') : token))
}
