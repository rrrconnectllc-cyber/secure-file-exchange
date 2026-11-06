'use client';

import React, { useState, useEffect } from 'react';

interface AuditEvent {
  id: string;
  eventType: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  actorEmail?: string;
  ipAddress?: string;
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [eventType, setEventType] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '50',
          ...(eventType && { eventType }),
        });

        const res = await fetch(`/api/v1/dashboard/audit?${params}`);
        if (!res.ok) throw new Error('Failed to fetch audit events');

        const data = await res.json();
        setEvents(data.events || []);
        setTotalPages(Math.ceil((data.total || 0) / 50));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [page, eventType]);

  const getEventColor = (eventType: string) => {
    if (eventType.includes('upload')) return 'bg-blue-100 text-blue-800';
    if (eventType.includes('download')) return 'bg-green-100 text-green-800';
    if (eventType.includes('delete')) return 'bg-red-100 text-red-800';
    if (eventType.includes('login')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-navy">Audit Log</h1>
        <p className="text-gray-600 mt-2">Organization activity and security log</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-4">
        <select
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cerulean"
        >
          <option value="">All Events</option>
          <option value="file.uploaded">File Uploaded</option>
          <option value="file.downloaded">File Downloaded</option>
          <option value="file.deleted">File Deleted</option>
          <option value="user.login">User Login</option>
          <option value="user.invited">User Invited</option>
          <option value="room.created">Room Created</option>
          <option value="room.deleted">Room Deleted</option>
        </select>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No audit events</p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {events.map((event) => (
                <div key={event.id} className="p-4 hover:bg-cream transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${getEventColor(event.eventType)}`}>
                        {event.eventType}
                      </span>
                      <span className="text-sm text-gray-600">{event.resourceType}</span>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="ml-0 text-sm text-gray-600">
                    <p>
                      {event.actorEmail ? `by ${event.actorEmail}` : 'System'}{' '}
                      {event.ipAddress && `from ${event.ipAddress}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
