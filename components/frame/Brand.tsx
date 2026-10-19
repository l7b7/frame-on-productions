export function BrandSymbol() {
  return <svg className="brand-symbol-art" viewBox="335 250 650 540" aria-hidden="true" focusable="false"><image href="/brand-logo-transparent.png" width="1280" height="1280" /></svg>;
}
export default function Brand({ href = '/ar' }: { href?: string }) {
  return <a href={href} className="brand-lockup" aria-label="FRAME ON PRODUCTIONS">
    <span className="brand-symbol" aria-hidden="true"><BrandSymbol /></span>
    <span className="brand-lettering" dir="ltr">FRAME <b>ON</b><small>PRODUCTIONS</small></span>
  </a>;
}
