import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, ReportFormData, ItemType, Item } from "./types";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'lost' | 'found';
  onSubmit: (item: Item) => void;
}

const initialFormData: ReportFormData = {
  title: '',
  category: '',
  description: '',
  location: '',
  date: '',
  contact_email: '',
  contact_phone: ''
};

export function ReportModal({ isOpen, onClose, type, onSubmit }: ReportModalProps) {
  const [formData, setFormData] = useState<ReportFormData>(initialFormData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Item = {
      id: Date.now().toString(),
      type: type,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      location: formData.location,
      date: formData.date,
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      status: 'open',
      created_at: new Date().toISOString()
    };
    onSubmit(newItem);
    setFormData(initialFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Report {type === 'lost' ? 'Lost' : 'Found'} Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Item Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., MacBook Pro, Student ID, Water Bottle"
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              required
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the item, including any unique features or identifiers"
            />
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Main Library, Science Building, Cafeteria"
            />
          </div>

          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">Contact Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Contact Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="+254 XXX XXX XXX"
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600">
            Submit Report
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
