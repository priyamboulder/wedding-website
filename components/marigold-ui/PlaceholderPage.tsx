import { SectionHeader } from './SectionHeader';
import { ScrawlNote } from './ScrawlNote';

type PlaceholderPageProps = {
  name: string;
  scrawl?: string;
};

export function PlaceholderPage({ name, scrawl = 'still pinning the moodboard' }: PlaceholderPageProps) {
  return (
    <section className="px-6 md:px-10 py-24 md:py-32">
      <SectionHeader
        scrawl={scrawl}
        heading={name}
        sub="Coming soon"
      />
      <div className="text-center mt-10">
        <ScrawlNote>check back in a hot minute ✿</ScrawlNote>
      </div>
    </section>
  );
}
