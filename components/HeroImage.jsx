import Image from 'next/image';

const HeroImage = () => {
  return (
    <div className="flex justify-center items-center p-9">
      <Image
        src="/car.jpeg"
        alt="BMW M3"
        width={800}
        height={500}
        className="w-full h-auto max-w-lg"
      />
    </div>
  );
};

export default HeroImage;
