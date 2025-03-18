import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainSection from './MainSection';
import Image1 from '../../images/components.png';

const Components = () => {
  const navigate = useNavigate();

  return (
    <MainSection
      title="Components"
      subtitle="Explore the components of Shape-Kit"
      buttonText="Next: Device Setup"
      onButtonClick={() => navigate('../camera-connection')}
    >
      <div className="space-y-6">
        <p className="text-lg">
          Shape-Kit is a Hybrid Toolkit that Consists of Two Modules of Analog
          Shape-Kits and A Tracking Module
        </p>
        <div className="w-full">
          <img
            src={Image1}
            alt="Components of Shape-Kit"
            className="w-full object-cover rounded-lg"
          />
        </div>
      </div>
    </MainSection>
  );
};

export default Components;
