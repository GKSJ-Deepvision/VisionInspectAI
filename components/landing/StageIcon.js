function IconShell({ children }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-full h-full"
      fill="none"
      stroke="#FF6A3D"
      strokeWidth="1.5"
    >
      {children}
    </svg>
  );
}

export function UploadIcon() {
  return (
    <IconShell>
      <rect x="20" y="20" width="80" height="80" stroke="#242A35" />
      <path d="M60 75V40M60 40L45 55M60 40L75 55" />
      <path d="M35 90H85" strokeDasharray="4 4" stroke="#8B93A1" />
    </IconShell>
  );
}

export function PreprocessIcon() {
  return (
    <IconShell>
      <rect x="15" y="15" width="45" height="45" stroke="#242A35" />
      <rect x="60" y="60" width="45" height="45" />
      <path d="M60 60L15 15M60 60L105 105" strokeDasharray="3 4" stroke="#8B93A1" />
      <path d="M15 15L10 15M15 15L15 10" strokeWidth="2" />
      <path d="M105 105L110 105M105 105L105 110" strokeWidth="2" />
    </IconShell>
  );
}

export function FeatureExtractionIcon() {
  return (
    <IconShell>
      <rect x="20" y="20" width="80" height="80" stroke="#242A35" />
      <path d="M20 40H100M20 60H100M20 80H100" stroke="#8B93A1" strokeDasharray="2 3" />
      <circle cx="45" cy="40" r="3" fill="#FF6A3D" stroke="none" />
      <circle cx="72" cy="60" r="3" fill="#FF6A3D" stroke="none" />
      <circle cx="58" cy="80" r="3" fill="#FF6A3D" stroke="none" />
      <path d="M45 40L72 60L58 80" />
    </IconShell>
  );
}

export function DefectDetectionIcon() {
  return (
    <IconShell>
      <rect x="18" y="18" width="70" height="70" stroke="#242A35" />
      <circle cx="53" cy="53" r="15" />
      <path d="M64 64L100 100" strokeWidth="3" />
      <circle cx="53" cy="53" r="4" fill="#FF6A3D" stroke="none" />
    </IconShell>
  );
}

export function ClassificationIcon() {
  return (
    <IconShell>
      <path d="M60 100C82 100 100 82 100 60C100 38 82 20 60 20" stroke="#242A35" />
      <path d="M60 100C38 100 20 82 20 60C20 38 38 20 60 20" stroke="#242A35" />
      <path d="M60 100V20" stroke="#242A35" />
      <path d="M60 60L85 40" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="4" fill="#FF6A3D" stroke="none" />
    </IconShell>
  );
}

export function DecisionIcon() {
  return (
    <IconShell>
      <path d="M60 15L100 30V58C100 80 84 96 60 105C36 96 20 80 20 58V30L60 15Z" stroke="#242A35" />
      <path d="M42 58L54 70L80 44" strokeWidth="3" />
    </IconShell>
  );
}
