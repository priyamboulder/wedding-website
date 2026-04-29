import { ChunkyButton } from '@/components/marigold/ui/ChunkyButton';
import { ScrollReveal } from '@/components/marigold/ui/ScrollReveal';

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-wine px-6 py-28 text-center md:px-10 md:py-32">
      <span
        aria-hidden="true"
        className="absolute -left-20 -top-32 h-[400px] w-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, var(--pink) 0%, transparent 70%)',
          opacity: 0.18,
          animation: 'bob 6s ease-in-out infinite',
        }}
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-24 -right-16 h-[300px] w-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)',
          opacity: 0.14,
          animation: 'bob 8s ease-in-out infinite 2s',
        }}
      />

      <div className="relative z-10">
        <ScrollReveal>
          <h2
            className="font-serif text-white scrapbook-heading"
            style={{ fontSize: 'clamp(38px, 7vw, 68px)', lineHeight: 1.05, marginBottom: '8px' }}
          >
            Ready to Plan
            <br />
            <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>
              Without the Drama?
            </em>
          </h2>
          <div
            className="font-scrawl text-hot-pink"
            style={{ fontSize: '21px', marginBottom: '36px' }}
          >
            (okay fine, with the right amount of drama)
          </div>
          <ChunkyButton variant="white" href="/pricing">
            Join The Marigold
          </ChunkyButton>
          <p
            className="font-scrawl"
            style={{
              color: 'rgba(237,147,177,0.3)',
              fontSize: '15px',
              marginTop: '20px',
            }}
          >
            free to start · no credit card · your mom can join too
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
