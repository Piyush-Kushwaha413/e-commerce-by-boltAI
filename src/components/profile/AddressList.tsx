import { Edit, Trash2, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Address } from '@/lib/supabase';

interface AddressListProps {
  addresses: Address[];
  loading: boolean;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
}

export function AddressList({ addresses, loading, onEdit, onDelete }: AddressListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No addresses found</h3>
        <p className="text-muted-foreground">
          Add your first address to make checkout faster and easier.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <Card key={address.id} className="relative">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{address.full_name}</h3>
                {address.is_default && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(address)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(address.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{address.address_line_1}</p>
              {address.address_line_2 && <p>{address.address_line_2}</p>}
              <p>
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p>{address.country}</p>
              {address.phone && (
                <p className="flex items-center mt-2">
                  <span className="font-medium">Phone:</span>
                  <span className="ml-1">{address.phone}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}