import { useEffect, useState } from 'react';
import { PurchasesHeader } from './PurchasesHeader';
import { RoomsPanel } from './rooms/RoomsPanel';
import { ItemsPanel } from './ItemsPanel';
import { PurchasesDashboard } from './dashboard/PurchasesDashboard';
import { useRooms } from './rooms/useRooms';
import { useItems } from './items/useItems';
import type { Room } from '@/types/purchases';

/**
 * Purchases module page.
 *
 * Layout: header, a dashboard with real indicators derived from the item
 * list, then a responsive grid with a Rooms sidebar (1 col on desktop) and
 * an Items panel (2 cols). Rooms and items both have realtime CRUD with
 * optimistic updates. Clicking a room selects it and filters the items list.
 *
 * Selection state lives here so the selected room survives realtime
 * refetches and is cleared automatically if the room is deleted.
 */
export function ComprasPage() {
  const roomsQuery = useRooms();
  const itemsQuery = useItems();
  const rooms = roomsQuery.data;
  const items = itemsQuery.data;
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Keep selection valid across realtime updates: if the selected room is
  // removed (e.g. deleted by the partner), drop it. Otherwise refresh the
  // selected object with the latest data.
  useEffect(() => {
    if (!selectedRoom) return;
    const fresh = rooms?.find((r) => r.id === selectedRoom.id) ?? null;
    if (fresh !== selectedRoom && (fresh === null || fresh.updated_at !== selectedRoom.updated_at)) {
      setSelectedRoom(fresh);
    }
  }, [rooms, selectedRoom]);

  return (
    <div className="animate-fade-in space-y-6">
      <PurchasesHeader
        emoji="🛒"
        title="Compras"
        description="Lista de itens para o novo lar, dividida com seu par."
        breadcrumb={[
          { label: 'Início', to: '/' },
          { label: 'Compras' },
        ]}
      />

      <PurchasesDashboard
        items={items}
        rooms={rooms ?? []}
        isReady={roomsQuery.isSuccess && itemsQuery.isSuccess}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RoomsPanel
            selectedRoomId={selectedRoom?.id ?? null}
            onSelectRoom={(room) =>
              setSelectedRoom((prev) => (prev?.id === room.id ? null : room))
            }
            onClearSelection={() => setSelectedRoom(null)}
          />
        </div>
        <div className="lg:col-span-2">
          <ItemsPanel selectedRoom={selectedRoom} />
        </div>
      </div>
    </div>
  );
}
