import Image from 'next/image';
import React from 'react';

interface EaglesLogoProps {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

/**
 * Renders the Eagles competition logo.
 * Uses `next/image` for optimized loading.
 *
 * @param {number} [width=100] - The desired width of the logo.
 * @param {number} [height=100] - The desired height of the logo.
 * @param {string} [className] - Optional CSS class names to apply to the image.
 * @param {string} [alt='Eagles Competition Logo'] - Alternative text for the image, for accessibility.
 */
const EaglesLogo: React.FC<EaglesLogoProps> = ({
  width = 100,
  height = 100,
  className,
  alt = 'Eagles Competition Logo',
}) => {
  return (
    <Image
      src="/images/eagles-logo.svg"
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority // Prioritize loading for important logos
    />
  );
};

export default EaglesLogo;
