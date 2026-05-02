"use client";

import { ui } from "@/lib/ui";
import { useEffect } from "react";

export type MemberForDisplay = {
  userId: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

/** Overlapping circles; entire control opens the members modal. */
export function SquadMemberAvatarStack({
  members,
  onOpen,
}: {
  members: MemberForDisplay[];
  onOpen: () => void;
}) {
  if (members.length === 0) return null;

  const maxShow = 6;
  const shown = members.slice(0, maxShow);
  const overflow = members.length - shown.length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex max-w-full min-w-0 touch-manipulation items-center gap-2 rounded-xl border border-transparent p-1 text-left transition hover:border-zinc-200/80 hover:bg-zinc-50 dark:hover:border-white/10 dark:hover:bg-white/[0.04]"
      aria-haspopup="dialog"
      aria-label={`View all ${members.length} members`}
    >
      <div className="flex shrink-0 items-center ps-1">
        <div className="flex -space-x-2.5">
          {shown.map((m, i) => (
            <div
              key={m.userId}
              className="relative z-10 ring-1 ring-white/90 first:ms-0 dark:ring-white/10"
              style={{ zIndex: shown.length - i }}
            >
              {m.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- external Google avatars
                <img
                  src={m.image}
                  alt=""
                  className="h-10 w-10 rounded-full bg-zinc-100 object-cover sm:h-11 sm:w-11 dark:bg-zinc-800"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-xs font-semibold text-emerald-900 sm:h-11 sm:w-11 sm:text-sm dark:from-neutral-700/55 dark:to-neutral-700/55 dark:text-neutral-200">
                  {initials(m.name)}
                </div>
              )}
            </div>
          ))}
          {overflow > 0 ? (
            <div className="relative z-[12] flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 ring-1 ring-white/80 sm:h-11 sm:w-11 sm:text-sm dark:bg-neutral-600/45 dark:text-neutral-200 dark:ring-white/10">
              +{overflow}
            </div>
          ) : null}
        </div>
      </div>
      <div className="min-w-0 flex-1 sm:flex-initial">
        <p className="text-xs font-medium text-zinc-600 sm:text-sm dark:text-neutral-400">
          {members.length} member{members.length === 1 ? "" : "s"}
        </p>
        <p className="text-[10px] text-zinc-400 group-hover:text-zinc-500 sm:text-xs dark:text-neutral-500 dark:group-hover:text-neutral-400">
          Tap to see everyone
        </p>
      </div>
    </button>
  );
}

export function SquadMembersModal({
  open,
  onClose,
  squadName,
  members,
  canManageMembers,
  currentUserId,
  onRemoveMember,
  onSetRole,
  onLeaveSquad,
}: {
  open: boolean;
  onClose: () => void;
  squadName: string;
  members: MemberForDisplay[];
  canManageMembers?: boolean;
  currentUserId?: string;
  onRemoveMember?: (userId: string) => void;
  onSetRole?: (userId: string, role: "admin" | "member") => void;
  onLeaveSquad?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/40 dark:bg-[#262626]/85"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="members-modal-title"
        className="relative z-10 flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-2xl bg-white sm:max-h-[85vh] sm:rounded-2xl dark:border dark:border-white/10 dark:bg-[#262626] dark:shadow-none"
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3 sm:px-5 sm:py-4 dark:border-white/10">
          <div className="min-w-0">
            <h2
              id="members-modal-title"
              className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-neutral-200"
            >
              Members
            </h2>
            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-neutral-500">{squadName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 touch-manipulation hover:bg-zinc-100 dark:text-neutral-400 dark:hover:bg-white/[0.06]"
          >
            Close
          </button>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-3 sm:py-3">
          {members.map((m) => {
            const showAdmin =
              canManageMembers &&
              currentUserId &&
              m.userId !== currentUserId &&
              onRemoveMember &&
              onSetRole;
            const roleLabel =
              m.role === "admin"
                ? "Admin"
                : m.role === "member"
                  ? "Member"
                  : m.role;
            return (
              <li
                key={m.userId}
                className="flex flex-col gap-2 rounded-xl px-2 py-2.5 hover:bg-zinc-50 sm:flex-row sm:items-center sm:gap-3 sm:px-3 dark:hover:bg-white/[0.04]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {m.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.image}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-full bg-zinc-100 object-cover dark:bg-zinc-800"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-sm font-semibold text-emerald-900 dark:from-neutral-700/55 dark:to-neutral-700/55 dark:text-neutral-200">
                      {initials(m.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900 dark:text-neutral-200">
                      {m.name}
                    </p>
                    {m.email ? (
                      <p className="truncate text-xs text-zinc-500 dark:text-neutral-500">
                        {m.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                  <span className={`${ui.badge}`}>{roleLabel}</span>
                  {showAdmin ? (
                    <>
                      <button
                        type="button"
                        className={`${ui.btnGhost} text-xs`}
                        onClick={() =>
                          onSetRole(
                            m.userId,
                            m.role === "admin" ? "member" : "admin",
                          )
                        }
                      >
                        Make {m.role === "admin" ? "member" : "admin"}
                      </button>
                      <button
                        type="button"
                        className={`${ui.btnGhost} text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/50`}
                        onClick={() => onRemoveMember(m.userId)}
                      >
                        Remove
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        {onLeaveSquad ? (
          <div className="shrink-0 border-t border-zinc-100 px-4 py-3 sm:px-5 dark:border-white/10">
            <button
              type="button"
              className={`${ui.btnSecondary} w-full touch-manipulation sm:w-auto`}
              onClick={() => {
                onLeaveSquad();
              }}
            >
              Leave squad
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
