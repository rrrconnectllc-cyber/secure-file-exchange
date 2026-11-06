'use client';

import React, { useState, useEffect } from 'react';

interface Room {
  id: string;
  name: string;
  description?: string;
  fileCount: number;
  createdAt: string;
  createdBy: { email: string };
  isArchived: boolean;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'archived'>('active');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`/api/v1/dashboard/rooms?archived=${filter === 'archived'}`);
        if (!res.ok) throw new Error('Failed to fetch rooms');
        const data = await res.json();
        setRooms(data.rooms || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [filter]);

  const handleArchiveRoom = async (roomId: string) => {
    if (!confirm('Archive this room? Files will remain accessible.')) return;

    try {
      const res = await fetch(`/api/v1/dashboard/rooms/${roomId}/archive`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to archive room');

      setRooms(rooms.filter((r) => r.id !== roomId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive room');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Delete this room and all its files? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/v1/dashboard/rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete room');

      setRooms(rooms.filter((r) => r.id !== roomId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-navy">Exchange Rooms</h1>
        <p className="text-gray-600 mt-2">Monitor and manage organization rooms</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            filter === 'active'
              ? 'border-cerulean text-cerulean'
              : 'border-transparent text-gray-600 hover:text-navy'
          }`}
        >
          Active Rooms
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            filter === 'archived'
              ? 'border-cerulean text-cerulean'
              : 'border-transparent text-gray-600 hover:text-navy'
          }`}
        >
          Archived Rooms
        </button>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {filter === 'active' ? 'No active rooms' : 'No archived rooms'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-navy flex-1">{room.name}</h3>
                  {room.isArchived && (
                    <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded">
                      Archived
                    </span>
                  )}
                </div>

                {room.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{room.description}</p>
                )}

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <p>📁 {room.fileCount} files</p>
                  <p>👤 Created by {room.createdBy.email}</p>
                  <p>📅 {new Date(room.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {!room.isArchived && (
                    <button
                      onClick={() => handleArchiveRoom(room.id)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="flex-1 px-3 py-2 text-sm bg-red-50 text-raspberry rounded hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
