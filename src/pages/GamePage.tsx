import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Gift, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Confetti from '../components/Confetti';

interface GamePageProps {
  campaignId: string;
  userId: string;
  onComplete: (result: GameResult) => void;
  onBack: () => void;
}

interface GameResult {
  won: boolean;
  claimCode?: string;
  prizeId?: string;
  prizeName?: string;
  storeName?: string;
  consolation?: boolean;
  consolationPrize?: string;
}

export default function GamePage({ campaignId, userId, onComplete, onBack }: GamePageProps) {
  const { t, language } = useLanguage();
  const [gameState, setGameState] = useState<'ready' | 'revealing' | 'revealed'>('ready');
  const [result, setResult] = useState<GameResult | null>(null);

  const playGame = async () => {
    setGameState('revealing');

    try {
      // Call the play_game function
      const { data, error } = await supabase.rpc('play_game', {
        p_user_id: userId,
        p_campaign_id: campaignId
      });

      if (error) throw error;

      // Simulate suspense (2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));

      if (data.success) {
        // Get campaign and prize details
        const { data: campaignData } = await supabase
          .from('campaigns')
          .select(`
            store_name,
            consolation_prize,
            prizes (
              id,
              name
            )
          `)
          .eq('id', campaignId)
          .single();

        let gameResult: GameResult;

        if (data.won) {
          // Winner!
          const prize = campaignData?.prizes?.find((p: any) => p.id === data.prize_id);
          gameResult = {
            won: true,
            claimCode: data.claim_code,
            prizeId: data.prize_id,
            prizeName: prize?.name || 'جائزة',
            storeName: campaignData?.store_name || 'المحل'
          };
        } else {
          // Consolation
          gameResult = {
            won: false,
            consolation: true,
            consolationPrize: campaignData?.consolation_prize || 'خصم 2 ريال',
            storeName: campaignData?.store_name || 'المحل'
          };
        }

        setResult(gameResult);
        setGameState('revealed');
      } else {
        alert(data.message || 'حدث خطأ');
        onBack();
      }
    } catch (error) {
      console.error('Game error:', error);
      alert(language === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred');
      onBack();
    }
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-secondary-500 to-primary-700 flex flex-col items-center justify-center p-4 animate-fade-in relative overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse"></div>

        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-white/80 hover:text-white transition-all hover:scale-110 bg-white/10 rounded-full p-3 backdrop-blur-sm hover:bg-white/20 z-10"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        <div className="text-center mb-12 animate-slide-up relative z-10">
          <div className="relative w-36 h-36 mx-auto mb-8">
            <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30">
              <Gift className="w-20 h-20 text-white drop-shadow-2xl" />
            </div>
            <div className="absolute -top-3 -right-3 text-4xl animate-bounce">🎁</div>
            <div className="absolute -bottom-3 -left-3 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 animate-fade-in-up drop-shadow-2xl">
            {language === 'ar' ? 'جاهز للعب؟' : 'Ready to Play?'}
          </h1>
          <p className="text-white/90 text-xl sm:text-2xl animate-fade-in-up font-semibold">
            {language === 'ar' ? 'اضغط الزر واكتشف جائزتك الفورية!' : 'Tap the button to reveal your prize!'}
          </p>
        </div>

        <button
          onClick={playGame}
          className="group relative overflow-hidden animate-scale-in transform hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
          <div className="relative px-12 py-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 rounded-full text-white font-black text-2xl sm:text-3xl transition-all shadow-2xl border-4 border-white/50">
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 animate-wiggle" />
              <span className="drop-shadow-lg">{language === 'ar' ? '🎲 اسحب الآن!' : '🎲 Reveal Now!'}</span>
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 animate-wiggle" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        </button>

        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border-2 border-white/20 animate-fade-in">
          <p className="text-white/90 text-sm sm:text-base font-semibold">
            {language === 'ar' ? '⏰ محاولة واحدة يومياً لكل محل' : '⏰ One try per store per day'}
          </p>
        </div>
      </div>
    );
  }

  if (gameState === 'revealing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 animate-pulse"></div>
        <div className="text-center relative z-10">
          <div className="relative w-48 h-48 mx-auto mb-8">
            <div className="absolute inset-0 bg-yellow-400/40 rounded-full animate-ping"></div>
            <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Gift className="w-24 h-24 text-white animate-bounce drop-shadow-2xl" />
                <div className="absolute -top-2 -right-2 text-3xl animate-wiggle">✨</div>
                <div className="absolute -bottom-2 -left-2 text-3xl animate-wiggle" style={{ animationDelay: '0.3s' }}>⚡</div>
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-black text-white mb-6 animate-pulse drop-shadow-lg">
            {language === 'ar' ? 'جاري الكشف عن جائزتك...' : 'Revealing Your Prize...'}
          </h2>
          <div className="flex gap-3 justify-center">
            <div className="w-4 h-4 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }}></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }}></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-white/80 text-lg mt-6 animate-pulse">
            {language === 'ar' ? 'لحظات قليلة...' : 'Just a moment...'}
          </p>
        </div>
      </div>
    );
  }

  if (gameState === 'revealed' && result) {
    if (result.won) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-success-400 via-primary-500 to-success-600 flex flex-col items-center justify-center p-4 animate-fade-in relative overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <Confetti />
          <div className="text-center animate-scale-in z-10">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-5xl font-bold text-white mb-4">
              {language === 'ar' ? 'مبروك!' : 'Congratulations!'}
            </h1>
            <p className="text-2xl text-white/90 mb-8">
              {language === 'ar' ? 'فزت بـ' : 'You won'}
            </p>

            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 mb-8 border-4 border-white/50">
              <div className="text-4xl font-bold text-white mb-4">
                {result.prizeName}
              </div>
              <p className="text-white/90 mb-6">
                {language === 'ar' ? 'من' : 'from'} {result.storeName}
              </p>

              <div className="bg-white rounded-2xl p-6 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {language === 'ar' ? 'كود الاستلام' : 'Claim Code'}
                </p>
                <div className="text-4xl font-mono font-bold text-blue-600 tracking-wider">
                  {result.claimCode}
                </div>
              </div>

              <p className="text-sm text-white/70">
                {language === 'ar'
                  ? 'احفظ الكود وأرِه للمحل لاستلام جائزتك'
                  : 'Save this code and show it at the store'}
              </p>
            </div>

            <button
              onClick={() => onComplete(result)}
              className="px-8 py-4 bg-white hover:bg-gray-100 text-success-600 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-xl"
            >
              {language === 'ar' ? 'عرض تفاصيل الجائزة' : 'View Prize Details'}
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-400 via-danger-400 to-secondary-500 flex flex-col items-center justify-center p-4 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="text-center animate-scale-in max-w-md mx-auto">
            <div className="text-9xl mb-8 animate-bounce-slow">😅</div>
            <h1 className="text-5xl font-black text-white mb-6 drop-shadow-lg">
              {language === 'ar' ? 'حظ أوفر المرة القادمة!' : 'Better Luck Next Time!'}
            </h1>

            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              {language === 'ar'
                ? 'لا تستسلم! جرّب محل آخر وقد تفوز بجائزة رائعة'
                : "Don't give up! Try another store and you might win a great prize"}
            </p>

            <button
              onClick={onBack}
              className="px-10 py-5 bg-white hover:bg-gray-100 text-secondary-600 rounded-2xl font-black text-xl transition-all transform hover:scale-110 active:scale-95 shadow-2xl flex items-center gap-3 mx-auto"
            >
              <TrendingUp className="w-6 h-6" />
              {language === 'ar' ? 'جرّب محل آخر' : 'Try Another Store'}
            </button>
          </div>
        </div>
      );
    }
  }

  return null;
}
