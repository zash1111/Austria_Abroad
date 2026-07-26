import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCIES, CATEGORIES } from '@/lib/currencies';
import { Loader2, Trash2, RefreshCw } from 'lucide-react';

export default function EventFormDialog({ open, onOpenChange, event, trips, defaultDate, defaultTripId }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({ ...event });
    } else {
      setForm({
        title: '',
        trip_id: defaultTripId || trips[0]?.id || '',
        date: defaultDate || new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        all_day: false,
        cost: 0,
        currency: trips.find(t => t.id === (defaultTripId || trips[0]?.id))?.default_currency || 'USD',
        converted_cost: 0,
        category: 'other',
        location: '',
        address: '',
        latitude: '',
        longitude: '',
        notes: '',
        recurrence: 'none',
      });
    }
  }, [event, open, defaultDate, defaultTripId, trips]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const selectedTrip = trips.find(t => t.id === form.trip_id);

  const convertCurrency = async () => {
    if (!form.cost || form.currency === (selectedTrip?.default_currency || 'USD')) {
      set('converted_cost', form.cost || 0);
      return;
    }
    setConverting(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Convert ${form.cost} ${form.currency} to ${selectedTrip?.default_currency || 'USD'}. Return ONLY the number, nothing else.`,
      response_json_schema: { type: 'object', properties: { amount: { type: 'number' } }, required: ['amount'] },
      add_context_from_internet: true,
      model: 'gemini_3_flash'
    });
    set('converted_cost', res.amount);
    setConverting(false);
  };

  const handleSave = async () => {
    if (!form.title?.trim() || !form.trip_id) return;
    setSaving(true);
    const data = {
      title: form.title.trim(),
      trip_id: form.trip_id,
      date: form.date,
      start_time: form.all_day ? '' : form.start_time,
      end_time: form.all_day ? '' : form.end_time,
      all_day: form.all_day,
      cost: Number(form.cost) || 0,
      currency: form.currency,
      converted_cost: Number(form.converted_cost) || Number(form.cost) || 0,
      category: form.category,
      location: form.location || '',
      address: form.address || '',
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      notes: form.notes || '',
      recurrence: form.recurrence,
    };
    if (event) {
      await base44.entities.TripEvent.update(event.id, data);
    } else {
      await base44.entities.TripEvent.create(data);
    }
    setSaving(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!event) return;
    await base44.entities.TripEvent.delete(event.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl w-[calc(100%-1.5rem)]">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold">{event ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Event title" />
          </div>

          <div className="space-y-2">
            <Label>Trip</Label>
            <Select value={form.trip_id || ''} onValueChange={v => set('trip_id', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select trip" />
              </SelectTrigger>
              <SelectContent>
                {trips.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date || ''} onChange={e => set('date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category || 'other'} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={form.all_day || false} onCheckedChange={v => set('all_day', v)} id="allday" />
            <Label htmlFor="allday" className="cursor-pointer">All day event</Label>
          </div>

          {!form.all_day && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={form.start_time || ''} onChange={e => set('start_time', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={form.end_time || ''} onChange={e => set('end_time', e.target.value)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Cost</Label>
              <Input type="number" step="0.01" min="0" value={form.cost || ''} onChange={e => set('cost', e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.currency || 'USD'} onValueChange={v => set('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.currency !== (selectedTrip?.default_currency || 'USD') && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
              <Button size="sm" variant="outline" className="rounded-full" onClick={convertCurrency} disabled={converting}>
                {converting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                Convert
              </Button>
              <span className="text-sm text-muted-foreground">
                → {form.converted_cost || '?'} {selectedTrip?.default_currency || 'USD'}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Recurrence</Label>
            <Select value={form.recurrence || 'none'} onValueChange={v => set('recurrence', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Does not repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location (optional)</Label>
            <Input value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="Location name" />
          </div>

          <div className="space-y-2">
            <Label>Address (optional)</Label>
            <Input value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="Street address" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Latitude (optional)</Label>
              <Input type="number" step="any" value={form.latitude ?? ''} onChange={e => set('latitude', e.target.value)} placeholder="e.g. 48.2082" />
            </div>
            <div className="space-y-2">
              <Label>Longitude (optional)</Label>
              <Input type="number" step="any" value={form.longitude ?? ''} onChange={e => set('longitude', e.target.value)} placeholder="e.g. 16.3738" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Any notes..." rows={2} />
          </div>

          <div className="flex items-center justify-between pt-2">
            {event && (
              <Button variant="destructive" size="sm" className="rounded-full" onClick={handleDelete}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            )}
            <div className={`flex gap-2 ${event ? '' : 'ml-auto'}`}>
              <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button className="rounded-full" onClick={handleSave} disabled={!form.title?.trim() || !form.trip_id || saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {event ? 'Save' : 'Add Event'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}