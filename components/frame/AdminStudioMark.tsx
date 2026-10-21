export default function AdminStudioMark({ className = '' }: { className?: string }) {
  return <svg className={`admin-studio-mark ${className}`} viewBox="0 0 200 220" fill="none" aria-hidden="true" focusable="false">
    <path className="studio-mark-shield" d="M100 15 174 45v57c0 48-28 79-74 103-46-24-74-55-74-103V45l74-30Z"/>
    <path className="studio-mark-trace" d="M100 5v20M100 195v20M8 92h28M164 92h28M20 39h20v18M180 39h-20v18M43 171H23v-20M157 171h20v-20"/>
    <circle className="studio-mark-ring" cx="100" cy="101" r="57"/>
    <circle cx="100" cy="101" r="45"/>
    <g className="studio-mark-aperture">
      <path d="m100 56 24 29 20 24M139 79l-13 36-11 28M141 123l-38 7-30 5M101 146l-24-29-20-24M61 123l13-36 11-28M59 79l38-7 30-5"/>
      <path d="m89 82 25 3 12 23-15 21-25-3-12-23 15-21Z"/>
    </g>
    <circle className="studio-mark-node" cx="18" cy="92" r="4"/><circle className="studio-mark-node" cx="182" cy="92" r="4"/>
    <path className="studio-mark-red" d="M84 172h32"/>
  </svg>;
}
