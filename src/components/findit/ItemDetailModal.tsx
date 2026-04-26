import { Package, MapPin, Calendar, FileText, Mail, Phone, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Item } from "./types";

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Item Details</DialogTitle>
        </DialogHeader>

        <div>
          <Badge variant={item.type === 'lost' ? 'destructive' : 'default'} className="mb-4">
            {item.type === 'lost' ? 'LOST ITEM' : 'FOUND ITEM'}
          </Badge>

          <h4 className="text-2xl font-bold mb-3">{item.title}</h4>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2">
              <Package className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Category</div>
                <div className="font-medium">{item.category}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-medium">{item.location}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-medium">{new Date(item.date).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Description</div>
                <div className="font-medium">{item.description}</div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <p className="text-sm text-gray-600 mb-3">
              If this is your item, contact the reporter:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-blue-600" />
                <a href={`mailto:${item.contact_email}`} className="text-blue-600 hover:underline">
                  {item.contact_email}
                </a>
              </div>
              {item.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-600" />
                  <a href={`tel:${item.contact_phone}`} className="text-green-600 hover:underline">
                    {item.contact_phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
