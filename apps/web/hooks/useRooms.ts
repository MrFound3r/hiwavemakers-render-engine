// apps/web/hooks/useRooms.ts
"use client";

import { useEffect, useState } from "react";
import type { Room } from "@/types/dashboard";
import { fetchRooms } from "@/lib/dashboard/api";

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoadingRooms(true);
      try {
        const data = await fetchRooms();
        if (isMounted) setRooms(data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        if (isMounted) setRooms([]);
      } finally {
        if (isMounted) setIsLoadingRooms(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    rooms,
    isLoadingRooms,
  };
}
