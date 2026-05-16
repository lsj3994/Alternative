import { DUMMY_POLLS } from '@/lib/data';

export function generateStaticParams() {
  return DUMMY_POLLS.map((poll) => ({
    id: poll.id,
  }));
}

export default function PollLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
