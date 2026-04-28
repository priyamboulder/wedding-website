// Superseded by lib/useBrandRenderData.ts, which resolves both monogram
// and logo render data. Re-exports here preserve existing imports.
export {
  useBrandRenderData,
  useMonogramRenderData,
  resolveMonogramRenderData,
  resolveLogoRenderData,
  type BrandProfile,
  type BrandRenderData,
  type MonogramRenderData,
  type LogoRenderData,
} from "./useBrandRenderData";
