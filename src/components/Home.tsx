import PricingSection from './PricingSection'
import HeroSection from './HeroSection'
import Heroslider from './HeroSlider'
import CategoriesSection from './CategoriesSection'
// import WhatYouCanCreateSection from './WhatYouCanCreateSection'
import GallerySlider from './GallerySlider'
import HowItWorks from './HowItWorks'
import FeaturesSection from './FeaturesSection'
import AIModelsSection from './AIModelsSection'

const Home = ({onLoginClick}: {onLoginClick: () => void}) => {

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background - Only on Home page */}
      {/* <video
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        className="fixed inset-0 w-full h-full object-cover z-0"
        style={{ objectFit: 'cover' }}
      >
        <source src="https://sin1.contabostorage.com/292910c350ea4c699a44f11998b096be:my-storage-bucket/shuchi_studio/website/0ac28c7c-a863-40b4-8b6d-1442240b41cc.mp4" type="video/mp4" />
      </video> */}

      {/* Content - Above video background */}
      <div className="relative z-10">
       
        {/* Hero Section */}
        <HeroSection onLoginClick={onLoginClick}/>
        {/* Hero Slider Section */}
        <Heroslider />
        {/* Categories Section */}
        <CategoriesSection />
        {/* What You Can Create Section */}
        {/* <WhatYouCanCreateSection /> */}
        {/* Features Section */}
        <FeaturesSection />
        {/* Gallery Slider Section */}
        <GallerySlider />
        {/* AI Models Section */}
        <AIModelsSection />
        {/* How It Works */}
        <HowItWorks onLoginClick={onLoginClick} />
        {/* Pricing Section */}
        <PricingSection />

      </div>
    </div>
  )
}

export default Home
