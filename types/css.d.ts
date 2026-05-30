// types/css.d.ts  ATAU  bisa juga diletakkan di root sebagai  custom.d.ts
// File ini memberitahu TypeScript bahwa semua import *.css adalah valid module
declare module '*.css' {
  const content: Record<string, string>
  export default content
}