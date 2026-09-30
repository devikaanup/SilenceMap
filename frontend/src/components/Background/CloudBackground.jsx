import React from 'react';
import { PortalFieldCollection } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export default function CloudBackground() {
  return (
    <div
      className="shader-frame"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.65,
        overflow: 'hidden'
      }}
    >
      <PortalFieldCollection
        variant="cloud-field"
        hue={0}
        saturation={1.00}
        brightness={1.00}
      />
    </div>
  );
}
