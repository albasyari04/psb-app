// custom.d.ts — letakkan file ini di ROOT project (sejajar dengan package.json)
// Memberitahu TypeScript bahwa import file .css adalah side-effect yang valid

declare module '*.css' {
  const content: Record<string, string>
  export default content
}