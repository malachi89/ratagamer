"use client";

import { useRouter } from "next/navigation";
import { deleteEntry } from "@/app/actions/data";

export default function EntryList({
  entries,
  gameId,
  currentUserId,
}: {
  entries: {
    id: string;
    author_id: string;
    author_name: string;
    date: string;
    hours: number;
    title: string;
    content: string;
  }[];
  gameId: string;
  currentUserId: string;
}) {
  const router = useRouter();

  async function onDelete(id: string) {
    if (!confirm("¿Eliminar esta entrada?")) return;
    const res = await deleteEntry(id, gameId);
    if (res?.ok) router.refresh();
  }

  return (
    <div className="entry-list">
      {entries.map((e) => (
        <div className="entry" key={e.id}>
          <div className="entry-header">
            <span className="date">{e.date}</span>
            {e.hours > 0 && <span className="badge dim">⏱ {e.hours}h</span>}
            {e.title && <h3>{e.title}</h3>}
            <span className="entry-author">{e.author_name}</span>
          </div>
          <div className="entry-content">{e.content}</div>
          {e.author_id === currentUserId && (
            <div className="entry-actions">
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(e.id)}>
                Eliminar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
