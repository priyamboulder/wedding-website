/* Decorative mockup illustrations for the home Features section.
   Static markup — no interactivity, just pulled-from-prototype visuals. */

const labelTiny: React.CSSProperties = {
  fontFamily: 'var(--font-syne), sans-serif',
  fontSize: '8px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
};

const serif: React.CSSProperties = {
  fontFamily: 'var(--font-instrument-serif), serif',
};

export function ChecklistMockup() {
  return (
    <div>
      <div className="flex justify-between items-center mb-3.5">
        <div style={{ ...serif, fontSize: '22px', color: 'var(--wine)' }}>Foundation & Vision</div>
        <div style={{ ...labelTiny, color: 'var(--mauve)' }}>PHASE 1 OF 13</div>
      </div>
      <div className="bg-blush rounded-[3px] mb-4" style={{ height: '6px' }}>
        <div className="bg-pink h-full rounded-[3px]" style={{ width: '12%' }} />
      </div>
      <div
        className="bg-gold-light rounded mb-3.5"
        style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--wine)', fontStyle: 'italic' }}
      >
        Compare 3 florists for mandap decor by end of month
      </div>
      <div style={{ ...labelTiny, color: 'var(--mauve)', marginBottom: '8px' }}>COUPLE ALIGNMENT · 0/7</div>
      <div className="flex flex-col gap-1.5">
        {[
          ['Discuss overall wedding vision', 'Apr 27', 'pink'],
          ['Align on core values', 'Apr 28', 'pink'],
          ['Decide how many events total', 'Apr 29', 'gold'],
          ['Agree on tradition lead per ceremony', 'Apr 29', 'gold'],
        ].map(([task, date, hue], i, arr) => (
          <div
            key={String(task)}
            className="flex justify-between"
            style={{
              padding: '8px 0',
              borderBottom: i === arr.length - 1 ? 'none' : '1px solid rgba(75,21,40,0.05)',
              fontSize: '12px',
              color: 'var(--wine)',
            }}
          >
            <span>{task}</span>
            <span style={{ color: `var(--${hue})`, fontSize: '10px' }}>{date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VendorsMockup() {
  return (
    <div>
      <div
        className="rounded-md mb-3.5"
        style={{
          background: 'linear-gradient(135deg, var(--cream), var(--gold-light))',
          padding: '14px',
        }}
      >
        <div style={{ ...labelTiny, color: 'var(--gold)', marginBottom: '4px' }}>CAN'T DECIDE?</div>
        <div style={{ ...serif, fontSize: '18px', color: 'var(--wine)' }}>Spin the Vendor Roulette</div>
        <div style={{ fontSize: '11px', color: 'var(--mauve)', marginTop: '2px' }}>
          We'll surface a random vendor from your open categories
        </div>
      </div>
      <div style={{ ...labelTiny, color: 'var(--gold)', marginBottom: '4px' }}>YOUR VENDOR TEAM</div>
      <div style={{ fontSize: '11px', color: 'var(--mauve)', marginBottom: '10px' }}>
        December 12, 2026 · The Leela Palace · 300 guests · ₹1.5Cr–₹3.6Cr
      </div>
      <div className="flex gap-1.5 mb-3.5 flex-wrap">
        {['Pithi', 'Haldi', 'Sangeet', 'Ceremony'].map((c) => (
          <span
            key={c}
            className="bg-blush text-deep-pink rounded-[2px] font-semibold"
            style={{ fontSize: '9px', padding: '3px 8px' }}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="flex gap-2.5">
        <div className="flex-1 bg-blush rounded flex items-end" style={{ height: '80px', padding: '8px' }}>
          <span
            className="bg-gold text-white rounded-[2px]"
            style={{ ...labelTiny, padding: '2px 8px', letterSpacing: '1px' }}
          >
            TOP MATCH
          </span>
        </div>
        <div className="flex-1 bg-lavender rounded flex items-end" style={{ height: '80px', padding: '8px' }}>
          <span
            className="bg-deep-pink text-white rounded-[2px]"
            style={{ ...labelTiny, padding: '2px 8px', letterSpacing: '1px' }}
          >
            RISING STAR
          </span>
        </div>
      </div>
    </div>
  );
}

export function WorkspacesMockup() {
  return (
    <div>
      <div style={{ ...labelTiny, color: 'var(--pink)', marginBottom: '4px', letterSpacing: '2px' }}>
        WORKSPACE · PHOTOGRAPHY
      </div>
      <div style={{ ...serif, fontSize: '22px', color: 'var(--wine)', marginBottom: '12px' }}>
        Photography
      </div>
      <div className="flex gap-4 mb-4" style={{ fontSize: '11px', color: 'var(--mauve)' }}>
        <span
          style={{
            borderBottom: '2px solid var(--wine)',
            paddingBottom: '4px',
            color: 'var(--wine)',
            fontWeight: 600,
          }}
        >
          Vision & Mood
        </span>
        <span>Group Photos</span>
        <span>Album & Gallery</span>
        <span>Inspiration</span>
      </div>
      <div className="bg-gold-light rounded-md mb-3.5" style={{ padding: '12px 14px' }}>
        <div style={{ ...labelTiny, color: 'var(--gold)', marginBottom: '2px' }}>NOT SURE WHERE TO START?</div>
        <div style={{ ...serif, fontSize: '16px', color: 'var(--wine)' }}>Your photography style in 5 questions</div>
        <div style={{ fontSize: '10px', color: 'var(--mauve)', marginTop: '2px' }}>
          We'll turn your answers into a draft brief, style keywords, and a colour palette
        </div>
      </div>
      <div style={{ ...serif, fontSize: '15px', color: 'var(--wine)', marginBottom: '8px' }}>Style keywords</div>
      <div className="flex gap-1.5 flex-wrap mb-3.5">
        {['joyful', 'nostalgic', 'moody', 'film-grain', 'editorial', 'golden-hour'].map((k) => (
          <span
            key={k}
            className="rounded-[2px] text-wine"
            style={{
              fontSize: '10px',
              padding: '4px 10px',
              border: '1px solid rgba(75,21,40,0.12)',
            }}
          >
            + {k}
          </span>
        ))}
      </div>
      <div style={{ ...serif, fontSize: '15px', color: 'var(--wine)', marginBottom: '4px' }}>Colour & tone</div>
      <div style={{ fontSize: '10px', color: 'var(--mauve)', marginBottom: '8px' }}>
        Slide to see how your photos will feel. The same frame, re-graded in real-time.
      </div>
      <div
        className="rounded flex items-end"
        style={{
          height: '44px',
          background: 'linear-gradient(90deg,#e8d5c4,#f5dcc8,#d4a890)',
          padding: '6px 10px',
        }}
      >
        <span
          className="text-white rounded-[2px]"
          style={{
            ...labelTiny,
            background: 'rgba(0,0,0,0.25)',
            padding: '2px 8px',
            letterSpacing: '1px',
          }}
        >
          SOFTLY EDITORIAL · 55
        </span>
      </div>
    </div>
  );
}

export function GuestsMockup() {
  return (
    <div>
      <div style={{ ...serif, fontSize: '22px', color: 'var(--wine)', marginBottom: '4px' }}>All Guests</div>
      <div style={{ ...labelTiny, color: 'var(--mauve)', marginBottom: '10px' }}>
        99 INVITED · 90 CONFIRMED
      </div>
      <div className="bg-mint rounded-[3px] mb-3" style={{ height: '6px' }}>
        <div className="h-full rounded-[3px]" style={{ background: '#4abe7a', width: '8%' }} />
      </div>
      <div
        className="bg-gold-light rounded mb-3"
        style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--wine)', fontStyle: 'italic' }}
      >
        Add the Sharma family — 4 people, groom's side, Jaipur
      </div>
      <div className="flex gap-2 mb-3">
        <span
          className="bg-wine text-white rounded-[2px] font-semibold"
          style={{ fontSize: '10px', padding: '4px 10px' }}
        >
          All 99
        </span>
        {['Bride 48', 'Groom 46', 'Mutual 5'].map((s) => (
          <span
            key={s}
            className="bg-blush text-deep-pink rounded-[2px]"
            style={{ fontSize: '10px', padding: '4px 10px' }}
          >
            {s}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {[
          ['Mr. Pankaj Agarwal', 'Family friend', 'Partial · 2/4'],
          ['Ms. Zara Ahmed', 'MBA classmate', 'All events'],
          ['Col. Bikram Bajwa', "Nana's cousin", 'Partial · 2/3'],
        ].map(([name, rel, status], i, arr) => (
          <div
            key={String(name)}
            className="flex justify-between"
            style={{
              padding: '6px 0',
              borderBottom: i === arr.length - 1 ? 'none' : '1px solid rgba(75,21,40,0.05)',
              fontSize: '11px',
            }}
          >
            <span style={{ color: 'var(--wine)' }}>
              {name} · <span style={{ color: 'var(--mauve)' }}>{rel}</span>
            </span>
            <span style={{ color: 'var(--mauve)' }}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RegistryMockup() {
  return (
    <div>
      <div style={{ ...serif, fontSize: '20px', color: 'var(--wine)', marginBottom: '10px' }}>Gifts so far</div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-cream rounded" style={{ padding: '10px' }}>
          <div style={{ ...labelTiny, fontSize: '7px', color: 'var(--mauve)', marginBottom: '2px' }}>
            TOTAL RECEIVED
          </div>
          <div style={{ ...serif, fontSize: '22px', color: 'var(--wine)' }}>$8,724</div>
        </div>
        <div className="bg-cream rounded" style={{ padding: '10px' }}>
          <div style={{ ...labelTiny, fontSize: '7px', color: 'var(--mauve)', marginBottom: '2px' }}>
            SHAGUN POOL
          </div>
          <div style={{ ...serif, fontSize: '22px', color: 'var(--wine)' }}>$1,854</div>
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-mint rounded" style={{ padding: '10px' }}>
          <div className="font-semibold" style={{ fontSize: '10px', color: 'var(--wine)' }}>
            Honeymoon fund
          </div>
          <div style={{ ...serif, fontSize: '18px', color: 'var(--wine)' }}>
            $3,300 <span style={{ fontSize: '11px', color: 'var(--mauve)' }}>/ $12,000</span>
          </div>
          <div className="rounded-[2px] mt-1" style={{ background: 'rgba(0,0,0,0.08)', height: '4px' }}>
            <div className="h-full rounded-[2px] bg-gold" style={{ width: '28%' }} />
          </div>
        </div>
        <div className="flex-1 bg-lavender rounded" style={{ padding: '10px' }}>
          <div className="font-semibold" style={{ fontSize: '10px', color: 'var(--wine)' }}>
            Charitable giving
          </div>
          <div style={{ ...serif, fontSize: '18px', color: 'var(--wine)' }}>$1,390</div>
        </div>
      </div>
      <div style={{ ...serif, fontSize: '14px', color: 'var(--wine)', marginBottom: '6px' }}>Top contributors</div>
      {[
        ['01. Anjali & Dev', 'Bride side', '$1,700'],
        ['02. Ravi Chacha', 'Groom side', '$1,600'],
      ].map(([who, side, amt]) => (
        <div
          key={String(who)}
          className="flex justify-between"
          style={{ fontSize: '11px', padding: '4px 0', color: 'var(--wine)' }}
        >
          <span>
            {who} · <span style={{ color: 'var(--mauve)' }}>{side}</span>
          </span>
          <span>{amt}</span>
        </div>
      ))}
    </div>
  );
}

export function StudioMockup() {
  const items: Array<[string, string, string, string]> = [
    ['THE SIGNATURE', 'Monogram', 'OPEN →', 'mauve'],
    ['THE PALETTE & TYPE', 'Style', '100% COMPLETE', 'pink'],
    ['YOUR DIGITAL WELCOME', 'Website', '35%', 'gold'],
    ['THE SUITE', 'Invitations', '41%', 'gold'],
  ];
  return (
    <div>
      <div style={{ ...labelTiny, color: 'var(--mauve)', letterSpacing: '2px', marginBottom: '4px' }}>
        THE STUDIO
      </div>
      <div style={{ ...serif, fontSize: '20px', color: 'var(--wine)', marginBottom: '6px' }}>
        Design every surface of your wedding.
      </div>
      <div style={{ fontSize: '11px', color: 'var(--mauve)', marginBottom: '14px' }}>
        One brand system, four creative surfaces. Everything pulls from your Brand Kit.
      </div>
      <div className="flex flex-col gap-2">
        {items.map(([cap, name, status, hue]) => (
          <div
            key={cap}
            className="bg-cream rounded flex justify-between items-center"
            style={{ padding: '10px 12px' }}
          >
            <div>
              <div style={{ ...labelTiny, color: 'var(--mauve)' }}>{cap}</div>
              <div style={{ ...serif, fontSize: '16px', color: 'var(--wine)' }}>{name}</div>
            </div>
            <div style={{ fontSize: '10px', color: `var(--${hue})` }}>{status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommunityMockup() {
  return (
    <div>
      <div
        className="bg-pink text-white text-center rounded-t"
        style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: '10px',
          fontWeight: 600,
          padding: '6px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
        }}
      >
        LIVE NOW — Ask Marcy Blum anything · join now →
      </div>
      <div style={{ padding: '14px 0' }}>
        <div style={{ ...labelTiny, color: 'var(--pink)', letterSpacing: '2px', marginBottom: '4px' }}>
          COMMUNITY
        </div>
        <div style={{ ...serif, fontSize: '22px', color: 'var(--wine)', marginBottom: '2px' }}>
          the planning circle.
        </div>
        <div
          style={{
            ...serif,
            fontStyle: 'italic',
            fontSize: '13px',
            color: 'var(--mauve)',
            marginBottom: '12px',
          }}
        >
          stories from the studio — and the brides figuring it out alongside you.
        </div>
        <div className="flex gap-3 mb-3" style={{ fontSize: '11px', color: 'var(--mauve)' }}>
          <span
            style={{
              borderBottom: '2px solid var(--wine)',
              paddingBottom: '3px',
              color: 'var(--wine)',
              fontWeight: 600,
            }}
          >
            Editorial
          </span>
          <span>Real Weddings</span>
          <span>Connect</span>
          <span>The Confessional</span>
          <span>The Grapevine</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-peach rounded flex items-end" style={{ height: '70px', padding: '8px' }}>
            <span
              className="bg-wine text-white rounded-[2px]"
              style={{ ...labelTiny, padding: '2px 8px', letterSpacing: '1px' }}
            >
              VENDOR SPOTLIGHTS
            </span>
          </div>
          <div className="flex-1 bg-sky rounded flex items-end" style={{ height: '70px', padding: '8px' }}>
            <span
              className="bg-wine text-white rounded-[2px]"
              style={{ ...labelTiny, padding: '2px 8px', letterSpacing: '1px' }}
            >
              PLANNING TIPS
            </span>
          </div>
        </div>
        <div style={{ ...serif, fontSize: '13px', color: 'var(--wine)', marginTop: '10px' }}>
          What your caterer wishes you knew about multi-day menus
        </div>
      </div>
    </div>
  );
}
