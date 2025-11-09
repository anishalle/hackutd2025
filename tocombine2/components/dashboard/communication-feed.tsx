type Communication = {
  id: string;
  channel: "slack" | "email";
  author: string;
  time: string;
  summary: string;
  ticketId: string;
};

type CommunicationFeedProps = {
  items: Communication[];
};

const channelBadge: Record<Communication["channel"], string> = {
  slack: "bg-emerald-500/10 text-emerald-100 border border-emerald-400/30",
  email: "bg-blue-500/10 text-blue-100 border border-blue-400/30",
};

export function CommunicationFeed({ items }: CommunicationFeedProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/50">
            <span>{item.time}</span>
            <span className={`rounded-full px-2 py-0.5 ${channelBadge[item.channel]}`}>
              Generated from {item.channel}
            </span>
          </div>
          <p className="mt-2 font-semibold">{item.summary}</p>
          <p className="text-white/60">via {item.author}</p>
          <p className="mt-3 text-xs text-white/50">
            Linked ticket • {item.ticketId}
          </p>
        </article>
      ))}
    </div>
  );
}
