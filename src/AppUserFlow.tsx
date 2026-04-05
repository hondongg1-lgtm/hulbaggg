import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import UserLoginPage from './pages/UserLoginPage';
import MarketplacePage from './pages/MarketplacePage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import GamePage from './pages/GamePage';
import PrizeDetailsPage from './pages/PrizeDetailsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import MyRewardsPage from './pages/MyRewardsPage';

type FlowStep = 'landing' | 'verification' | 'marketplace' | 'campaignDetail' | 'game' | 'prizeDetails' | 'privacy' | 'terms' | 'myRewards';

export default function AppUserFlow() {
  const { userProfile, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<FlowStep>('landing');
  const [userId, setUserId] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [claimCode, setClaimCode] = useState('');

  useEffect(() => {
    if (userProfile?.id) {
      setUserId(userProfile.id);
      setCurrentStep('marketplace');
    }
  }, [userProfile]);

  if (loading) return null;

  const handleStart = () => {
    setCurrentStep('verification');
  };

  const handleVerified = (newUserId: string) => {
    setUserId(newUserId);
    setCurrentStep('marketplace');
  };

  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setCurrentStep('campaignDetail');
  };

  const handlePlayGame = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setCurrentStep('game');
  };

  const handleGameComplete = (result: any) => {
    if (result.won && result.claimCode) {
      setClaimCode(result.claimCode);
      setCurrentStep('prizeDetails');
    } else {
      setCurrentStep('marketplace');
    }
  };

  const handleBackToMarketplace = () => {
    setSelectedCampaign('');
    setClaimCode('');
    setCurrentStep('marketplace');
  };

  const handleNavigateToPrivacy = () => {
    setCurrentStep('privacy');
  };

  const handleNavigateToTerms = () => {
    setCurrentStep('terms');
  };

  const handleBackToLanding = () => {
    setCurrentStep('landing');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Show Navbar for all steps except landing and verification */}
      {currentStep !== 'landing' && currentStep !== 'verification' && (
        <Navbar onNavigate={setCurrentStep} />
      )}
      
      <main className="flex-1">
        {currentStep === 'landing' && (
          <LandingPage
            onStart={handleStart}
            onNavigateToPrivacy={handleNavigateToPrivacy}
            onNavigateToTerms={handleNavigateToTerms}
          />
        )}

        {currentStep === 'verification' && (
          <UserLoginPage onVerified={handleVerified} onBack={handleBackToLanding} />
        )}

        {currentStep === 'marketplace' && (
          <MarketplacePage
            userId={userId}
            onSelectCampaign={handleSelectCampaign}
          />
        )}

        {currentStep === 'campaignDetail' && (
          <CampaignDetailPage
            campaignId={selectedCampaign}
            userId={userId}
            onBack={handleBackToMarketplace}
            onPlayGame={handlePlayGame}
          />
        )}

        {currentStep === 'game' && (
          <GamePage
            campaignId={selectedCampaign}
            userId={userId}
            onComplete={handleGameComplete}
            onBack={handleBackToMarketplace}
          />
        )}

        {currentStep === 'prizeDetails' && (
          <PrizeDetailsPage
            claimCode={claimCode}
            userId={userId}
            onBack={handleBackToMarketplace}
          />
        )}

        {currentStep === 'privacy' && (
          <PrivacyPolicyPage onBack={handleBackToLanding} />
        )}

        {currentStep === 'terms' && (
          <TermsOfServicePage onBack={handleBackToLanding} />
        )}

        {currentStep === 'myRewards' && (
          <MyRewardsPage 
            userId={userId} 
            onBack={handleBackToMarketplace} 
          />
        )}
      </main>
    </div>
  );
}
