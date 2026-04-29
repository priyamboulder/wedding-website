import styles from './Mockup.module.css';

type SurfaceProps = {
  label: string;
  title: string;
  status: string;
  statusColor?: string;
  detail?: string;
};

function Surface({ label, title, status, statusColor = 'var(--mauve)', detail }: SurfaceProps) {
  return (
    <div className={styles.surfaceRow}>
      <div>
        <div className={styles.surfaceLabel}>{label}</div>
        <div className={styles.surfaceTitle}>{title}</div>
        {detail && (
          <div style={{ fontSize: 9, color: 'var(--mauve)', marginTop: 2, fontStyle: 'italic' }}>
            {detail}
          </div>
        )}
      </div>
      <div style={{ fontSize: 10, color: statusColor, fontWeight: 600 }}>{status}</div>
    </div>
  );
}

export function StudioMockup() {
  return (
    <div className={styles.mockup}>
      <div className={styles.label} style={{ fontSize: 8, letterSpacing: 2, marginBottom: 4 }}>
        THE STUDIO
      </div>
      <div className={styles.title} style={{ fontSize: 20, marginBottom: 6 }}>
        Design every surface of your wedding.
      </div>
      <div style={{ fontSize: 11, color: 'var(--mauve)', marginBottom: 14 }}>
        Creative completion <span style={{ color: 'var(--pink)', fontWeight: 600 }}>32%</span> · One brand system, every surface.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Surface label="THE SIGNATURE" title="Monogram" status="OPEN →" />
        <Surface label="THE WORDMARK" title="Wedding Logo" status="48%" statusColor="var(--gold)" />
        <Surface
          label="THE PALETTE & TYPE"
          title="Style"
          status="100%"
          statusColor="var(--pink)"
          detail="RAJWARA ROSE · EDITORIAL HOUSE"
        />
        <Surface
          label="YOUR DIGITAL WELCOME"
          title="Website"
          status="35%"
          statusColor="var(--gold)"
        />
        <Surface label="THE SUITE" title="Invitations" status="41%" statusColor="var(--gold)" />
      </div>
    </div>
  );
}
