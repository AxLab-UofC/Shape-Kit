import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainSection from './MainSection';
import heroImage from '../../images/hero.png';

const HomeContent = () => {
  const navigate = useNavigate();

  return (
    <MainSection
      title="ShapeKit"
      subtitle="A Design Toolkit for Crafting On-Body Expressive Haptics"
      buttonText="Learn More"
      onButtonClick={() => navigate('components')}
    >
      <img
        src={heroImage}
        alt="ShapeKit hero"
        className="w-full h-auto object-contain"
      />
    </MainSection>
  );
};

export default HomeContent;
