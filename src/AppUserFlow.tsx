import { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { supabase } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import UserLoginPage from './pages/UserLoginPage';
import MarketplacePage from './pages/MarketplacePage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import GamePage from './pages/GamePage';
import PrizeDetailsPage from './pages/PrizeDetailsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

type FlowStep = 'landing' | 'verification' | 'marketplace' | 'campaignDetail' | 'game' | 'prizeDetails' | 'privacy' | 'terms';

export default function AppUserFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('landing');
  const [userId, setUserId] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [claimCode, setClaimCode] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!profile) {
        const { data: profileByFirebase } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('firebase_uid', session.user.id)
          .maybeSingle();

        if (profileByFirebase) {
          setUserId(profileByFirebase.id);
          setCurrentStep('marketplace');
          return;
        }
      }

      if (profile) {
        setUserId(profile.id);
        setCurrentStep('marketplace');
      }
    }
  };

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

  const handleBackToStart = () => {
    setCurrentStep('landing');
    setUserId('');
    setSelectedCampaign('');
    setClaimCode('');
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
    <LanguageProvider>
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
    </LanguageProvider>
  );
}
