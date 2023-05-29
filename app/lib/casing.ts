export function kebabCaseToCamelCase(text: string) {
  return text.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

export function camelCaseToKebabCase(text: string) {
  return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1) 
}
