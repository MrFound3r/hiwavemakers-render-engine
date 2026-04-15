// apps/web/components/dashboard/RoomsSidebar.tsx
"use client";

import type { Room } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface RoomsSidebarProps {
  rooms: Room[];
  selectedRoom: string | null;
  isLoading: boolean;
  onSelectRoom: (roomUuid: string) => void;
}

export function RoomsSidebar({ rooms, selectedRoom, isLoading, onSelectRoom }: RoomsSidebarProps) {
  return (
    <aside className="hidden w-[280px] border-r bg-background lg:block">
      <div className="border-b px-5 py-4">
        <h1 className="text-lg font-semibold">Class Dashboard</h1>
        <p className="text-sm text-muted-foreground">Rooms and student video operations</p>
      </div>

      <div className="p-3">
        {isLoading ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">No rooms found.</p>
        ) : (
          <div className="space-y-1">
            {rooms.map((room) => {
              const active = selectedRoom === room.room_uuid;

              return (
                <button
                  key={room.room_uuid}
                  type="button"
                  onClick={() => onSelectRoom(room.room_uuid)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                    active ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted",
                  )}>
                  <div className="truncate text-sm font-medium">Class: {room.room_uuid.slice(0, 8)}...</div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">{room.room_uuid}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
