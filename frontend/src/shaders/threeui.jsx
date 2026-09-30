import React from 'react';
import {
  CloudField,
  DimensionalField,
  DataField,
  TopologyField,
  VoidField,
  ExpanseField,
  StarPortal,
  ParticleOrbField
} from './neuform-isolated/NeuformIsolatedEffects';
import { PredictiveArcCanvas } from './predictive-arc/PredictiveArcCollection';
import './threeui.css';

export function PortalFieldCollection({ variant = 'cloud-field', ...props }) {
  switch (variant) {
    case 'cloud-field':
    case 'cloud':
      return <CloudField {...props} />;
    case 'dimensional-field':
    case 'dimensional':
      return <DimensionalField {...props} />;
    case 'data-field':
    case 'vertex9':
      return <DataField {...props} />;
    case 'topology-field':
    case 'topology':
      return <TopologyField {...props} />;
    case 'void-field':
    case 'void':
      return <VoidField {...props} />;
    case 'expanse-field':
    case 'expanse':
      return <ExpanseField {...props} />;
    case 'star-portal':
    case 'starfield':
      return <StarPortal {...props} />;
    case 'particle-orb':
      return <ParticleOrbField {...props} />;
    default:
      return <CloudField {...props} />;
  }
}

export {
  PredictiveArcCanvas,
  CloudField,
  DimensionalField,
  DataField,
  TopologyField,
  VoidField,
  ExpanseField,
  StarPortal,
  ParticleOrbField
};
