import React, { useState } from 'react';
import { MapPin, Phone, Globe, Clock } from 'lucide-react';

interface Resource {
  name: string;
  type: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  distance: string;
}

interface LocalResourcesProps {
  topic: string;
  location: string;
  onComplete: () => void;
}

function LocalResources({ topic, location, onComplete }: LocalResourcesProps) {
  const [resources] = useState<Resource[]>([
    {
      name: 'Legal Aid Society',
      type: 'Legal Clinic',
      address: '123 Main St, City, State',
      phone: '(555) 123-4567',
      website: 'www.legalaid.org',
      hours: 'Mon-Fri: 9AM-5PM',
      distance: '2.3 miles'
    },
    {
      name: 'Community Law Center',
      type: 'Non-Profit Organization',
      address: '456 Oak Ave, City, State',
      phone: '(555) 987-6543',
      website: 'www.communitylawcenter.org',
      hours: 'Mon-Thu: 10AM-6PM',
      distance: '3.1 miles'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Local Legal Resources</h2>
        <p className="mt-2 text-sm text-muted">
          Legal resources and support services near you
        </p>
      </div>

      <div className="space-y-4">
        {resources.map((resource, index) => (
          <div
            key={index}
            className="card"
          >
            <h3 className="text-lg font-semibold text-foreground">
              {resource.name}
            </h3>
            <p className="text-sm text-primary font-medium">{resource.type}</p>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm text-foreground">
                <MapPin className="h-4 w-4 mr-2 text-muted" />
                <span className="flex-1">{resource.address}</span>
                <span className="ml-2 text-xs text-primary">
                  ({resource.distance})
                </span>
              </div>
              
              <div className="flex items-center text-sm text-foreground">
                <Phone className="h-4 w-4 mr-2 text-muted" />
                <a href={`tel:${resource.phone}`} className="text-primary hover:underline">
                  {resource.phone}
                </a>
              </div>
              
              <div className="flex items-center text-sm text-foreground">
                <Globe className="h-4 w-4 mr-2 text-muted" />
                <a
                  href={`https://${resource.website}`}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource.website}
                </a>
              </div>
              
              <div className="flex items-center text-sm text-foreground">
                <Clock className="h-4 w-4 mr-2 text-muted" />
                <span>{resource.hours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4">
        <button
          onClick={onComplete}
          className="btn-primary w-full"
        >
          Continue to Action Steps
        </button>
      </div>
    </div>
  );
}

export default LocalResources;